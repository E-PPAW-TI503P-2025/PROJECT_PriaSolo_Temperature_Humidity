/**
 * Login Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (api.isAuthenticated()) {
        window.location.href = '/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Username dan password harus diisi');
            return;
        }

        // Show loading state
        setLoading(true);
        hideError();

        try {
            const response = await api.login(username, password);

            if (response.success) {
                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                showError(response.message || 'Login gagal');
            }
        } catch (error) {
            showError(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function setLoading(loading) {
        loginBtn.disabled = loading;
        loginText.style.display = loading ? 'none' : 'inline';
        loginSpinner.style.display = loading ? 'inline-flex' : 'none';
    }
});
