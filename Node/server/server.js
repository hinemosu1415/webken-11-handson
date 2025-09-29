import http from 'http';

// サーバーの代わりの todos 配列を定義
let todos = [
    { id: 1, title: '授業に出る', completed: false },
    { id: 2, title: 'Web研出席', completed: true },
    { id: 3, title: 'プログラミングをする', completed: false }
];

const server = http.createServer((request, response) => {
    const url = request.url;
    const method = request.method;

    // CORS設定
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        // プリフライトリクエストの処理
        response.writeHead(204); // No Content
        response.end();
        return;
    }

    // GET すべてのTodoを返す
    if (url === '/get-todo' && method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(todos));
    }

    // POST 新しいTodoを追加
    else if (url === '/post-todo' && method === 'POST') {
        let body = '';
        request.on('data', (data) => {
            body += data.toString(); // 受け取ったデータを文字列として結合
        });
        request.on('end', () => {
            try {
                const { title } = JSON.parse(body);
                const newTodo = {
                    id: todos.length ? todos[todos.length - 1].id + 1 : 1,
                    title,
                    completed: false
                };
                todos.push(newTodo);

                response.writeHead(201, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(newTodo));
            } catch {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '不正なJSON形式です' }));
            }
        });
    }

    // PUT 特定のTodoを更新
    else if (url.startsWith('/put-todo/') && method === 'PUT') {
        const id = parseInt(url.split('/')[2]);
        let body = '';
        request.on('data', (data) => {
            body += data.toString(); // 受け取ったデータを文字列として結合
        });
        request.on('end', () => {
            try {
                const data = JSON.parse(body);
                const todo = todos.find(t => t.id === id);

                if (!todo) {
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: `id=${id} のTodoは存在しません` }));
                    return;
                }

                if (data.title !== undefined) todo.title = data.title;
                if (data.completed !== undefined) todo.completed = data.completed;

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(todo));
            } catch {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '不正なJSON形式です' }));
            }
        });
    }

    // DELETE 特定のTodoを削除
    else if (url.startsWith('/delete-todo/') && method === 'DELETE') {
        const id = parseInt(url.split('/')[2]);
        const index = todos.findIndex(t => t.id === id);

        if (index === -1) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: `id=${id} のTodoは存在しません` }));
            return;
        }

        todos.splice(index, 1);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: `id=${id} のTodoを削除しました` }));
    }

    // 上記以外 → 404
    else {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'エンドポイントが存在しません' }));
    }
});

server.listen(8000, () => {
    console.log('サーバーが http://localhost:8000 で起動しました');
});
