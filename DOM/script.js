// タグで要素を取得（h1 を取得）
const hTag = document.getElementsByTagName("h1")[0];

// idで要素を取得（入力欄）
const addInput = document.getElementById("add-input");

// classで要素を取得（ボタンは1つだけなので[0]を指定）
const addButton = document.getElementsByClassName("add-todo")[0];

// ul 要素を取得（Todoリスト本体）
const todoList = document.getElementById("todo-list");

// h1のテキストを変更（DOM操作の例）
hTag.textContent = "私のTodoリスト";

// ボタンクリックで新しいTodoを追加する処理
addButton.addEventListener("click", () => {
  const text = addInput.value.trim();
  if (text !== "") {
    const li = document.createElement("li");
    li.textContent = text;
    todoList.appendChild(li);
    addInput.value = ""; // 入力欄をクリア
  }
});