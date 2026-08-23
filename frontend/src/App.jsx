import { Routes, Route, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import BundlesList from './components/BundlesList';
import CreateBundle from './components/CreateBundle';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('store_id');
  const status = searchParams.get('status');
  const [view, setView] = useState('list'); // 'list' or 'create'

  return (
    <div className="dashboard" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Zid Bundles</h1>
      
      {status === 'installed' && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          App successfully installed for Store: {storeId}!
        </div>
      )}

      {view === 'list' ? (
        <BundlesList onCreateNew={() => setView('create')} />
      ) : (
        <CreateBundle onBack={() => setView('list')} />
      )}
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
