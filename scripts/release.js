#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log(`🚀 Starting release process for v${currentVersion}`);

function run(command) {
  console.log(`> ${command}`);
  try {
    return execSync(command, { stdio: 'inherit', encoding: 'utf8' });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

function extractChangelogForVersion(version) {
  if (!fs.existsSync('CHANGELOG.md')) {
    return `Release v${version}`;
  }
  
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const lines = changelog.split('\n');
  const startIndex = lines.findIndex(line => 
    line.includes(`[${version}]`) && line.startsWith('## ')
  );
  
  if (startIndex === -1) {
    return `Release v${version}`;
  }
  
  const endIndex = lines.findIndex((line, index) => 
    index > startIndex && line.startsWith('## [')
  );
  
  const versionLines = lines.slice(
    startIndex + 1, 
    endIndex === -1 ? undefined : endIndex
  );
  
  return versionLines.join('\n').trim();
}

async function createRelease() {
  // 1. Build and test
  console.log('\n📦 Building and testing...');
  run('npm run build');
  run('npm test');
  
  // 2. Create git tag
  console.log('\n🏷️  Creating git tag...');
  run(`git tag -a v${currentVersion} -m "Release v${currentVersion}"`);
  
  // 3. Push to GitHub
  console.log('\n⬆️  Pushing to GitHub...');
  run('git push origin main');
  run(`git push origin v${currentVersion}`);
  
  // 4. Publish to NPM
  console.log('\n📤 Publishing to NPM...');
  run('npm publish');
  
  // 5. Create GitHub release (if gh CLI is available)
  console.log('\n🎉 Creating GitHub release...');
  try {
    const changelog = extractChangelogForVersion(currentVersion);
    const releaseTitle = `🚀 Release v${currentVersion}`;
    
    // Escape special characters in changelog
    const escapedChangelog = changelog.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    
    run(`gh release create v${currentVersion} --title "${releaseTitle}" --notes "${escapedChangelog}"`);
    console.log('✅ GitHub release created successfully!');
  } catch (error) {
    console.log('⚠️  GitHub CLI not available or not authenticated.');
    console.log('Please create the release manually on GitHub.');
    console.log('Release notes saved to RELEASE_NOTES_v' + currentVersion + '.md');
  }
  
  console.log(`\n🎉 Release v${currentVersion} completed successfully!`);
  console.log(`📦 Package: https://www.npmjs.com/package/${packageJson.name}`);
  console.log(`🏷️  Tag: https://github.com/${packageJson.repository.url.split('/').slice(-2).join('/').replace('.git', '')}/releases/tag/v${currentVersion}`);
}

// Run the release process
createRelease().catch(error => {
  console.error('❌ Release failed:', error);
  process.exit(1);
});