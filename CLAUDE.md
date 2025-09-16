# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `npm run build` - Build TypeScript to dist/ with dual ESM/CommonJS output
- `npm test` - Run all tests using Node.js built-in test runner
- `npm run prepublishOnly` - Build before publishing (runs automatically)

### Web Preview Development

- `cd web-preview && npm run dev` - Start development server for React demo
- `cd web-preview && npm run build` - Build demo for production
- `cd web-preview && npm run preview` - Preview built demo locally

### Release Process

- `npm run release:patch` - Bump patch version and publish
- `npm run release:minor` - Bump minor version and publish
- `npm run release:major` - Bump major version and publish

Or use the automated GitHub Actions workflow by pushing tags:

```bash
npm version patch && git push origin v0.2.4
```

### Testing & Debugging

- Set `BRANCH_PREFIX_DEBUG=1` to enable debug logging
- Set `BRANCH_PREFIX_DRY_RUN=1` to test without modifying files
- Tests use temporary directories and file system mocking

## Architecture Overview

This is a **TypeScript CLI tool** that integrates with Husky's `prepare-commit-msg` hook to automatically format Git commit messages based on branch names.

### Core Design Patterns

**Functional Pipeline Architecture**: The main processing follows a functional pipeline pattern in `src/core.ts`:

```typescript
const pipeline = pipe(
  applyValidationRules,
  logProcessingInfo,
  processMessage,
  writeResult
);
```

**Strategy Pattern**: Used throughout for:

- **Validation Rules**: Declarative array of validation functions
- **Message Processors**: Different template processing strategies
- **Init Strategies**: Various Husky installation scenarios

**State Management**: Immutable `ProcessingState` flows through pipeline containing configuration, branch info, messages, and flags.

### Module Structure

- **`src/core.ts`** - Main processing engine with functional pipeline
- **`src/cli.ts`** - Command routing using declarative handler pattern
- **`src/init.ts`** - Husky integration with strategy pattern for different scenarios
- **`src/config.ts`** - Configuration loading from package.json with defaults
- **`src/tokens.ts`** - Template rendering system with variable substitution
- **`src/types.ts`** - Comprehensive TypeScript type definitions

### Key Integration Points

**Git Integration**: Executes `git rev-parse --abbrev-ref HEAD` to get branch names.

**Husky Integration**: Creates/modifies `.husky/prepare-commit-msg` hook file. Requires Husky v9 as peer dependency.

**Template System**: Supports variables like `${ticket}`, `${seg0}`, `${branch}`, `${msg}`, `${prefix:n}` for flexible message formatting.

**Ticket Extraction**: Uses regex `/([A-Z]+-\d+)/i` to find Jira-style tickets (e.g., ABC-123).

### Build & Package Structure

**Multi-format Package**: Outputs both ESM and CommonJS with TypeScript declarations:

```json
{
  "main": "./dist/core.cjs",
  "module": "./dist/core.js",
  "types": "./dist/core.d.ts",
  "bin": { "cfb": "bin/cfb.js" }
}
```

**Multiple Entry Points**:

- Main API: `import { run } from "@253eosam/commit-from-branch"`
- Init utility: `import { initHusky } from "@253eosam/commit-from-branch/init"`

### Configuration

Configuration lives in package.json under `commitFromBranch` key:

```json
{
  "commitFromBranch": {
    "format": "[${ticket}] ${msg}",
    "fallbackFormat": "[${seg0}] ${msg}",
    "includePattern": ["feature/*", "bugfix/*"],
    "exclude": ["merge", "squash", "revert"]
  }
}
```

### Testing Architecture

Tests use Node.js built-in test runner with temporary directories. Key patterns:

- File system operations use temp dirs for isolation
- Command-line testing with mock argv/env
- Integration tests that simulate real Git hook scenarios

### Release Automation

**GitHub Actions** (`.github/workflows/release.yml`) handles:

- Tag validation (v*.*.* format)
- Version consistency checks between package.json and Git tags
- Automated build, test, and NPM publishing
- GitHub release creation with changelog extraction

**Local Release Script** (`scripts/release.js`) provides manual alternative with GitHub CLI integration.

### Error Handling Philosophy

- Graceful degradation when Git operations fail
- Comprehensive logging with debug mode
- Safe file operations with proper error recovery
- Clear user guidance for setup and troubleshooting