import React from 'react';

const InfoBox: React.FC = () => {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.4.0';

  return (
    <div className="info-box">
      <div className="info-box-header">
        <h2>📦 Commit From Branch</h2>
        <div className="info-box-badges">
          <span className="badge">v{version}</span>
          <span className="badge">MIT License</span>
        </div>
      </div>

      <p className="info-box-description">
        Flexible commit message templating from branch name for Husky's prepare-commit-msg hook.
        Automatically extracts Jira-style tickets and supports customizable templates.
      </p>

      <div className="info-box-section">
        <h3>📥 Installation</h3>
        <div className="code-block">
          <code>npm install --save-dev commit-from-branch husky@^9.0.0</code>
          <button
            className="copy-button"
            onClick={() => navigator.clipboard.writeText('npm install --save-dev commit-from-branch husky@^9.0.0')}
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
        <div className="code-block">
          <code>npx husky init && npx cfb init</code>
          <button
            className="copy-button"
            onClick={() => navigator.clipboard.writeText('npx husky init && npx cfb init')}
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      <div className="info-box-links">
        <a
          href="https://github.com/253eosam/commit-from-branch"
          target="_blank"
          rel="noopener noreferrer"
          className="info-link"
        >
          <span className="link-icon">🔗</span>
          <span>GitHub Repository</span>
        </a>
        <a
          href="https://www.npmjs.com/package/commit-from-branch"
          target="_blank"
          rel="noopener noreferrer"
          className="info-link"
        >
          <span className="link-icon">📦</span>
          <span>NPM Registry</span>
        </a>
        <a
          href="https://253eosam.github.io/commit-from-branch/"
          target="_blank"
          rel="noopener noreferrer"
          className="info-link"
        >
          <span className="link-icon">📖</span>
          <span>Documentation</span>
        </a>
      </div>
    </div>
  );
};

export default InfoBox;
