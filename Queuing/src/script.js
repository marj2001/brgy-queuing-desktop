document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const userInfoInput = document.getElementById('user-info');
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password');

    // Toggle password visibility
    showPasswordCheckbox.addEventListener('change', () => {
        passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });

    // Login button click event
    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const username = userInfoInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please fill out all fields!',
            });
            return;
        }

        const formData = { username, password };

        try {
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                // Store profile info in localStorage
                localStorage.setItem('adminId', result.adminId);
                localStorage.setItem('username', result.username);
                localStorage.setItem('fullname', result.fullname);
                localStorage.setItem('email', result.email);
                localStorage.setItem('position', result.position);
                localStorage.setItem('profilePicture', result.profilePicture); // Store profile picture URL

                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message || 'Invalid credentials, please try again.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred. Please try again later.',
            });
        }
    });

    // Display logged-in user's profile info if available
    const storedUsername = localStorage.getItem('username');
    const storedProfilePicture = localStorage.getItem('profilePicture');

    if (storedUsername) {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = `Admin ${storedUsername}`;
        }
    }

    if (storedProfilePicture) {
        const profilePictureElement = document.getElementById('profile-picture');
        if (profilePictureElement) {
            profilePictureElement.style.backgroundImage = `url(${storedProfilePicture})`;
        }
    }
});
