import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'

const app = new Hono()

app.use('*', cors())

// DBファイルを指定（なければ自動作成）
const db = new Database('../db/todos.db')

// todos テーブルを作成（初回だけ実行される）
db.prepare(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`).run()

app.get('/get-todo', (c) => {
  const rows = db.prepare('SELECT * FROM todos').all()
  return c.json(rows.map(r => ({
    id: r.id,
    title: r.title,
    completed: !!r.completed
  })))
})

app.post('/post-todo', async (c) => {
  let data
  try {
    data = await c.req.json()
  } catch {
    return c.json({ success: false, error: '不正なJSONです' }, 400)
  }

  const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)')
  const result = stmt.run(data.title, 0)

  return c.json({ success: true, id: result.lastInsertRowid })
})

app.put('/put-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))
  let data
  try {
    data = await c.req.json()
  } catch {
    return c.json({ success: false, error: '不正なJSONです' }, 400)
  }

  if (typeof data.title !== 'string' || typeof data.completed !== 'boolean') {
    return c.json({ success: false, error: 'titleとcompletedが正しい形式ではありません' }, 400)
  }

  const stmt = db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?')
  const result = stmt.run(data.title, data.completed ? 1 : 0, id)

  if (result.changes === 0) {
    return c.json({ success: false, error: '該当IDのTODOが見つかりません' }, 404)
  }

  return c.json({ success: true, id })
})

app.delete('/delete-todo/:id', (c) => {
  const id = Number(c.req.param('id'))
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?')
  const result = stmt.run(id)

  if (result.changes === 0) {
    return c.json({ success: false, error: 'Todoが見つからないか、すでに削除済みです' }, 410)
  }

  return c.json({ success: true, id })
})

const port = 8000
serve({ fetch: app.fetch, port })
