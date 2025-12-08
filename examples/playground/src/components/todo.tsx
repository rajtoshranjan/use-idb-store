import { useState } from "react";
import { useIndexedDbStore } from "use-idb-store";
import type { Todo } from "./types";

export function TodoSection() {
  const [todoText, setTodoText] = useState("");

  const {
    values: todos,
    mutations: todoMutations,
    isLoading: todosLoading,
    error: todosError,
  } = useIndexedDbStore<Todo>("todos");

  const addTodo = () => {
    if (todoText.trim()) {
      const id = Date.now().toString();
      todoMutations.addValue(id, {
        id,
        text: todoText.trim(),
        completed: false,
        createdAt: Date.now(),
      });
      setTodoText("");
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos[id];
    if (todo) {
      todoMutations.updateValue(id, { completed: !todo.completed });
    }
  };

  const deleteTodo = (id: string) => {
    todoMutations.deleteValue(id);
  };

  const clearAllTodos = () => {
    Object.keys(todos).forEach((id) => todoMutations.deleteValue(id));
  };

  const todoCount = Object.keys(todos).length;
  const completedCount = Object.values(todos).filter((t) => t.completed).length;

  if (todosLoading) {
    return (
      <div className="demo-card">
        <div className="demo-header">
          <h2>Todo List</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your todos...</p>
        </div>
      </div>
    );
  }

  if (todosError) {
    return (
      <div className="demo-card">
        <div className="demo-header">
          <h2>Todo List</h2>
        </div>
        <div className="error-state">
          <strong>Error loading todos:</strong>
          <p>{todosError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-card">
      <div className="demo-header">
        <h2>Todo List</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="demo-count">
            {completedCount}/{todoCount}
          </span>
        </div>
      </div>

      <div className="input-group">
        <input
          type="text"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          placeholder="Add a new task..."
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <div className="button-group">
          <button onClick={addTodo} disabled={!todoText.trim()}>
            Add Todo
          </button>
          <button
            onClick={clearAllTodos}
            className="secondary"
            disabled={todoCount === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="items-list">
        {todoCount === 0 ? (
          <div className="empty-state">
            <p>Your todo list is empty. Create your first task above!</p>
          </div>
        ) : (
          Object.values(todos)
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((todo) => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="todo-text">{todo.text}</span>
                <span className="todo-time">
                  {new Date(todo.createdAt).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="danger small icon-button"
                  title="Delete todo"
                >
                  ×
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
