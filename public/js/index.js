window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-content');
    if (loader) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            loader.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    } else {
        document.body.style.overflow = 'auto';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const authentication = document.getElementById('authentication');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const logoutBtn = document.getElementById('logout');
    const manageProductBtn = document.getElementById('manageProduct');
    const viewOrderBtn = document.getElementById('viewOrder');
    const forgotPassword = document.getElementById('forgotPassword');
    const backToSignIn = document.getElementById('back-to-sign-in');
    const footer = document.getElementById('footer');
    const toastSuccess = document.getElementById('toast__success');
    const toastError = document.getElementById('toast_error');
    const userDropdownButton = document.getElementById("userDropdownButton");
    const userInfoPopup = document.getElementById("userInfoPopup");
    const searchForm = document.getElementById("searchForm");
    const year = document.getElementById('year');
    
    const detailModal = document.getElementById('detailProductModal');
    M.Modal.init(detailModal);
    
    const currentPage = window.location.pathname;
    const toastMessage = toastSuccess || toastError;
    year.textContent = new Date().getFullYear();

    updateCartCount();

    // list of categories
    const categories = [
        "Technology",
        "Clothing",
        "Food",
        "Home & Garden",
        "Sports & Outdoors",
        "Books",
        "Beauty & Health",
        "Toys & Games",
        "Automotive",
        "Pet Supplies",
    ];

    // list of retailers
    const retailers = [
        "Amazon",
        "Walmart",
        "Target",
        "Best Buy",
        "Costco",
        "eBay",
        "Newegg",
        "Home Depot",
        "Macy's",
        "PetSmart",
    ];

    if (toastMessage !== null) {
        const message = toastMessage.getAttribute('data-message');
        const toastClass = toastSuccess ? 'toast__success' : 'toast__error';

        M.toast({
            html: message,
            classes: `toast ${toastClass}`,
            displayLength: 4000
        });
    }

    switch (currentPage) {
        case '/':
        case '/dashboard':
            footer.style.display = 'none';

            if (currentPage === '/dashboard') {
                manageProductBtn.addEventListener('click', adminFetchProducts);
                viewOrderBtn.addEventListener('click', fetchOrders);
                adminModal(categories, retailers);
            }
            break;

        case '/homepage':
            fetchProducts();
            break;

        case '/cart':
            loadCart();
            break;

        case '/checkout':
            loadCheckoutItems();
            break;
    }

    registerBtn?.addEventListener('click', () => {
        authentication.classList.add("active");
    });

    loginBtn?.addEventListener('click', () => {
        authentication.classList.remove("active");
    });

    logoutBtn?.addEventListener('click', () => {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Error logging out:', error);
            });
    });

    forgotPassword?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("sign-in-form").style.display = "none";
        document.getElementById("forgot-password-container").style.display = "block"
    });

    backToSignIn?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("sign-in-form").style.display = "block";
        document.getElementById("forgot-password-container").style.display = "none";
    });

    searchForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        fetchProducts();
    });

    var elems = document.querySelectorAll("select");
    M.FormSelect.init(elems);

    // Toggle pop up box
    if (userDropdownButton && userInfoPopup) {
        document.addEventListener("click", (e) => {
            // Check if the click target is the user dropdown button
            if (e.target === userDropdownButton) {
                e.preventDefault();
                userInfoPopup.classList.toggle("active");
            }
            // Check if the click target is outside of the user info popup
            else if (!userInfoPopup.contains(e.target)) {
                userInfoPopup.classList.remove("active");
            }
        });
    }
});

async function updateCartCount() {
    try {
        const response = await fetch("/cart/items");
        const data = await response.json();
        const cartCount = document.querySelector(".cart-count");

        if (data.success) {
            const totalItems = data.cartItems.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            if (cartCount) {
                cartCount.textContent = totalItems;
            }
        }
    } catch (error) {
        console.error("Error updating cart count:", error);
    }
}

function adminNav(evt, navItems) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    tablist = document.getElementsByClassName("sidenav-items")[0].getElementsByTagName("li");

    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    for (i = 0; i < tablist.length; i++) {
        tablist[i].classList.remove("active");
    }

    document.getElementById(navItems).style.display = "block";
    evt.currentTarget.classList.add("active");
    evt.currentTarget.closest("li").classList.add("active");
}

function showToast(message) {
    if (M && M.toast) {
        M.toast({ html: message });
    } else {
        console.error("Materialize is not loaded.");
    }
}

// homepage product
let productsList = [];
async function fetchProducts(page = 1) {
    try {
        const search = document.getElementById("search").value;
        const retailer = document.getElementById("retailer").value;
        const sortBy = document.getElementById("sortBy").value;
        const order = document.getElementById("order").value;

        const queryParams = new URLSearchParams({
            search,
            retailer,
            sortBy,
            order,
            page,
            limit: 12,
        });

        const response = await fetch(`/products?${queryParams}`);
        const data = await response.json();

        if (data.success) {
            productsList = data.data;
            displayProducts(productsList);
            displayPagination(data.pagination);
        } else {
            M.toast({ html: "Error loading products" });
        }
    } catch (error) {
        console.error("Error:", error);
        M.toast({ html: "Error loading products" });
    }
}

