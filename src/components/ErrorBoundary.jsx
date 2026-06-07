import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          background: '#060b26',
          color: 'white',
          fontFamily: 'Outfit, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
              Something went wrong
            </h2>
            <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null, errorInfo: null }); window.location.reload(); }}
              style={{
                background: '#0075ff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Reload Page
            </button>
            {import.meta.env?.DEV && this.state.errorInfo && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{ color: '#a0aec0', cursor: 'pointer', fontSize: '0.75rem' }}>
                  Show Error Details (Dev Only)
                </summary>
                <pre style={{
                  marginTop: '0.75rem',
                  fontSize: '0.65rem',
                  color: '#ef4444',
                  overflow: 'auto',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
