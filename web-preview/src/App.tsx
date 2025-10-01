import { useState, useMemo } from 'react';
import { generatePreview, type CommitFromBranchConfig } from './core';
import ConfigForm from './components/ConfigForm';
import PreviewPanel from './components/PreviewPanel';
import ExampleScenarios from './components/ExampleScenarios';
import './App.css';

const DEFAULT_CONFIG: CommitFromBranchConfig = {
  includePattern: ['*'],
  format: '${ticket}: ${msg}',
  fallbackFormat: '${seg0}: ${msg}',
  exclude: []
};

function App() {
  const [config, setConfig] = useState<CommitFromBranchConfig>(DEFAULT_CONFIG);
  const [branch, setBranch] = useState('feature/ABC-123/user-authentication');
  const [commitMessage, setCommitMessage] = useState('add login functionality');

  const previewResult = useMemo(() => {
    return generatePreview(config, branch, commitMessage);
  }, [config, branch, commitMessage]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔧 Commit From Branch - Configuration Preview</h1>
        <p>Test your configuration settings and see how commit messages will be transformed</p>
      </header>

      <main className="app-main">
        <div className="config-section">
          <ConfigForm 
            config={config} 
            onChange={setConfig}
            branch={branch}
            onBranchChange={setBranch}
            commitMessage={commitMessage}
            onCommitMessageChange={setCommitMessage}
          />
        </div>

        <div className="preview-section">
          <PreviewPanel result={previewResult} />
        </div>

        <div className="examples-section">
          <ExampleScenarios 
            onApplyExample={(exampleConfig, exampleBranch, exampleMessage) => {
              setConfig(exampleConfig);
              setBranch(exampleBranch);
              setCommitMessage(exampleMessage);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default App
