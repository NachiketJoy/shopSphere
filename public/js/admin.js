let dataTableInstance;
const passwordUpdateForm = document.getElementById("passwordForm");

function fetchProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(data => {
            const productsTableBody = document.getElementById('productsTableBody');
            productsTableBody.innerHTML = ''; 

            // Clear previous DataTable data
            if (dataTableInstance) {
                dataTableInstance.clear();
            }

            // Populate DataTable with fetched product data
            data.data.forEach(product => {
                const row = [
                    product.name,
                    product.description,
                    product.category,
                    product.price,
                    product.quantity,
                    product.retailer,
                    `<a href="/products/${product._id}/edit" class="btn btn-primary">Edit</a>
                     <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>`
                ];

                // Add row to DataTable
                if (dataTableInstance) {
                    dataTableInstance.row.add(row);
                } else {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>${product.name}</td>
                        <td>${product.description}</td>
                        <td>${product.category}</td>
                        <td>${product.price}</td>
                        <td>${product.quantity}</td>
                        <td>${product.retailer}</td>
                        <td>
                            <a href="/products/${product._id}/edit" class="btn btn-primary">Edit</a>
                            <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                        </td>
                    `;
                    productsTableBody.appendChild(newRow);
                }
            });

            if (dataTableInstance) {
                dataTableInstance.draw();
            } else {
                // Initialize DataTable if it's not already initialized
                dataTableInstance = new DataTable('#productsTable', {
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    pageLength: 8,
                });
            }
        })
        .catch(error => console.error('Error loading products:', error));
}

// Function to handle the delete operation
async function deleteProduct(id) {
    const confirmation = confirm('Are you sure you want to delete this product?');
    if (!confirmation) return;

    try {
        const response = await fetch(`/products/${id}/delete`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Product deleted successfully');
            fetchProducts(); 
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product');
    }
}

function fetchOrders() {
    fetch('/admin/orders')
        .then(response => response.json())
        .then(data => {
            const ordersTableBody = document.getElementById('ordersTableBody');
            ordersTableBody.innerHTML = ''; 

            if (Array.isArray(data)) {
                data.forEach(order => {
               
                    const userAddress = order.userId ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}` : 'N/A';
                    const userFullName = order.userId && order.userId._id ? order.userId.fullName : 'N/A';
                    const totalAmount = order.totalAmount;
                    const status = order.status;
                    const orderDate = new Date(order.orderedAt).toLocaleDateString();
                    const shippedDate = order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : 'N/A';
                    const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A';

                    let orderItemsHtml = '';
                    order.orderItems.forEach(item => {
                        const productName = item.productId ? item.productId.name : 'Unknown Product';
                        const productPrice = item.price;
                        const quantity = item.quantity;
                        orderItemsHtml += `<p>${productName} (x${quantity}) - $${productPrice}</p>`;
                    });

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${userFullName}</td>
                        <td>${userAddress}</td>
                        <td>${orderItemsHtml}</td>
                        <td>$${totalAmount}</td>
                        <td>${status}</td>
                        <td>${orderDate}</td>
                        <td>${shippedDate}</td>
                        <td>${deliveredDate}</td>
                    `;
                    ordersTableBody.appendChild(row);
                });

                if ($.fn.dataTable.isDataTable('#ordersTable')) {
                    $('#ordersTable').DataTable().destroy();
                }

                new DataTable('#ordersTable', {
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    pageLength: 8,
                });

            } else {
                console.error('Expected an array of orders, but got:', data);
            }
        })
        .catch(error => console.error('Error loading orders:', error));
}

// Function to handle the update password form
passwordUpdateForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // retrieve both password field value
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
      const response = await fetch('/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      // Get the status message element
      const statusMessage = document.querySelector('.status-message');

      if (data.success) {
        // Update status message for success
        statusMessage.textContent = data.message;
        statusMessage.style.color = 'green';
        document.getElementById('passwordForm').reset();
      } else {
        // Update status message for error
        statusMessage.textContent = data.message || 'An error occurred. Please try again.';
        statusMessage.style.color = 'red';
      }

      // Show the status message
      statusMessage.style.display = 'block';

    } catch (error) {
      console.error('Error:', error);
      const statusMessage = document.querySelector('.status-message');
      statusMessage.textContent = 'Something went wrong. Please try again.';
      statusMessage.style.color = 'red';
      statusMessage.style.display = 'block';
    }
})
