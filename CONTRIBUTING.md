# Contributing to use-idb-store

Thank you for your interest in contributing to use-idb-store! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/rajtoshranjan/use-idb-store.git
cd use-idb-store
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the package**

```bash
npm run build
```

4. **Development mode**

For development with automatic rebuilding:

```bash
npm run dev
```

## Testing Your Changes

You can test your changes locally by:

1. **Building the package:**

```bash
npm run build
```

2. **Creating a test project that uses the local package:**

```bash
# In another directory
npm init -y
npm install path/to/your/use-idb-store
```

Or using `npm link`:

```bash
# In the use-idb-store directory
npm link

# In your test project
npm link use-idb-store
```

## Code Standards

- Use TypeScript for all new code
- Maintain clean code with meaningful variable and function names
- Include JSDoc comments for public APIs
- Keep bundle size minimal and avoid unnecessary dependencies
- Handle errors gracefully
- Write code that works in all modern browsers

## Pull Request Process

1. Fork the repository
2. Create a new branch for your feature/fix: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests (once they're set up) and ensure all pass
5. Update documentation if necessary
6. Submit a pull request

## Reporting Issues

When reporting issues, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and version information
- Any relevant code samples or error messages

## Contact

If you have questions or need help, please:

- Open an issue on GitHub
- Contact the maintainer via email or the project's discussion forum

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT license.
