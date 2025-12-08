export function CodeExampleSection() {
  return (
    <section>
      <h2 className="section-title">Get Started in Seconds</h2>
      <p className="section-subtitle">
        Install via npm and start building persistent React apps immediately
      </p>

      <div className="code-example">
        <h3>1. Install the Package</h3>
        <pre>
          <code>{`npm install use-idb-store`}</code>
        </pre>
      </div>

      <div className="code-example">
        <h3>2. Import and Use</h3>
        <pre>
          <code>{`import { useIndexedDbStore } from 'use-idb-store';

function TodoApp() {
  const { 
    values, 
    mutations, 
    isLoading, 
    isReady,
    error 
  } = useIndexedDbStore('todos');

  const addTodo = (text) => {
    const id = Date.now().toString();
    mutations.addValue(id, { 
      id, 
      text, 
      completed: false 
    });
  };

  const toggleTodo = (id) => {
    const todo = values[id];
    mutations.updateValue(id, { 
      completed: !todo.completed 
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Todo List</h1>
      <button onClick={() => addTodo('New Todo')}>
        Add Todo
      </button>
      <ul>
        {Object.values(values).map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code>
        </pre>
      </div>

      <div className="code-example">
        <h3>3. Full API Reference</h3>
        <pre>
          <code>{`// Add a new value
mutations.addValue(id, value);

// Update existing value
mutations.updateValue(id, { completed: true });

// Delete a value
mutations.deleteValue(id);

// Add or update (upsert)
mutations.addOrUpdateValue(id, value);

// Get a specific value
const value = await mutations.getValue(id);`}</code>
        </pre>
      </div>
    </section>
  );
}
