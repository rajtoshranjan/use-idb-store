import React, { useState } from "react";
import { useIndexedDbStore } from "use-idb-store";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export function TodoApp() {
  const { values, mutations, isLoading, error } =
    useIndexedDbStore<Todo>("todos");
  const [newTodoText, setNewTodoText] = useState("");

  // Get todos as an array sorted by creation time
  const todos = Object.values(values).sort((a, b) => b.createdAt - a.createdAt);

  // Add a new todo
  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const id = Date.now().toString();
    const newTodo: Todo = {
      id,
      text: newTodoText,
      completed: false,
      createdAt: Date.now(),
    };

    mutations.addValue(id, newTodo);
    setNewTodoText("");
  };

  // Toggle a todo's completed status
  const toggleTodoCompleted = (id: string) => {
    const todo = values[id];
    if (todo) {
      mutations.updateValue(id, { completed: !todo.completed });
    }
  };

  // Delete a todo
  const deleteTodo = (id: string) => {
    mutations.deleteValue(id);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  if (isLoading) {
    return <div className="loading">Loading todos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className="todo-app">
      <h1>IndexedDB Todo List</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add Todo</button>
      </form>

      <div className="stats">
        <span>{todos.length} items</span>
        <span>{todos.filter((t) => t.completed).length} completed</span>
      </div>

      {todos.length === 0 ? (
        <p className="empty-state">No todos yet! Add one to get started.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "completed" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodoCompleted(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
