import "./app.css";
import { TodoSection, UserSection, DebugInfo } from "./components";
import { HeroSection } from "./components/hero";
import { FeaturesSection } from "./components/features";
import { CodeExampleSection } from "./components/code-example";

function App() {
  return (
    <div className="app-container">
      <HeroSection />

      <div className="container">
        <FeaturesSection />

        <CodeExampleSection />

        <section className="demo-section">
          <h2 className="section-title">Try It Live</h2>
          <p className="section-subtitle">
            Experience real-time persistence. All changes are instantly saved to
            IndexedDB and survive page refreshes.
          </p>

          <div className="demo-grid">
            <TodoSection />
            <UserSection />
          </div>
        </section>

        <DebugInfo />
      </div>

      <footer className="footer">
        <p>
          Made by{" "}
          <a
            href="https://github.com/rajtoshranjan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rajtosh Ranjan
          </a>
          {" • "}
          <a
            href="https://github.com/rajtoshranjan/use-idb-store"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
