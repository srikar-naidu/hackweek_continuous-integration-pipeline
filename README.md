# TaskFlow - Full-Stack Monorepo with GitHub Actions CI/CD Pipeline

TaskFlow is a production-quality task management monorepo designed with a clean, light-themed user interface, robust REST APIs, comprehensive testing suites, and security-centric GitHub Actions validation pipelines.

---

## 🚀 Key Features

- **Task Management**: Create, edit, and filter tasks by priority, category, and status.
- **Bulk Operations**: Toggle bulk select mode to update statuses or delete multiple tasks simultaneously.
- **Optimistic UI Updates**: State transitions occur instantly in the client and rollback gracefully if the server API reports an error.
- **Keyboard Shortcuts**: Advanced navigation using keyboard hotkeys (`c` to create, `Esc` to close, `b` to toggle bulk actions, `l` to open logs).
- **Activity Timeline**: Real-time sliding timeline logging every user transaction (creation, updates, deletes, bulk changes).
- **Export Functions**: Export current task board states to CSV or JSON formats.
- **CI Validation Matrix**: Automated validation runs on pushes and Pull Requests across Node.js versions 18, 20, and 22.
- **Security Auditing**: Integrates CodeQL static analysis, Trivy file vulnerability scanning, and npm audits to enforce high security thresholds.

---

## 🛠️ Technology Stack

### Backend

- **Runtime & Framework**: Node.js, Express, TypeScript
- **Validation**: Zod (strict schema typing)
- **Testing**: Jest, Supertest

### Frontend

- **Framework & Bundler**: React (v18), TypeScript, Vite
- **Styling**: Premium Vanilla CSS (light-theme design system, custom typography, backdrop glassmorphism, hover transitions, micro-animations)
- **Testing**: Vitest, React Testing Library

### DevOps & Pipeline

- **CI/CD Engine**: GitHub Actions
- **Security Scanners**: CodeQL, Trivy FS Scanner, npm audit

---

## 📂 Architecture Overview

The repository utilizes npm workspaces to orchestrate dependencies in the monorepo structure:

```
├── .github/workflows/       # GitHub Actions YAML workflows
├── backend/                 # TypeScript Express REST API
│   ├── src/                 # Application logic & routes
│   └── tests/               # Backend Jest testing suite
├── frontend/                # Vite React single-page client
│   └── src/                 # App view, components, hooks & Vitest tests
├── package.json             # Root monorepo workspace configuration
└── prettier.config.js       # Shared formatting rules
```

---

## ⚡ Getting Started Locally

### 1. Install Workspace Dependencies

Ensure Node.js (v18+) is installed. Run the following command in the root folder to bootstrap the workspaces:

```bash
npm install
```

### 2. Run Validation Checks

Verify code quality, formatting, and tests locally:

```bash
# Verify Prettier formatting
npm run format:check

# Run ESLint validation
npm run lint

# Run unit and integration tests across both workspaces
npm run test

# Compile and build application bundles
npm run build
```

### 3. Run Applications

Start the backend and frontend development servers concurrently:

```bash
npm run dev
```

- **API Server**: Runs at `http://localhost:3001`
- **Frontend Client**: Runs at `http://localhost:5173`

---

## 🔒 CI/CD Pipeline and Security Scan Details

The `.github/workflows/` directory contains two main configuration files:

1.  **Continuous Integration (`ci.yml`)**:
    - Initiated on push/PR events to `main` and `develop`.
    - Sets up a matrix testing parallel jobs on Node v18, v20, and v22.
    - Validates lint rules (`ESLint`), formats (`Prettier`), builds, and tests.
    - Triggers `npm audit` and blocks builds if `HIGH` or `CRITICAL` issues are found.
    - Triggers a **Trivy vulnerability scan** to inspect file integrity and dependencies.
    - Appends a structured markdown summary outlining step outcomes directly in the GitHub Action Run page.
2.  **CodeQL Static Scan (`codeql-analysis.yml`)**:
    - Executes CodeQL analysis to query for data flow leaks, logical injection paths, and structural software vulnerabilities.

---

## 🌿 Git Branching Workflow

This project follows an established Git Flow variant:

- `main`: Holds release-ready production code.
- `develop`: The active integration workspace for feature merges.
- `feature/*`: Branches dedicated to building specific features. Merge commits preserve Pull Request histories:

```bash
git checkout develop
git checkout -b feature/my-feature

# Write code, stage, and commit
git add .
git commit -m "feat(scope): implement awesome changes"

# Switch back, pull, and merge with non-fast-forward
git checkout develop
git merge --no-ff feature/my-feature -m "merge: pull request #X from feature/my-feature"
```

Once prepared for release, merge `develop` into `main` with a release PR and tag:

```bash
git checkout main
git merge --no-ff develop -m "merge: release pull request from develop into main (v1.0.0)"
git tag -a v1.0.0 -m "Release v1.0.0"
```
