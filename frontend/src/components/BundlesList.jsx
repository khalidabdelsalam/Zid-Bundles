import { useEffect, useState } from 'react';
import { Package, Plus, Trash2, Tag } from 'lucide-react';
import api from '../api';

export default function BundlesList({ onCreateNew }) {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBundles();
    }, []);

    const fetchBundles = async () => {
        try {
            const { data } = await api.get('/bundles');
            setBundles(data.data || []);
        } catch (error) {
            console.error("Failed to fetch bundles:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBundle = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bundle?")) return;
        try {
            await api.delete(`/bundles/${id}`);
            setBundles(bundles.filter(b => b.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package /> Active Bundles
                </h2>
                <button className="btn-primary" onClick={onCreateNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Create Bundle
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading bundles...</div>
            ) : bundles.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <Tag size={48} style={{ color: 'var(--brand-primary)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ marginBottom: '1rem' }}>No bundles found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Create your first Zid bundle offer to boost sales!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bundles.map(bundle => (
                        <div key={bundle.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>{bundle.name?.en || bundle.name?.ar}</h3>
                                <p style={{ margin: 0, color: 'var(--success)', fontSize: '0.9rem', fontWeight: 500 }}>Active - Auto applied at checkout</p>
                            </div>
                            <button onClick={() => deleteBundle(bundle.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '8px' }}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
