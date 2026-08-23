import { Routes, Route, useSearchParams } from 'react-router-dom';
import './App.css';

// Placeholder Components
const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('store_id');
  const status = searchParams.get('status');

  return (
    <div className="dashboard" style={{ textAlign: 'center' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Bundles Dashboard</h1>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Welcome to Zid Bundles</h2>
        
        {status === 'installed' && (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            App successfully installed for Store: {storeId}!
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Configure your dynamic bundle offers natively via Zid's Discount Rules API.
        </p>
        <button className="btn-primary" style={{ fontSize: '1.1rem' }}>Create New Bundle</button>
      </div>
    </div>
  );
};

const AuthCallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <h2 className="text-gradient" style={{ fontSize: '2rem' }}>Authenticating...</h2>
  </div>
);

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </div>
  );
}

export default App;
