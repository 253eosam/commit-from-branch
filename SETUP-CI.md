# CI/CD Setup Instructions

This repository is configured with GitHub Actions to automatically publish to npm when code is pushed to the main branch.

## Prerequisites

### 1. Create npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile → "Access Tokens"
3. Click "Generate New Token" → "Granular Access Token"
4. Configure the token:
   - **Token name**: `GitHub Actions - commit-from-branch`
   - **Expiration**: Set appropriate expiration (recommended: 1 year)
   - **Packages and scopes**: Select `@253eosam/commit-from-branch`
   - **Permissions**: 
     - ✅ Read and write
     - ✅ Publish

5. Click "Generate Token" and copy the token (starts with `npm_...`)

### 2. Add npm Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/253eosam/commit-from-branch
2. Click "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add the secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: Paste your npm token from step 1
6. Click "Add secret"

## How It Works

### Automated Publishing Workflow

The GitHub Actions workflow (`.github/workflows/publish.yml`) will:

1. **Trigger on**:
   - Push to `main` or `master` branch
   - Manual trigger via GitHub UI
   - Ignores changes to `README.md` and `.github/` files

2. **Version Check**:
   - Compares `package.json` version with published npm version
   - Only publishes if version has changed

3. **Build & Publish**:
   - Install dependencies with `npm ci`
   - Run build with `npm run build`
   - Publish to npm with `npm publish --access public`

4. **GitHub Release**:
   - Automatically creates a GitHub release with the new version tag
   - Includes basic release notes

### Publishing Process

1. **Update Version**: Update version in `package.json`
   ```json
   {
     "version": "0.1.4"
   }
   ```

2. **Commit & Push**:
   ```bash
   git add package.json
   git commit -m "bump version to 0.1.4"
   git push origin main
   ```

3. **Automatic Actions**:
   - GitHub Actions detects the push
   - Runs build and tests
   - Publishes to npm if version changed
   - Creates GitHub release

### Manual Publishing

You can also trigger publishing manually:

1. Go to "Actions" tab in your GitHub repository
2. Select "Publish to npm" workflow
3. Click "Run workflow" → "Run workflow"

### Monitoring

- **View workflow runs**: Repository → "Actions" tab
- **Check npm package**: https://www.npmjs.com/package/@253eosam/commit-from-branch
- **View releases**: Repository → "Releases" section

## Troubleshooting

### Common Issues

1. **npm token expired**: Generate a new token and update GitHub secrets
2. **Permission denied**: Ensure npm token has write/publish permissions
3. **Version not changed**: Workflow skips publishing if version is unchanged
4. **Build fails**: Check the Actions log for specific error details

### Debugging

- Check the "Actions" tab for detailed logs
- Verify npm token is correctly set in GitHub secrets
- Ensure `package.json` version is properly incremented

## Security Notes

- Never commit npm tokens to the repository
- Use GitHub secrets for sensitive information
- npm tokens should have minimal required permissions
- Regularly rotate access tokens for security