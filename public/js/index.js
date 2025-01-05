const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const forgotPassword = document.getElementById('forgotPassword');
const backToSignIn = document.getElementById('back-to-sign-in');
const accountLink = document.getElementById('accountLink');

registerBtn?.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn?.addEventListener('click', () => {
    container.classList.remove("active");
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