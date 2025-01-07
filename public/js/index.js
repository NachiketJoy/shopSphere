window.addEventListener('DOMContentLoaded', function () {
    const authentication = document.getElementById('authentication');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const logoutBtn = document.getElementById('logout');
    const forgotPassword = document.getElementById('forgotPassword');
    const backToSignIn = document.getElementById('back-to-sign-in');
    const footer = document.getElementById('footer');
    const toastSuccess = document.getElementById('toast__success');
    const toastError = document.getElementById('toast_error');

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
    if (currentPage === '/') {
        footer.style.display = 'none';
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
});
