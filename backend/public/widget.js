(function() {
    // Ensure we are in a Zid store
    if (!window.zid) return;
    
    const storeId = (window.zid && window.zid.store && window.zid.store.id) ? window.zid.store.id : 'undefined';
    
    // Robustly find the product UUID on any Zid theme
    function extractProductId() {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const elements = document.querySelectorAll('button, input, div, span, form');
        
        for (let el of elements) {
            // Check form action
            if (el.action) {
                const match = el.action.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                if (match) return match[0];
            }
            // Check dataset
            if (el.dataset) {
                for (let key in el.dataset) {
                    if (uuidRegex.test(el.dataset[key])) return el.dataset[key];
                }
            }
            // Check values/IDs
            if (el.value && uuidRegex.test(el.value)) return el.value;
            if (el.id && uuidRegex.test(el.id)) return el.id;
        }
        return null;
    }
    
    const productId = extractProductId();
    if (!productId) return; // Not a product page or couldn't find ID

    // Fetch bundles for this specific product
    fetch(`https://zidbundle.oarood.com/api/storefront/bundles?store_id=${storeId}&product_id=${productId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.length > 0) {
                renderBundleWidget(data.data[0]); // Render the first active bundle
            }
        })
        .catch(err => console.error('Zid Bundles: Failed to fetch bundles', err));

    function renderBundleWidget(bundle) {
        const container = document.createElement('div');
        container.id = 'zid-bundle-offer-widget';
        container.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            border: 2px dashed #6366f1;
            border-radius: 8px;
            background-color: rgba(99, 102, 241, 0.05);
            text-align: center;
            font-family: inherit;
        `;
        
        let rewardText = bundle.discount_percentage === 100 
            ? 'for FREE' 
            : `with ${bundle.discount_percentage}% OFF`;
            
        container.innerHTML = `
            <h3 style="margin-top:0; color: #4f46e5; font-size: 1.2rem;">🔥 Special Bundle Offer: ${bundle.name}</h3>
            <p style="margin-bottom: 15px; color: #333;">Add this bundle to your cart and get the reward item <strong>${rewardText}</strong>!</p>
            <button id="zid-bundle-add-btn" style="
                background-color: #6366f1;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 1rem;
                transition: background-color 0.2s;
                width: 100%;
            ">Add Bundle to Cart</button>
        `;

        // Inject the widget just above the add to cart button (usually .product-form or .add-to-cart-btn)
        const addToCartForm = document.querySelector('form[action*="/cart/add"]') || document.querySelector('.add-to-cart-btn');
        if (addToCartForm) {
            addToCartForm.parentNode.insertBefore(container, addToCartForm);
        } else {
            // Fallback, just append to product details
            const productDetails = document.querySelector('.product-details') || document.body;
            productDetails.appendChild(container);
        }

        document.getElementById('zid-bundle-add-btn').addEventListener('click', function(e) {
            e.preventDefault();
            this.innerText = 'Adding...';
            this.disabled = true;
            this.style.backgroundColor = '#9ca3af';

            // Add the trigger product
            const addTrigger = window.zid.cart.addProduct({
                productId: bundle.target_product_ids[0],
                quantity: bundle.trigger_quantity || 1
            });

            // Add the reward product
            const addReward = window.zid.cart.addProduct({
                productId: bundle.reward_product_ids[0],
                quantity: bundle.reward_quantity || 1
            });

            Promise.all([addTrigger, addReward]).then(() => {
                this.innerText = 'Added successfully!';
                this.style.backgroundColor = '#10b981'; // Green
                
                // Optional: Trigger Zid cart drawer to open or redirect to cart
                setTimeout(() => {
                    window.location.href = '/cart';
                }, 1000);
            }).catch(err => {
                console.error(err);
                this.innerText = 'Error. Try again';
                this.disabled = false;
                this.style.backgroundColor = '#ef4444'; // Red
            });
        });
    }
})();
