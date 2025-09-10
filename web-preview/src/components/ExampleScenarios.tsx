import React from 'react';
import type { CommitFromBranchConfig } from '../core';

interface ExampleScenariosProps {
  onApplyExample: (config: CommitFromBranchConfig, branch: string, message: string) => void;
}

interface ExampleScenario {
  name: string;
  description: string;
  config: CommitFromBranchConfig;
  branch: string;
  message: string;
}

const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    name: 'JIRA Ticket Format',
    description: 'Standard format with JIRA ticket prefix',
    config: {
      includePattern: ['feature/*', 'bugfix/*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '${segs[0]}: ${msg}',
      exclude: []
    },
    branch: 'feature/ABC-123/user-authentication',
    message: 'implement OAuth2 login flow'
  },
  {
    name: 'Simple Prefix',
    description: 'Simple branch prefix without ticket requirement',
    config: {
      includePattern: ['*'],
      format: '[${segs[0]}] ${msg}',
      fallbackFormat: '[${segs[0]}] ${msg}',
      exclude: []
    },
    branch: 'feature/user-profile',
    message: 'add profile picture upload'
  },
  {
    name: 'Template Replacement',
    description: 'Replace entire message with template',
    config: {
      includePattern: ['*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '${segs[0]}: ${msg}',
      exclude: []
    },
    branch: 'hotfix/URGENT-456/security-fix',
    message: 'fix security vulnerability'
  },
  {
    name: 'Skip Existing Prefix',
    description: 'Shows skip behavior when prefix already exists',
    config: {
      includePattern: ['*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '${segs[0]}: ${msg}',
      exclude: []
    },
    branch: 'feature/DEF-789/api-refactor',
    message: 'DEF-789: refactor user API endpoints'
  },
  {
    name: 'Complex Pattern Matching',
    description: 'Include only specific patterns',
    config: {
      includePattern: ['feature/*', 'hotfix/*'],
      format: '🚀 ${ticket}: ${msg}',
      fallbackFormat: '⚡ ${segs[0]}: ${msg}',
      exclude: ['template', 'merge']
    },
    branch: 'release/v1.2.0',
    message: 'prepare release candidate'
  }
];

const ExampleScenarios: React.FC<ExampleScenariosProps> = ({ onApplyExample }) => {
  return (
    <div className="example-scenarios">
      <h2>📚 Example Scenarios</h2>
      <p className="examples-description">
        Try these common configuration patterns to see how they work
      </p>
      
      <div className="examples-grid">
        {EXAMPLE_SCENARIOS.map((scenario, index) => (
          <div key={index} className="example-card">
            <div className="example-header">
              <h3>{scenario.name}</h3>
              <p>{scenario.description}</p>
            </div>
            
            <div className="example-details">
              <div className="example-item">
                <strong>Branch:</strong> <code>{scenario.branch}</code>
              </div>
              <div className="example-item">
                <strong>Message:</strong> <code>{scenario.message}</code>
              </div>
              <div className="example-item">
                <strong>Format:</strong> <code>{scenario.config.format}</code>
              </div>
              <div className="example-item">
                <strong>Include:</strong> <code>{
                  Array.isArray(scenario.config.includePattern) 
                    ? scenario.config.includePattern.join(', ') 
                    : (scenario.config.includePattern || '*')
                }</code>
              </div>
            </div>
            
            <button 
              className="example-apply-btn"
              onClick={() => onApplyExample(scenario.config, scenario.branch, scenario.message)}
            >
              Try This Example
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleScenarios;