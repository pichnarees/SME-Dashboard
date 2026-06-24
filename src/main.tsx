import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress ResizeObserver limit errors globally as they are completely benign Recharts redraw notifications
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('ResizeObserver') || 
     event.message.includes('Resize observer') ||
     event.message === 'Script error.')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

// Global error handler to catch and display any runtime script errors on-screen
window.addEventListener('error', (event) => {
  // Ignore generic cross-origin "Script error." or browser extension errors which are unrelated to the app
  if (
    !event.filename ||
    event.message === "Script error." ||
    event.message?.includes("ResizeObserver") ||
    event.filename.startsWith("chrome-extension:") ||
    event.filename.includes("extension") ||
    event.filename.includes("doubleclick") ||
    event.filename.includes("google-analytics")
  ) {
    return;
  }

  const errorContainer = document.getElementById('runtime-error-display');
  if (errorContainer) {
    errorContainer.style.display = 'block';
    const msg = document.getElementById('runtime-error-message');
    if (msg) msg.textContent = `${event.message || 'Unknown Error'} at ${event.filename || ''}:${event.lineno || ''}`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const errorContainer = document.getElementById('runtime-error-display');
  if (errorContainer) {
    errorContainer.style.display = 'block';
    const msg = document.getElementById('runtime-error-message');
    if (msg) msg.textContent = `Unhandled Promise Rejection: ${event.reason?.message || event.reason || 'Unknown error'}`;
  }
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* On-screen error overlay to diagnose any cross-origin or React 19 issues */}
      <div 
        id="runtime-error-display" 
        style={{
          display: 'none', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          background: '#fee2e2', 
          borderBottom: '4px solid #ef4444', 
          color: '#991b1b', 
          padding: '16px', 
          fontSize: '13px', 
          zIndex: 99999,
          fontFamily: 'monospace',
          lineHeight: '1.5'
        }}
      >
        <div style={{fontWeight: 'bold', marginBottom: '8px', fontSize: '14px'}}>⚠️ Diagnostic Runtime Error Encountered:</div>
        <pre id="runtime-error-message" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}></pre>
        <button 
          onClick={() => {
            const el = document.getElementById('runtime-error-display');
            if (el) el.style.display = 'none';
          }}
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Dismiss Diagnosis Overlay
        </button>
      </div>
      <App />
    </StrictMode>,
  );
} catch (err: any) {
  console.error("Mount error:", err);
}

