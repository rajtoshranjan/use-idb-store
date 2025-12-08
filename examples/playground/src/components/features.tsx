export function FeaturesSection() {
  const features = [
    {
      icon: "💾",
      title: "Persistent State",
      description:
        "State automatically syncs with IndexedDB. Your data survives page refreshes and browser restarts without extra code.",
    },
    {
      icon: "🔌",
      title: "Offline-First",
      description:
        "Works seamlessly offline. Users can interact with your app even without internet connectivity.",
    },
    {
      icon: "📦",
      title: "Scale Easily",
      description:
        "Store gigabytes of data client-side. IndexedDB handles datasets that would crash localStorage.",
    },
    {
      icon: "🔄",
      title: "Complete CRUD",
      description:
        "Intuitive mutations API for all data operations. Add, update, delete, or upsert with simple method calls.",
    },
    {
      icon: "🛠️",
      title: "TypeScript Native",
      description:
        "Built with TypeScript for TypeScript. Get full type inference and compile-time safety out of the box.",
    },
    {
      icon: "🌐",
      title: "Global by Default",
      description:
        "One store name, multiple components, shared state. No Context API or prop drilling required.",
    },
  ];

  return (
    <section className="features-section">
      <h2 className="section-title">Why Choose use-idb-store?</h2>
      <p className="section-subtitle">
        A complete solution for persistent, scalable client-side state in React applications
      </p>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
