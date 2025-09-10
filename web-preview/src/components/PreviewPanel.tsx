import React from 'react';
import type { PreviewState } from '../core';

interface PreviewPanelProps {
  result: PreviewState;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ result }) => {
  const getFinalMessage = () => {
    if (result.shouldSkip) {
      return result.originalMessage;
    }
    return result.lines[0] || '';
  };

  const getStatusColor = () => {
    if (result.shouldSkip) {
      return result.skipReason?.includes('already') ? 'warning' : 'error';
    }
    return 'success';
  };

  const getStatusIcon = () => {
    if (result.shouldSkip) {
      return result.skipReason?.includes('already') ? '⚠️' : '❌';
    }
    return '✅';
  };

  return (
    <div className="preview-panel">
      <h2>📋 Preview Result</h2>
      
      <div className="preview-status">
        <div className={`status-badge ${getStatusColor()}`}>
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">
            {result.shouldSkip ? `Skipped: ${result.skipReason}` : 'Processing Success'}
          </span>
        </div>
      </div>

      <div className="preview-content">
        <div className="preview-section">
          <h3>📥 Input</h3>
          <div className="preview-box">
            <div className="preview-item">
              <strong>Branch:</strong> <code>{result.branch}</code>
            </div>
            <div className="preview-item">
              <strong>Original Message:</strong> <code>{result.originalMessage || '(empty)'}</code>
            </div>
            <div className="preview-item">
              <strong>Extracted Ticket:</strong> <code>{result.ticket || '(none)'}</code>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>🔄 Processing</h3>
          <div className="preview-box">
            <div className="preview-item">
              <strong>Template Used:</strong> <code>{result.template}</code>
            </div>
            <div className="preview-item">
              <strong>Rendered Template:</strong> <code>{result.renderedMessage}</code>
            </div>
            <div className="preview-item">
              <strong>Branch Segments:</strong> <code>[{result.context.segs.join(', ')}]</code>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>📤 Output</h3>
          <div className="preview-box">
            <div className="preview-item">
              <strong>Final Commit Message:</strong>
              <div className="final-message">
                <code>{getFinalMessage()}</code>
              </div>
            </div>
            {!result.shouldSkip && result.originalMessage !== getFinalMessage() && (
              <div className="preview-item change-indicator">
                <strong>Change:</strong> 
                <span className="change-text">Message will be modified</span>
              </div>
            )}
          </div>
        </div>

        {result.shouldSkip && (
          <div className="preview-section">
            <h3>ℹ️ Skip Reason</h3>
            <div className="preview-box skip-reason">
              <p>{result.skipReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;