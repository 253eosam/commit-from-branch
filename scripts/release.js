#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

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

  // 2. Commit version changes and create git tag
  console.log('\n📝 Committing version changes...');
  run('git add package.json package-lock.json');
  run(`git commit -m "${currentVersion}"`);

  console.log('\n🏷️  Creating git tag...');
  run(`git tag -a v${currentVersion} -m "Release v${currentVersion}"`);

  // 3. Push to GitHub
  console.log('\n⬆️  Pushing to GitHub...');
  run('git push origin main');
  run(`git push origin v${currentVersion}`);

  // 4. GitHub Actions will handle NPM publishing and GitHub release
  console.log('\n✅ Pushed to GitHub! GitHub Actions will handle:');
  console.log('   - NPM publishing');
  console.log('   - GitHub release creation');

  // 5. Done (GitHub Actions will complete the release)
  console.log(`\n🎉 Release v${currentVersion} initiated successfully!`);
  console.log(`📦 Package: https://www.npmjs.com/package/${packageJson.name}`);
  console.log(`🏷️  Tag: https://github.com/${packageJson.repository.url.split('/').slice(-2).join('/').replace('.git', '')}/releases/tag/v${currentVersion}`);
}

// Run the release process
createRelease().catch(error => {
  console.error('❌ Release failed:', error);
  process.exit(1);
});