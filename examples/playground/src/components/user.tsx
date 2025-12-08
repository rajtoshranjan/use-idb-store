import { useState } from "react";
import { useIndexedDbStore } from "use-idb-store";
import type { User } from "./types";

export function UserSection() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAge, setUserAge] = useState(25);

  const {
    values: users,
    mutations: userMutations,
    isLoading: usersLoading,
    error: usersError,
  } = useIndexedDbStore<User>("users");

  const addUser = () => {
    if (userName.trim() && userEmail.trim()) {
      const id = Date.now().toString();
      userMutations.addValue(id, {
        id,
        name: userName.trim(),
        email: userEmail.trim(),
        age: userAge,
      });
      setUserName("");
      setUserEmail("");
      setUserAge(25);
    }
  };

  const deleteUser = (id: string) => {
    userMutations.deleteValue(id);
  };

  const clearAllUsers = () => {
    Object.keys(users).forEach((id) => userMutations.deleteValue(id));
  };

  const userCount = Object.keys(users).length;

  if (usersLoading) {
    return (
      <div className="demo-card">
        <div className="demo-header">
          <h2>User Directory</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading directory...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="demo-card">
        <div className="demo-header">
          <h2>User Directory</h2>
        </div>
        <div className="error-state">
          <strong>Error loading users:</strong>
          <p>{usersError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-card">
      <div className="demo-header">
        <h2>User Directory</h2>
        <span className="demo-count">{userCount}</span>
      </div>

      <div className="input-group">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="email@example.com"
        />
        <input
          type="number"
          value={userAge}
          onChange={(e) => setUserAge(Number(e.target.value))}
          placeholder="Age"
          min="1"
          max="120"
        />
        <div className="button-group">
          <button
            onClick={addUser}
            disabled={!userName.trim() || !userEmail.trim()}
          >
            Add User
          </button>
          <button
            onClick={clearAllUsers}
            className="secondary"
            disabled={userCount === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="items-list">
        {userCount === 0 ? (
          <div className="empty-state">
            <p>Directory is empty. Add your first user profile above!</p>
          </div>
        ) : (
          Object.values(users).map((user) => (
            <div key={user.id} className="user-item">
              <div className="user-content">
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <div className="user-email">{user.email}</div>
                  <div className="user-age">Age: {user.age}</div>
                </div>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="danger small icon-button"
                  title="Delete user"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
