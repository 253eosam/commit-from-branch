# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2024-09-16

### 🌐 New Features
- **GitHub Pages Integration**: Added live demo deployment at https://253eosam.github.io/commit-from-branch/
- **Automated Web Preview Deployment**: Separate workflow for deploying React demo to GitHub Pages
- **Enhanced Release Automation**: Improved release notes generation with commit history and installation guides

### 📚 Documentation Overhaul
- **Professional README**: Complete redesign with badges, table of contents, and emoji sections
- **Comprehensive Badge Collection**: NPM version, downloads, GitHub release, CI status, TypeScript ready
- **Link Ecosystem**: Extensive links section connecting NPM, GitHub, documentation, and demo
- **MIT License**: Added official MIT license file
- **Package Metadata**: Enhanced keywords, funding links, and homepage URL

### 🔧 Developer Experience
- **CLAUDE.md**: Added comprehensive guide for future Claude Code instances
- **Improved Project Structure**: Clear separation between NPM module and web demo
- **Enhanced CI/CD**: Validation of both module and web preview builds in release pipeline

### 📦 Package Improvements
- **Better Keywords**: Enhanced discoverability on NPM with relevant search terms
- **Funding Support**: Added GitHub Sponsors link
- **Homepage Update**: GitHub Pages demo as primary homepage

## [0.2.4] - 2024-09-16

### 🚀 Release Process Improvements
- **Enhanced Release Notes**: Improved GitHub Actions workflow to generate richer release notes
- **Automatic Changelog**: Release notes now include CHANGELOG.md content and commit history
- **Installation Guide**: Release notes automatically include installation instructions

### 📚 Documentation Updates
- **README Updates**: Updated installation guide to highlight Husky v9 peer dependency requirement
- **CHANGELOG Format**: Improved changelog format with better structure and emojis
- **CLAUDE.md**: Added comprehensive development guide for future Claude Code instances

## [0.2.3] - 2024-09-16

### ✨ New Features
- **Peer Dependency Support**: Added husky@^9.0.0 as peer dependency for clearer version requirements
- **Enhanced Error Messages**: Improved installation guidance with clear step-by-step instructions

### 🔧 Code Quality Improvements
- **Declarative Architecture**: Refactored cli.ts and init.ts from procedural to declarative approach
- **Strategy Pattern**: Implemented strategy pattern for Husky initialization scenarios
- **Command Handler Pattern**: Clean command routing in CLI with declarative handlers
- **Simplified Validation**: Leveraged npm's peer dependency warnings instead of complex version checking

### 🧪 Testing
- **Updated Test Suite**: Fixed test expectations to match new behavior
- **Integration Tests**: All 31 tests passing with improved coverage

### 📚 Documentation
- **CLAUDE.md**: Added comprehensive guide for future Claude Code instances
- **Architecture Documentation**: Detailed explanation of functional pipeline and design patterns

## [0.2.0] - 2024-09-16

### 🎉 Major Refactoring - Declarative Architecture

#### ✨ New Features
- **Enhanced duplicate prevention**: Smarter detection of existing ticket numbers and branch segments in commit messages
- **Declarative validation rules**: Easily configurable and extensible validation logic
- **Modular message processors**: Clean separation of different message processing strategies
- **Functional pipeline architecture**: Improved code maintainability and readability

#### 🔧 Technical Improvements
- **Complete code refactoring**: Transformed from procedural to declarative/functional programming style
- **Type safety enhancements**: Added comprehensive TypeScript types for better development experience
- **Pure functions**: All utility functions are now pure and easily testable
- **Immutable state management**: Predictable data flow with immutable state objects
- **Composable architecture**: Easy to extend with new validation rules and processors

#### 🧪 Testing
- **Comprehensive test suite**: 31 test cases covering all functionality
- **Enhanced test coverage**: Tests for all new declarative components
- **Duplicate prevention tests**: Specific tests for improved duplicate detection logic

#### 🏗️ Architecture Changes
- **ValidationRule system**: Declarative rules for commit processing validation
- **MessageProcessor system**: Modular processors for different commit message formats
- **Functional pipeline**: Clean data transformation pipeline using functional composition
- **State-based processing**: All processing based on immutable state objects

#### 🚀 Performance & Maintainability
- **Improved modularity**: Each component has a single responsibility
- **Better error handling**: More robust error handling throughout the pipeline
- **Easier debugging**: Clear separation of concerns and better logging
- **Extensible design**: Simple to add new features without touching existing code

### 🐛 Bug Fixes
- Fixed edge cases in duplicate detection logic
- Improved handling of malformed commit messages
- Better error recovery in file operations

### 📝 Documentation
- Updated inline code documentation
- Added comprehensive type definitions
- Improved code comments explaining the declarative architecture

---

## [0.1.5] - Previous Release
- Basic commit message templating functionality
- Husky integration support
- Configuration via package.json