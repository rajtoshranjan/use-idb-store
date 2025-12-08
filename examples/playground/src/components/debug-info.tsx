import { useIndexedDbStore } from "use-idb-store";
import type { Todo, User } from "./types";

export function DebugInfo() {
  const {
    values: todos,
    isLoading: todosLoading,
    error: todosError,
  } = useIndexedDbStore<Todo>("todos");

  const {
    values: users,
    isLoading: usersLoading,
    error: usersError,
  } = useIndexedDbStore<User>("users");

  const todoCount = Object.keys(todos).length;
  const userCount = Object.keys(users).length;
  const completedTodos = Object.values(todos).filter((t) => t.completed).length;
  const hasErrors = todosError || usersError;

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>Developer Dashboard</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Todos</div>
          <div className="stat-value">{todoCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value success">{completedTodos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{userCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Todos Status</div>
          <div className={`stat-value ${todosLoading ? "warning" : "success"}`}>
            {todosLoading ? "Loading" : "Ready"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Users Status</div>
          <div className={`stat-value ${usersLoading ? "warning" : "success"}`}>
            {usersLoading ? "Loading" : "Ready"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Errors</div>
          <div className={`stat-value ${hasErrors ? "danger" : "success"}`}>
            {hasErrors ? "Yes" : "None"}
          </div>
        </div>
      </div>

      {hasErrors && (
        <div
          className="error-state"
          style={{ marginBottom: "var(--space-lg)" }}
        >
          {todosError && (
            <p>
              <strong>Todos Error:</strong> {todosError.message}
            </p>
          )}
          {usersError && (
            <p>
              <strong>Users Error:</strong> {usersError.message}
            </p>
          )}
        </div>
      )}

      <details className="debug-details">
        <summary>
          <span>View Raw Data</span>
        </summary>
        <div className="debug-data">
          <div>
            <pre>
              <code>{JSON.stringify({ todos }, null, 2)}</code>
            </pre>
          </div>
          <div>
            <pre>
              <code>{JSON.stringify({ users }, null, 2)}</code>
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
