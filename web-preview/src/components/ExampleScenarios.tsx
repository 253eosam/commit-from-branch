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
  category: string;
}

const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    name: '🎫 JIRA Ticket Format',
    description: 'Standard format with JIRA ticket prefix',
    category: 'Basic',
    config: {
      includePattern: ['feature/*', 'bugfix/*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: []
    },
    branch: 'feature/ABC-123/user-authentication',
    message: 'implement OAuth2 login flow'
  },
  {
    name: '📦 Simple Prefix',
    description: 'Simple branch prefix without ticket requirement',
    category: 'Basic',
    config: {
      includePattern: ['*'],
      format: '[${seg0}] ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: []
    },
    branch: 'feature/user-profile',
    message: 'add profile picture upload'
  },
  {
    name: '🔥 Hotfix Emergency',
    description: 'Emergency hotfix with special formatting',
    category: 'Advanced',
    config: {
      includePattern: ['hotfix/*'],
      format: '🚨 HOTFIX ${ticket}: ${msg}',
      fallbackFormat: '🚨 HOTFIX [${seg0}]: ${msg}',
      exclude: []
    },
    branch: 'hotfix/URGENT-456/security-fix',
    message: 'fix critical authentication bypass'
  },
  {
    name: '🏷️ Multi-Segment Branches',
    description: 'Using multiple branch segments in templates',
    category: 'Advanced',
    config: {
      includePattern: ['*'],
      format: '[${seg0}/${seg1}] ${ticket}: ${msg}',
      fallbackFormat: '[${seg0}/${seg1}] ${msg}',
      exclude: []
    },
    branch: 'feature/payments/stripe-integration',
    message: 'add payment processing with Stripe API'
  },
  {
    name: '🚫 Skip Existing Prefix',
    description: 'Shows skip behavior when prefix already exists',
    category: 'Edge Cases',
    config: {
      includePattern: ['*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: []
    },
    branch: 'feature/DEF-789/api-refactor',
    message: 'DEF-789: refactor user API endpoints'
  },
  {
    name: '📋 Conventional Commits',
    description: 'Following conventional commit standards',
    category: 'Advanced',
    config: {
      includePattern: ['feat/*', 'fix/*', 'docs/*'],
      format: '${seg0}(${ticket}): ${msg}',
      fallbackFormat: '${seg0}: ${msg}',
      exclude: []
    },
    branch: 'feat/AUTH-456/oauth-integration',
    message: 'add Google OAuth integration'
  },
  {
    name: '🌟 Prefix Template',
    description: 'Using prefix token for branch segments',
    category: 'Advanced',
    config: {
      includePattern: ['*'],
      format: '[${prefix:2}] ${ticket}: ${msg}',
      fallbackFormat: '[${prefix:2}] ${msg}',
      exclude: []
    },
    branch: 'feature/backend/database/user-migration',
    message: 'migrate user table to new schema'
  },
  {
    name: '🎯 Team-based Branching',
    description: 'Different formats based on team prefixes',
    category: 'Advanced',
    config: {
      includePattern: ['frontend/*', 'backend/*', 'mobile/*'],
      format: '${seg0}: ${ticket} - ${msg}',
      fallbackFormat: '${seg0}: ${msg}',
      exclude: []
    },
    branch: 'frontend/WEB-789/component-library',
    message: 'create reusable button component'
  },
  {
    name: '🔍 Pattern Exclusion',
    description: 'Complex pattern matching with exclusions',
    category: 'Edge Cases',
    config: {
      includePattern: ['feature/*', 'bugfix/*', 'improvement/*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: ['template', 'merge', 'revert']
    },
    branch: 'improvement/PERF-321/database-optimization',
    message: 'optimize database queries for user search'
  },
  {
    name: '📝 Documentation Updates',
    description: 'Special format for documentation changes',
    category: 'Advanced',
    config: {
      includePattern: ['docs/*', 'readme/*'],
      format: '📚 ${ticket}: ${msg}',
      fallbackFormat: '📚 [${seg0}] ${msg}',
      exclude: []
    },
    branch: 'docs/update-installation-guide',
    message: 'update installation instructions for v2.0'
  },
  {
    name: '🧪 Testing Scenarios',
    description: 'Format for test-related branches',
    category: 'Advanced',
    config: {
      includePattern: ['test/*', 'testing/*'],
      format: '🧪 ${ticket}: ${msg}',
      fallbackFormat: '🧪 [${seg0}] ${msg}',
      exclude: []
    },
    branch: 'test/e2e-authentication',
    message: 'add end-to-end tests for login flow'
  },
  {
    name: '🎨 Design System',
    description: 'Format for design and UI related changes',
    category: 'Advanced',
    config: {
      includePattern: ['design/*', 'ui/*', 'style/*'],
      format: '🎨 ${ticket}: ${msg}',
      fallbackFormat: '🎨 [${seg0}] ${msg}',
      exclude: []
    },
    branch: 'design/DESIGN-123/color-palette-update',
    message: 'update primary color palette for accessibility'
  },
  {
    name: '🐛 Bug Tracking',
    description: 'Dedicated bug fix format with issue numbers',
    category: 'Basic',
    config: {
      includePattern: ['bugfix/*', 'fix/*'],
      format: '🐛 Fix ${ticket}: ${msg}',
      fallbackFormat: '🐛 Fix: ${msg}',
      exclude: []
    },
    branch: 'bugfix/BUG-999/memory-leak',
    message: 'resolve memory leak in event listeners'
  },
  {
    name: '🚀 Release Preparation',
    description: 'Format for release and deployment branches',
    category: 'Advanced',
    config: {
      includePattern: ['release/*', 'deploy/*'],
      format: '🚀 Release ${ticket}: ${msg}',
      fallbackFormat: '🚀 ${seg0}: ${msg}',
      exclude: []
    },
    branch: 'release/v2.1.0',
    message: 'prepare v2.1.0 with new payment features'
  },
  {
    name: '⚡ Performance Optimization',
    description: 'Format for performance improvement branches',
    category: 'Advanced',
    config: {
      includePattern: ['perf/*', 'performance/*', 'optimization/*'],
      format: '⚡ ${ticket}: ${msg}',
      fallbackFormat: '⚡ [${seg0}] ${msg}',
      exclude: []
    },
    branch: 'perf/PERF-555/lazy-loading',
    message: 'implement lazy loading for product images'
  }
];

const ExampleScenarios: React.FC<ExampleScenariosProps> = ({ onApplyExample }) => {
  const groupedScenarios = EXAMPLE_SCENARIOS.reduce((acc, scenario) => {
    if (!acc[scenario.category]) {
      acc[scenario.category] = [];
    }
    acc[scenario.category].push(scenario);
    return acc;
  }, {} as Record<string, ExampleScenario[]>);

  const categoryOrder = ['Basic', 'Advanced', 'Edge Cases'];

  return (
    <div className="example-scenarios">
      <h2>📚 Example Scenarios</h2>
      <p className="examples-description">
        Try these common configuration patterns to see how they work
      </p>

      {categoryOrder.map(category => (
        <div key={category} className="scenario-category">
          <h3 className="category-title">{category}</h3>
          <div className="examples-grid">
            {groupedScenarios[category]?.map((scenario, index) => (
              <div key={index} className="example-card">
                <div className="example-header">
                  <h4>{scenario.name}</h4>
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
                  onClick={() => {
                    onApplyExample(scenario.config, scenario.branch, scenario.message);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Try This Example
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExampleScenarios;