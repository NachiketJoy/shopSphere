let dataTableInstance;
const passwordUpdateForm = document.getElementById("passwordForm");
const addProductBtn = document.getElementById("addProductBtn");
const addProductForm = document.getElementById("addProductForm");
const editProductForm = document.getElementById("editProductForm");
const errorMsg = document.getElementById('error'); 

function adminFetchProducts() {
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
                    `<button class="btn btn-primary" onclick="openEditModal('${product._id}')">Edit</button>
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
                            <button class="btn btn-primary" onclick="openEditModal('${product._id}')">Edit</button>
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
                    responsive: true
                });
            }
        })
        .catch(error => console.error('Error loading products:', error));
}

function adminModal (categories, retailers) {
      // Initialize modals
      const addModal = document.getElementById('addProductModal');
      const editModal = document.getElementById('editProductModal');
      M.Modal.init(addModal);
      M.Modal.init(editModal);

      // Populate category/retailer select dropdowns
      const addCategorySelect = document.getElementById('addProductCategory');
      const editCategorySelect = document.getElementById('productCategory');
      const addRetailerSelect = document.getElementById('addProductRetailer');
      const editRetailerSelect = document.getElementById('productRetailer');

      categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;

          // Add to both dropdowns
          addCategorySelect.appendChild(option.cloneNode(true));
          editCategorySelect.appendChild(option.cloneNode(true));
      });

      retailers.forEach(retailer => {
          const option = document.createElement('option');
          option.value = retailer;
          option.textContent = retailer;
  
          addRetailerSelect.appendChild(option.cloneNode(true));
          editRetailerSelect.appendChild(option.cloneNode(true));
      });

      // Initialize Materialize select
      M.FormSelect.init(addCategorySelect);
      M.FormSelect.init(editCategorySelect);
      M.FormSelect.init(addRetailerSelect);
      M.FormSelect.init(editRetailerSelect);

      
      const selects = document.querySelectorAll('select');
      M.FormSelect.init(selects, {
          dropdownOptions: {
              constrainWidth: true, 
              container: document.body, // Attach the dropdown to the body to avoid going beyond the modal
          },
      });
}

// Open Add Product Modal
addProductBtn?.addEventListener('click', function () {
    // Clear the form fields before opening the modal
    document.getElementById('addProductName').value = '';
    document.getElementById('addProductDescription').value = '';
    document.getElementById('addProductCategory').value = '';
    document.getElementById('addProductPrice').value = '';
    document.getElementById('addProductQuantity').value = '';
    document.getElementById('addProductRetailer').value = '';

    // Update Materialize input fields
    M.updateTextFields();

    // Open the modal
    const addModal = M.Modal.getInstance(document.getElementById('addProductModal'));
    addModal.open();
});

// Add Product Form Submit
addProductForm?.addEventListener('submit', function (event) {
    event.preventDefault();

    // Get form data
    const newProduct = {
        name: document.getElementById('addProductName').value,
        description: document.getElementById('addProductDescription').value,
        category: document.getElementById('addProductCategory').value,
        price: parseFloat(document.getElementById('addProductPrice').value),
        quantity: parseInt(document.getElementById('addProductQuantity').value, 10),
        retailer: document.getElementById('addProductRetailer').value,
    };

    // Send POST request to add product
    fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            // Close modal and show success alert
            const modal = M.Modal.getInstance(document.getElementById('addProductModal'));
            modal.close();
            socket.emit('newItem', {
                from: 'Admin',
                text: `A new Product ${data.data.name} has been added`,
                createdAt: new Date().toISOString(),
              });   
            showToast("Product added successfully");
            adminFetchProducts(); // Refresh product list
        } else {
            showToast("Failed to add product");
            console.error("Failed to add product");
        }
    })
    .catch((error) => {
        showToast('There was an error adding the product');
        console.error('Error adding product:', error);
    });
});

// Open Edit Product Modal
function openEditModal(productId) {
    fetch(`/products/${productId}`)
        .then((response) => response.json())
        .then((product) => {

            // Populate modal fields with product data
            document.getElementById('productName').value = product.data.name;
            document.getElementById('productDescription').value = product.data.description;
            document.getElementById('productCategory').value = product.data.category;
            document.getElementById('productPrice').value = product.data.price;
            document.getElementById('productQuantity').value = product.data.quantity;
            document.getElementById('productRetailer').value = product.data.retailer;

            // Save productId in a hidden input or globally
            document.getElementById('editProductForm').dataset.productId = productId;

            // Update Materialize input fields
            M.updateTextFields();

            // Open the modal
            const editModal  = M.Modal.getInstance(document.getElementById('editProductModal'));
            editModal .open();
        })
        .catch((error) => console.error('Error fetching product details:', error));
}

// Edit Product Form Submit
editProductForm?.addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the productId from the form's dataset
    const productId = this.dataset.productId;

    // Get form data
    const updatedProduct = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value, 10),
        retailer: document.getElementById('productRetailer').value,
    };

    // Send update request
    fetch(`/products/${productId}/edit`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
    })
    .then((response) => response.json())
    .then((data) => {
        if(data.success) {
            // Close modal and refresh products list
            const modal = M.Modal.getInstance(document.getElementById('editProductModal'));
            modal.close();
            showToast('Product updated successfully')
            adminFetchProducts();
        } else {
            showToast('Failed to update product')
            console.error('Failed to update product');
        }
    })
    .catch((error) => {
        showToast('There was an error updating the product')
        console.error('Error updating product:', error)
    });
});

// Function to handle the delete operation
async function deleteProduct(id) {
    const confirmation = confirm('Are you sure you want to delete this product?');
    if (!confirmation) return;

    try {
        const response = await fetch(`/products/${id}/delete`, {
            method: 'DELETE',
        });

        if (response.ok) {
            showToast('Product deleted successfully');
            adminFetchProducts(); 
        } else {
            showToast('Error deleting product');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting product');
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
                    responsive: true,
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

    errorMsg.textContent= '';
    let msg = [];

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    // const strongPassword = password => {
    //     return /^(?=.*[!@#$%^&*])[\S]{8,}$/.test(password);
    // };

    // if (!strongPassword(newPassword)) {
    //     msg.push('Password should be at least 8 characters and contain at least 1 special character (!@#$%^&*).');
    //     errorMsg.innerText = msg.join(', ');
    //     return ;
    // }

    // console.log(newPassword)
    // console.log(current)
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
