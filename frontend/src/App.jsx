import { useEffect, useState } from 'react';

// Small wrapper around fetch: throws a readable error on failure and
// returns parsed JSON (or null for 204 No Content).
async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  // Load the list once when the page opens.
  useEffect(() => {
    request('/api/todos')
      .then(setTodos)
      .catch((err) => setError(err.message));
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const todo = await request('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      // Functional updates (prev => ...) avoid stale values from closures.
      setTodos((prev) => [todo, ...prev]);
      setTitle('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTodo(todo) {
    try {
      const updated = await request(`/api/todos/${todo._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !todo.completed }),
      });
      setTodos((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTodo(id) {
    try {
      await request(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <h1>My Todos</h1>

      <form onSubmit={addTodo}>
        <input
          type="text"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span>{todo.title}</span>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>No todos yet.</p>}
    </div>
  );
}
