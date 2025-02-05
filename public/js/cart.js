const checkoutForm = document.getElementById("checkoutForm");
const cardNumber = document.getElementById('cardNumber');
const expiryDate = document.getElementById('expiryDate');
const cvv = document.getElementById('cvv');
const postalCode = document.getElementById('postalCode');

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

    const errorMsg = document.getElementById('error'); 
    errorMsg.textContent= '';

    let msg = []; 
    
    
    if (!isValidCardNumber(cardNumber.value)) {
        msg.push('Enter a valid card number(16 Digits)');
    }

    if (!isValidExpiryDate(expiryDate.value)) {
        msg.push('The expiry date should be in MM/YY format');
    }

    if (!isValidCVV(cvv.value)) {
        msg.push('Enter a valid CVV');
    }

    if (!isValidPostalCode(postalCode.value)) {
        msg.push('Enter a valid postal code');
    }

    if(msg.length > 0) {
        errorMsg.textContent = msg.join(', ');
        return
    } 

    const orderData = {
        cardNumber: cardNumber?.value,
        expiryDate: expiryDate?.value,
        cvv: cvv?.value,
        shippingAddress: {
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            postalCode: postalCode?.value,
            country: document.getElementById('country').value
        }
    };

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
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

