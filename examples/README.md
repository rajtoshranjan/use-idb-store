# Examples

This directory contains example applications demonstrating the `use-idb-store` hook.

## 🎮 Playground

**Location**: `playground/`  
**Purpose**: Development playground for testing the hook during development  
**URL**: http://localhost:5173 (when running)

The playground is a comprehensive React app that demonstrates:

- Multiple IndexedDB stores (todos and users)
- All CRUD operations (Create, Read, Update, Delete)
- Real-time state updates
- Error handling and loading states
- Data persistence across page refreshes
- Debug information panel

### Running the Playground

```bash
# From the project root
npm run dev:test

# Or directly
cd examples/playground && npm run dev
```

## 🚀 Future Examples

This structure allows for additional examples:

- `basic-usage/` - Minimal example showing basic hook usage
- `todo-app/` - Standalone todo application
- `shopping-cart/` - E-commerce cart with persistence
- `offline-app/` - PWA with offline capabilities

## 📁 Structure

```
examples/
├── playground/           # Development playground
│   ├── src/
│   │   ├── app.tsx      # Main playground component
│   │   └── ...
│   ├── package.json     # Playground dependencies
│   └── vite.config.ts   # Vite configuration
└── README.md            # This file
```

## 💡 Usage Tips

- Each example is a standalone React application
- All examples import the library locally via `"use-idb-store": "file:../.."`
- Use the playground for development and testing
- Examples serve as both documentation and validation of the library
