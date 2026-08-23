import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ShoppingCart, Package } from 'lucide-react';
import api from '../api';

export default function CreateBundle({ onBack }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/bundles/products');
            setProducts(data.results || data.data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = (id) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(p => p !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || selectedProducts.length === 0) return alert("Please fill all fields and select at least one product.");
        setSaving(true);
        try {
            await api.post('/bundles', {
                name,
                targetProductIds: selectedProducts,
                triggerQuantity: 1, // Buy 1
                discountPercentage: 100, // Get 1 Free (100% off)
                rewardQuantity: 1
            });
            onBack(); // Go back to list
        } catch (error) {
            console.error(error);
            alert("Failed to create bundle");
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}>
                <ArrowLeft size={18} /> Back to Bundles
            </button>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart /> Create "Buy 1 Get 1 Free" Bundle
                </h2>
                
                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Bundle Name (Visible to Customers)</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Summer Special BOGO"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Applicable Products</label>
                        
                        {loading ? <p>Loading products from your store...</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {products.map(product => {
                                    const isSelected = selectedProducts.includes(product.id);
                                    return (
                                        <div 
                                            key={product.id} 
                                            onClick={() => toggleProduct(product.id)}
                                            style={{ 
                                                border: `2px solid ${isSelected ? 'var(--brand-primary)' : 'var(--glass-border)'}`,
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                transition: 'var(--transition-fast)'
                                            }}
                                        >
                                            <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0].image?.thumbnail} alt={product.name?.en} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                                ) : <Package />}
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{product.name?.en || product.name?.ar}</h4>
                                            {isSelected && <div style={{ color: 'var(--brand-primary)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600 }}><Check size={14}/> Selected</div>}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }} disabled={saving}>
                        {saving ? 'Creating Bundle...' : 'Launch Bundle on Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}
