# commit-from-branch

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/commit-from-branch?style=flat-square&color=blue)](https://www.npmjs.com/package/commit-from-branch)
[![NPM Downloads](https://img.shields.io/npm/dm/commit-from-branch?style=flat-square&color=green)](https://www.npmjs.com/package/commit-from-branch)
[![GitHub Release](https://img.shields.io/github/v/release/253eosam/commit-from-branch?style=flat-square&color=purple)](https://github.com/253eosam/commit-from-branch/releases)
[![License](https://img.shields.io/npm/l/commit-from-branch?style=flat-square&color=orange)](https://github.com/253eosam/commit-from-branch/blob/main/LICENSE)

[![CI Status](https://img.shields.io/github/actions/workflow/status/253eosam/commit-from-branch/release.yml?style=flat-square&label=CI)](https://github.com/253eosam/commit-from-branch/actions)
[![GitHub Pages](https://img.shields.io/github/deployments/253eosam/commit-from-branch/github-pages?style=flat-square&label=Demo)](https://253eosam.github.io/commit-from-branch/)
[![Node.js](https://img.shields.io/node/v/commit-from-branch?style=flat-square&color=brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

</div>

**Flexible commit message templating from branch name (ticket/segments) for Husky's `prepare-commit-msg` hook.**

Automatically formats your commit messages based on your branch name, extracting Jira-style tickets (e.g., `ABC-123`) and supporting flexible templating with branch segments.

## Features

- 🎯 **Automatic ticket extraction** - Finds Jira-style tickets (ABC-123) in branch names
- 🔧 **Flexible templating** - Customizable commit message formats with placeholders
- 🌿 **Branch segment support** - Access individual parts of your branch path
- ⚡ **Zero configuration** - Works out of the box with sensible defaults
- 🪝 **Husky integration** - Easy setup with Husky's prepare-commit-msg hook
- 🎨 **Pattern matching** - Include/exclude branches with glob patterns
- 🏃 **Fast & lightweight** - Minimal dependencies, TypeScript-based


## 📖 Table of Contents

- [Demo](#-demo)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Template Variables](#-template-variables)
- [Examples](#-examples)
- [Debug Mode](#-debug-mode)
- [Programmatic Usage](#-programmatic-usage)
- [How It Works](#-how-it-works)
- [Requirements](#-requirements)
- [Contributing](#-contributing)
- [Links](#-links)

## 🌐 Demo

**[🚀 Live Demo](https://253eosam.github.io/commit-from-branch/)** - Try the interactive demo to see how commit message templating works!

## 📦 Installation

```bash
npm install commit-from-branch --save-dev
```

> **Note**: This package requires Husky v9 as a peer dependency. npm will automatically warn you if it's not installed.

## 🚀 Quick Start

1. **Install Husky v9** (if not already installed):

```bash
npm install --save-dev husky@^9.0.0
npx husky init
```

2. **Setup the hook**:

```bash
npx cfb init
```

3. **Configure in package.json** (optional):

```json
{
  "commitFromBranch": {
    "format": "[${ticket}] ${msg}",
    "fallbackFormat": "[${seg0}] ${msg}",
    "includePattern": ["feature/*", "bugfix/*"]
  }
}
```

4. **Create a branch and commit**:

```bash
git checkout -b feature/ABC-123-add-login
git add .
git commit -m "implement user authentication"
# Result: "[ABC-123] implement user authentication"
```

## ⚙️ Configuration

Add configuration to your `package.json`:

```json
{
  "commitFromBranch": {
    "format": "[${ticket}] ${msg}",
    "fallbackFormat": "[${seg0}] ${msg}",
    "includePattern": ["*"],
    "exclude": ["merge", "squash", "revert"]
  }
}
```

### Configuration Options

| Option           | Type                 | Default                         | Description                           |
| ---------------- | -------------------- | ------------------------------- | ------------------------------------- |
| `format`         | `string`             | `"[${ticket}] ${msg}"`          | Template when ticket is found         |
| `fallbackFormat` | `string`             | `"[${seg0}] ${msg}"`            | Template when no ticket found         |
| `includePattern` | `string \| string[]` | `["*"]`                         | Glob patterns for branches to include |
| `exclude`        | `string[]`           | `["merge", "squash", "revert"]` | Commit sources to exclude             |

## 🔧 Template Variables

Use these placeholders in your format templates:

| Variable                   | Description                       | Example                                     |
| -------------------------- | --------------------------------- | ------------------------------------------- |
| `${ticket}`                | Extracted ticket (ABC-123 format) | `ABC-123`                                   |
| `${branch}`                | Full branch name                  | `feature/ABC-123-add-login`                 |
| `${seg0}`, `${seg1}`, etc. | Branch segments split by `/`      | `feature`, `ABC-123-add-login`              |
| `${segments}`              | All segments joined with `/`      | `feature/ABC-123-add-login`                 |
| `${prefix:n}`              | First n segments joined with `/`  | `${prefix:2}` → `feature/ABC-123-add-login` |
| `${msg}`                   | Original commit message           | `implement user authentication`             |
| `${body}`                  | Full original commit body         | Multi-line commit content                   |

## 💡 Examples

### Basic Ticket Extraction

```bash
# Branch: feature/ABC-123-user-login
# Commit: git commit -m "add login form"
# Result: "[ABC-123] add login form"
```

### Fallback Format (No Ticket)

```bash
# Branch: feature/user-dashboard
# Commit: git commit -m "create dashboard"
# Result: "[feature] create dashboard"
```

### Custom Formatting

```json
{
  "commitFromBranch": {
    "format": "${ticket}: ${msg}",
    "fallbackFormat": "${seg0}/${seg1}: ${msg}"
  }
}
```

```bash
# Branch: bugfix/payment/ABC-456-fix-checkout
# Result: "ABC-456: fix payment processing"
```

### Pattern Matching

```json
{
  "commitFromBranch": {
    "includePattern": ["feature/*", "bugfix/*", "hotfix/*"],
    "exclude": ["merge", "squash"]
  }
}
```

### Advanced Templates

```json
{
  "commitFromBranch": {
    "format": "[${ticket}] ${seg0}: ${msg}",
    "fallbackFormat": "[${prefix:2}] ${msg}"
  }
}
```

## 🐛 Debug Mode

Enable debug logging:

```bash
BRANCH_PREFIX_DEBUG=1 git commit -m "test message"
```

## 🧪 Dry Run Mode

Test without modifying commit messages:

```bash
BRANCH_PREFIX_DRYRUN=1 git commit -m "test message"
```

## 🔌 Programmatic Usage

```typescript
import { run } from "commit-from-branch";

// Use with custom options
const exitCode = run({
  argv: ["node", "script.js", "/path/to/COMMIT_EDITMSG"],
  env: process.env,
  cwd: "/path/to/repo",
});
```

```typescript
import { initHusky } from "commit-from-branch/init";

// Setup Husky hook programmatically
initHusky("/path/to/repo");
```

## ⚡ How It Works

1. **Hook Integration**: Integrates with Husky's `prepare-commit-msg` hook
2. **Branch Detection**: Gets current branch name using `git rev-parse --abbrev-ref HEAD`
3. **Pattern Matching**: Checks if branch matches include patterns and isn't excluded
4. **Ticket Extraction**: Uses regex `/([A-Z]+-\d+)/i` to find Jira-style tickets
5. **Template Rendering**: Replaces placeholders with actual values
6. **Message Formatting**: Updates commit message file with formatted result

## 📋 Requirements

- Node.js >= 16
- Git repository
- Husky v9 (peer dependency)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run the build: `npm run build`
5. Commit your changes: `git commit -m "add my feature"`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

## 🔗 Links

### Package & Releases
- **[📦 NPM Package](https://www.npmjs.com/package/commit-from-branch)** - Official NPM package
- **[🚀 GitHub Releases](https://github.com/253eosam/commit-from-branch/releases)** - Release notes and downloads
- **[🌐 Live Demo](https://253eosam.github.io/commit-from-branch/)** - Interactive demo

### Development & Community
- **[💻 Source Code](https://github.com/253eosam/commit-from-branch)** - GitHub repository
- **[🐛 Report Issues](https://github.com/253eosam/commit-from-branch/issues)** - Bug reports and feature requests
- **[📊 CI/CD Pipeline](https://github.com/253eosam/commit-from-branch/actions)** - Build status and automation
- **[📈 NPM Stats](https://npmcharts.com/compare/commit-from-branch)** - Download statistics

### Documentation
- **[📚 API Documentation](https://github.com/253eosam/commit-from-branch#-programmatic-usage)** - Programmatic usage guide
- **[⚙️ Configuration Guide](https://github.com/253eosam/commit-from-branch#%EF%B8%8F-configuration)** - Setup and customization
- **[🔧 Template Variables](https://github.com/253eosam/commit-from-branch#-template-variables)** - Available placeholders

## 📄 License

MIT © [253eosam](https://github.com/253eosam)

---

<div align="center">

**[⬆ Back to Top](#commit-from-branch)**

Made with ❤️ by [253eosam](https://github.com/253eosam)

</div>
