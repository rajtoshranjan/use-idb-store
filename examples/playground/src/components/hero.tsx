export function HeroSection() {
  const scrollToDemo = () => {
    window.history.pushState({}, "", "#demo");
    const demoSection = document.getElementById("demo");
    demoSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span>React Hook for IndexedDB</span>
        </div>

        <h1 className="hero-title">use-idb-store</h1>

        <p className="hero-subtitle">
          Modern React state management with IndexedDB persistence. Build
          offline-first apps with automatic data sync, type-safe operations, and
          a developer-friendly API.
        </p>

        <div className="hero-actions">
          <button onClick={scrollToDemo}>Try Demo</button>
          <button
            className="secondary"
            onClick={() =>
              window.open(
                "https://github.com/rajtoshranjan/use-idb-store",
                "_blank"
              )
            }
          >
            View on GitHub
          </button>
        </div>
      </div>
    </section>
  );
}
