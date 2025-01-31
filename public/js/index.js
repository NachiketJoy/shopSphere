window.addEventListener('DOMContentLoaded', function () {
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

    document.getElementById('year').textContent = new Date().getFullYear();

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
    

    if (toastSuccess !== null || toastError !== null) {
        if (toastSuccess) {
            M.toast({
                html: toastSuccess.getAttribute('data-message'),
                classes: 'toast toast__success',
                displayLength: 4000
            });
        } else {
            M.toast({
                html: toastError.getAttribute('data-message'),
                classes: 'toast toast__error',
                displayLength: 4000
            });
        }
    }

    const currentPage = window.location.pathname;
    if (currentPage === '/' || currentPage === '/dashboard') {
        footer.style.display = 'none';
    }

    if(currentPage === '/dashboard') {
        manageProductBtn.addEventListener('click', fetchProducts);
        viewOrderBtn.addEventListener('click', fetchOrders)
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


    // 点击按钮时切换弹出框显示
    userDropdownButton.addEventListener("click", (event) => {
        event.preventDefault();
        userInfoPopup.classList.toggle("active");
    });

    // 点击页面其他地方时关闭弹出框
    document.addEventListener("click", (event) => {
        if (!userInfoPopup.contains(event.target) && !userDropdownButton.contains(event.target)) {
        userInfoPopup.classList.remove("active");
        }
    });

});

async function updateCartCount() {
    try {
        const response = await fetch("/cart/items");
        const data = await response.json();

        if (data.success) {
        const totalItems = data.cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        document.querySelector(".cart-count").textContent = totalItems;
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