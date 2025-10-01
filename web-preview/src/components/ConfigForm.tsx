import React from 'react';
import type { CommitFromBranchConfig } from '../core';

interface ConfigFormProps {
  config: CommitFromBranchConfig;
  onChange: (config: CommitFromBranchConfig) => void;
  branch: string;
  onBranchChange: (branch: string) => void;
  commitMessage: string;
  onCommitMessageChange: (message: string) => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  onChange,
  branch,
  onBranchChange,
  commitMessage,
  onCommitMessageChange
}) => {
  const updateConfig = (field: keyof CommitFromBranchConfig, value: string | string[]) => {
    onChange({ ...config, [field]: value });
  };

  const handleIncludePatternChange = (value: string) => {
    const patterns = value.split(',').map(p => p.trim()).filter(Boolean);
    updateConfig('includePattern', patterns.length === 1 ? patterns[0] : patterns);
  };

  const handleExcludeChange = (value: string) => {
    const patterns = value.split(',').map(p => p.trim()).filter(Boolean);
    updateConfig('exclude', patterns);
  };

  const includePatternValue = Array.isArray(config.includePattern) 
    ? config.includePattern.join(', ') 
    : (config.includePattern || '*');

  const excludeValue = config.exclude?.join(', ') || '';

  return (
    <div className="config-form">
      <h2>⚙️ Configuration</h2>
      
      <div className="form-section">
        <h3>Input Test Data</h3>
        <div className="form-group">
          <label htmlFor="branch">Branch Name:</label>
          <input
            id="branch"
            type="text"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            placeholder="e.g., feature/ABC-123/user-auth"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="commit-message">Commit Message:</label>
          <input
            id="commit-message"
            type="text"
            value={commitMessage}
            onChange={(e) => onCommitMessageChange(e.target.value)}
            placeholder="e.g., add login functionality"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Configuration Settings</h3>
        <div className="form-group">
          <label htmlFor="format">Format (with ticket):</label>
          <input
            id="format"
            type="text"
            value={config.format || ''}
            onChange={(e) => updateConfig('format', e.target.value)}
            placeholder="e.g., ${ticket}: ${msg}"
            className="form-input"
          />
          <small className="form-help">
            Available tokens: {'${ticket}'}, {'${msg}'}, {'${branch}'}, {'${seg0}'}, {'${seg1}'}, {'${segments}'}, {'${prefix:n}'}, etc.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="fallback-format">Fallback Format (without ticket):</label>
          <input
            id="fallback-format"
            type="text"
            value={config.fallbackFormat || ''}
            onChange={(e) => updateConfig('fallbackFormat', e.target.value)}
            placeholder="e.g., ${seg0}: ${msg}"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="include-patterns">Include Patterns:</label>
          <input
            id="include-patterns"
            type="text"
            value={includePatternValue}
            onChange={(e) => handleIncludePatternChange(e.target.value)}
            placeholder="e.g., feature/*, bugfix/*, *"
            className="form-input"
          />
          <small className="form-help">
            Comma-separated patterns. Use * for wildcards. Default: *
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="exclude">Exclude Patterns:</label>
          <input
            id="exclude"
            type="text"
            value={excludeValue}
            onChange={(e) => handleExcludeChange(e.target.value)}
            placeholder="e.g., template, merge"
            className="form-input"
          />
          <small className="form-help">
            Comma-separated patterns to exclude certain sources
          </small>
        </div>
      </div>
    </div>
  );
};

export default ConfigForm;