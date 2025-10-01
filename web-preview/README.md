# Commit From Branch - Web Preview

A web-based configuration preview tool for the `commit-from-branch` npm package.

## Features

- 🎯 **Real-time Preview**: See how your commit messages will be transformed instantly
- ⚙️ **Configuration Testing**: Test different configuration settings without making actual commits  
- 📚 **Example Scenarios**: Pre-built examples for common use cases
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Usage

1. **Configure Settings**: Set up your `includePattern`, `format`, `fallbackFormat`, and `exclude` patterns
2. **Test Input**: Enter a branch name and commit message to see how they would be processed
3. **View Results**: See the final commit message and processing details in real-time
4. **Try Examples**: Use the example scenarios to understand different patterns

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Available Configuration Options

- **includePattern**: Glob patterns for branches to include (e.g., `feature/*`, `bugfix/*`)
- **format**: Template for commit messages when ticket is found (e.g., `${ticket}: ${msg}`)
- **fallbackFormat**: Template when no ticket is found (e.g., `${seg0}: ${msg}`)
- **exclude**: Patterns to exclude certain sources

## Template Tokens

- `${ticket}`: Extracted ticket number (e.g., ABC-123)
- `${msg}`: Original commit message
- `${branch}`: Full branch name
- `${seg0}`, `${seg1}`, etc.: Individual branch segments split by `/`
- `${segments}`: All segments joined with `/`
- `${prefix:n}`: First n segments joined with `/`

## Examples

Try the built-in example scenarios to understand:
- JIRA ticket format patterns
- Simple prefix additions
- Template replacement modes
- Skip conditions and duplicate detection

Visit http://localhost:5173 after running `npm run dev` to use the preview tool.
