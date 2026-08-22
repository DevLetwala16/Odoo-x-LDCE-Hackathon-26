import './App.css'

/**
 * App — Top-level component.
 * Phase 1: Minimal shell verifying the design system works.
 * Phase 2 will add BrowserRouter, AuthProvider, and all routes.
 */
function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: 'var(--space-6)',
      padding: 'var(--space-8)',
    }}>
      <h1 style={{ color: 'var(--color-primary)' }}>🌍 GlobeTrotter</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
        Empowering Personalized Travel Planning
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <button style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 'var(--font-weight-semibold)',
          transition: 'background-color var(--transition-fast)',
        }}>
          Primary Button
        </button>
        <button style={{
          backgroundColor: 'var(--color-accent)',
          color: '#FFFFFF',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 'var(--font-weight-semibold)',
          transition: 'background-color var(--transition-fast)',
        }}>
          Accent CTA
        </button>
      </div>
      <p style={{ 
        color: 'var(--color-text-secondary)', 
        fontSize: 'var(--font-size-sm)',
        marginTop: 'var(--space-8)',
      }}>
        Phase 1 — Foundation & Infrastructure ✅
      </p>
    </div>
  )
}

export default App
