const checkoutForm = document.getElementById("checkoutForm");

async function loadCart() {
    try {
        const response = await fetch('/cart/items');
        const data = await response.json();

        if (data.success) {
            displayCartItems(data.cartItems);
            updateCartTotal(data.cartItems);
        }
    } catch (error) {
        M.toast({ html: 'Error loading cart items' });
    }
}

function displayCartItems(items) {
    const container = document.getElementById('cartItems');
    if (items.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = items.length === 0;

    container.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item._id}">
        <img src="${item.productId.image || 'https://placehold.co/100x100'}" alt="${item.productId.name}">
        <div class="item-details">
            <h5>${item.productId.name}</h5>
            <p>Retailer: ${item.productId.retailer}</p>
            <p>Price: $${item.productId.price}</p>
            <div class="quantity-controls">
            <button class="btn-small" onclick="updateQuantity('${item._id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button class="btn-small" onclick="updateQuantity('${item._id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="btn-small red" onclick="removeItem('${item._id}')">Remove</button>
        </div>
        </div>
    `).join('');
}

async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;

    const response = await fetch(`/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
    });

    if (response.ok) {
        loadCart();
        updateCartCount();
    }
}

async function removeItem(itemId) {
    const response = await fetch(`/cart/delete/${itemId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        loadCart();
        updateCartCount();
    }
}

async function clearCart() {
    const response = await fetch('/cart/clear', {
        method: 'DELETE'
    });

    if (response.ok) {
        loadCart();
        updateCartCount();
    }
}

function updateCartTotal(items) {
    const total = items.reduce((sum, item) => {
        return sum + (item.productId.price * item.quantity);
    }, 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function checkout() {
    window.location.href = '/checkout';
}

checkoutForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderData = {
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value,
        shippingAddress: {
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            country: document.getElementById('country').value
        }
    };

    const errorMsg = document.getElementById('error'); 
    let msg = []; 
    
    const cardNumber = document.getElementById('cardNumber');
    const isValidCardNumber = number => { 
        return /^\d{16}$/.test(number); 
    }; 
    if (!isValidCardNumber(cardNumber.value)) {
        msg.push('The card number should include 16 digits');
        errorMsg.innerText = msg.join(', ');
        cardNumber.focus();
        return false;
    }

    const expiryDate = document.getElementById('expiryDate');
    const isValidExpiryDate = date => { 
        return /^\d{2}\/\d{2}$/.test(date);  
    }; 
    if (!isValidExpiryDate(expiryDate.value)) {
        msg.push('The expiry date should include 4 digits');
        errorMsg.innerText = msg.join(', ');
        expiryDate.focus();
        return false;
    }

    const cvv = document.getElementById('cvv');
    const isValidCVV = cvv => { 
        return /^\d{3}$/.test(cvv);    
    };
    if (!isValidCVV(cvv.value)) {
        msg.push('The cvv should include 3 digits');
        errorMsg.innerText = msg.join(', ');
        cvv.focus();
        return false;
    }

    const postalCode = document.getElementById('postalCode');
    const isValidPostalCode = code => { 
        return /^\d{4}$/.test(code);     
    }; 
    if (!isValidPostalCode(postalCode.value)) {
        msg.push('The postal code should include 4 digits');
        errorMsg.innerText = msg.join(', ');
        postalCode.focus();
        return false;
    }

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify(orderData)
             body: JSON.stringify(cardNumber, expiryDate, cvv, postalCode)
        });

        const data = await response.json();
        if (data.success) {
            const socket = io(`/order/${data.order._id}`);

            socket.on('statusUpdate', (data) => {
                M.toast({ html: `Order status: ${data.status}` });
                updateNotifications(data);
            });

            window.location.href = '/order';
        }
    } catch (error) {
        M.toast({ html: 'Error creating order' });
    }
});

async function loadCheckoutItems() {
    try {
        const response = await fetch('/cart/items');
        const data = await response.json();

        if (data.success) {
            displayCheckoutItems(data.cartItems);
            updateTotalAmount(data.cartItems);
        }
    } catch (error) {
        M.toast({ html: 'Error loading cart items' });
    }
}

function displayCheckoutItems(items) {
    const container = document.getElementById('checkoutItems');
    container.innerHTML = items.map(item => `
            <div class="checkout-item">
                <div class="item-info">
                    <img src="${item.productId.image || 'https://placehold.co/100x100'}" alt="${item.productId.name}">
                    <div class="item-details">
                        <h6>${item.productId.name}</h6>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: $${item.productId.price}</p>
                    </div>
                </div>
                <div class="item-total">
                    $${(item.productId.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
}

function updateTotalAmount(items) {
    const total = items.reduce((sum, item) => {
        return sum + (item.productId.price * item.quantity);
    }, 0);
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