function displayProducts(products) {
    const container = document.getElementById("productsContainer");
    container.innerHTML = products.map((product) => {
        if (product.quantity != 0) {
            return `
            <div class="col s12 m6 l4">
                <div class="card" onclick="showProductDetails('${product._id}')">
                <div class="card-image">
                    <img src="${product.image || `https://placehold.co/400x400?text=IMG:${product.name}&font=playfair-display`}">
                    <span class="card-title">${product.name}</span>
                    <a class="btn-floating halfway-fab waves-effect waves-light red" onclick="addToCart('${product._id
                }')">
                    <i class="add_button">Add</i>
                    </a>
                </div>
                <div class="card-content">
                    <p class="price">Price: $${product.price}</p>
                    <p class="quantity">Quantity: ${product.quantity}</p>
                    <p>${product.description}</p>
                    <p class="retailer">Retailer: ${product.retailer}</p>
                </div>
                </div>
            </div> `;
        } else {
            return `
                <div>
                 <p> No product found </p>
                </div>
                `
        }
    })
    .join("");
}

function displayPagination(pagination) {
    // If there is no pagination
    if (!pagination) return;

    const container = document.getElementById("pagination");

    let html = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap;">
          `;

    // Pagination
    html += '<ul class="pagination">';

    // chevron-left
    html += `
            <li class="${pagination.currentPage === 1 ? "disabled" : ""}">
              <a href="#!" onclick="${pagination.currentPage > 1
            ? `fetchProducts(${pagination.currentPage - 1})`
            : ""
        }">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
          `;

    // pages
    const visiblePages = 5; // the max pages display
    const startPage = Math.max(
        1,
        pagination.currentPage - Math.floor(visiblePages / 2)
    );
    const endPage = Math.min(
        pagination.totalPages,
        startPage + visiblePages - 1
    );

    for (let i = startPage; i <= endPage; i++) {
        html += `
              <li class="${pagination.currentPage === i ? "active" : ""}">
                <a href="#!" onclick="fetchProducts(${i})">${i}</a>
              </li>
            `;
    }

    // ... and the last page
    if (endPage < pagination.totalPages) {
        html += `
              <li class="disabled">
                <a href="#!">...</a>
              </li>
              <li>
                <a href="#!" onclick="fetchProducts(${pagination.totalPages})">${pagination.totalPages}</a>
              </li>
            `;
    }

    // chevron-right
    html += `
            <li class="${pagination.currentPage === pagination.totalPages ? "disabled" : ""
        }">
              <a href="#!" onclick="${pagination.currentPage < pagination.totalPages
            ? `fetchProducts(${pagination.currentPage + 1})`
            : ""
        }">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          `;

    html += "</ul>";

    // Pagination Jump 
    html += `
            <div class="pagination-jump">
              <label for="jumpPage">Go to page:</label>
              <input type="number" id="jumpPage" min="1" max="${pagination.totalPages}" value="${pagination.currentPage}">
              <button onclick="jumpToPage(${pagination.totalPages})">Go</button>
            </div>
          `;

    html += "</div>";

    container.innerHTML = html;
}

function jumpToPage(totalPages) {
    const pageInput = document.getElementById("jumpPage");
    const pageNumber = parseInt(pageInput.value, 10);

    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        fetchProducts(pageNumber);
    } else {
        showToast("Please enter a valid page number.");
    }
}

async function addToCart(productId) {
    try {
        const response = await fetch("/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        });

        const data = await response.json();
        if (data.success) {
            M.toast({ html: "Item added to cart" });
            updateCartCount();
        } else {
            M.toast({ html: "Cannot add more" });
        }
    } catch (error) {
        M.toast({ html: "Error adding item to cart" });
    }
}

// Product Details Modal
function showProductDetails(productId) {
    const product = productsList.find(p => p._id === productId);
    const productName = document.getElementById("productName");
    const productCategory = document.getElementById("productCategory");
    const productPrice = document.getElementById("productPrice");
    const productDesc = document.getElementById("productDesc");
    const similarProductsContainer = document.getElementById("similarProductsContainer");
    const carouselImageContainer = document.getElementById("productImageCarousel");

    if (!product) {
        M.toast({ html: "Product not found!" });
        return;
    }

    productName.innerText = product.name;
    productCategory.innerText = product.category;
    productPrice.innerText = product.price;
    productDesc.innerText = product.description;

    carouselImageContainer.innerHTML = "";

    product.images.forEach(image => {
        const carouselItem = document.createElement("a");
        carouselItem.classList.add("carousel-item");
        carouselItem.href = "#";
        carouselItem.innerHTML = `<img src="${image}" alt="${product.name}">`;
        carouselImageContainer.appendChild(carouselItem);
    });

    setTimeout(() => {
        M.Carousel.init(carouselImageContainer, {
            fullWidth: false,
            indicators: true
        }).set(1);
    }, 100);

    // Find similar products
    const similarProducts = productsList
        .filter(p => p.category === product.category && p._id !== productId)
        .slice(0, 5);

        similarProductsContainer.innerHTML = similarProducts.map(p => `
        <div class="similar-product" onclick="showProductDetails('${p._id}')">
            <img src="${p.image || "https://placehold.co/100x100"}" alt="${p.name}">
            <p>${p.name}</p>
        </div>
    `).join("");

    // Open the modal
    const modal = M.Modal.getInstance(document.getElementById("detailProductModal"));
    modal.open();
}



