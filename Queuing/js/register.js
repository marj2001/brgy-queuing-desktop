document.addEventListener('DOMContentLoaded', () => {
    const showPasswordCheckbox = document.getElementById('show-password');
    const passwordInput = document.getElementById('password');
    const repeatPasswordInput = document.getElementById('repeat-password');
    const repeatPasswordMessage = document.getElementById('repeat-password-message');
    const signupForm = document.getElementById('signup-form');
    const usernameInput = document.getElementById('username');
    const usernameErrorMessage = document.getElementById('username-error-message');

    
    function validatePasswords() {
        const passwordValue = passwordInput.value;
        const repeatPasswordValue = repeatPasswordInput.value;

        if (passwordValue === '') {
            repeatPasswordInput.disabled = true;
            repeatPasswordMessage.style.display = 'none';
        } else {
            repeatPasswordInput.disabled = false;

            if (repeatPasswordValue !== '' && repeatPasswordValue !== passwordValue) {
                repeatPasswordMessage.textContent = 'X';
                repeatPasswordMessage.style.display = 'block';
            } else {
                repeatPasswordMessage.style.display = 'none';
            }
        }
    }

    
    function handleCheckboxChange() {
        const type = showPasswordCheckbox.checked ? 'text' : 'password';
        passwordInput.type = type;
        repeatPasswordInput.type = type;
    }

    
    async function handleSignupClick(event) {
        event.preventDefault(); 

        const passwordValue = passwordInput.value;
        const repeatPasswordValue = repeatPasswordInput.value;
        const fullName = document.getElementById('full-name').value;
        const username = usernameInput.value;
        const email = document.getElementById('email').value;
        const position = document.getElementById('position').value;

        
        if (!fullName || !username || !email || !position || 
            !passwordValue || !repeatPasswordValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill out all fields.',
            });
            return;
        }

        if (passwordValue !== repeatPasswordValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Passwords do not match!',
            });
            return;
        }

        
        const formData = {
            fullName: fullName,
            username: username,
            email: email,
            position: position,
            password: passwordValue
        };

        try {
            
            const response = await fetch('http://localhost:3000/api/admin/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: result.message,
                    confirmButtonText: 'OK'
                }).then(() => {
                    
                    document.getElementById('full-name').value = '';
                    usernameInput.value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('position').value = '';
                    passwordInput.value = '';
                    repeatPasswordInput.value = '';
                    usernameErrorMessage.style.display = 'none';
                });
            } else if (result.message === 'Username is already in use') {
                
                usernameErrorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }


    usernameInput.addEventListener('input', () => {
        if (usernameInput.value === '') {
            usernameErrorMessage.style.display = 'none'; 
            usernameErrorMessage.style.display = 'none';
        }
    });

    // Event listeners
    showPasswordCheckbox.addEventListener('change', handleCheckboxChange);
    passwordInput.addEventListener('input', validatePasswords);
    repeatPasswordInput.addEventListener('input', validatePasswords);
    signupForm.addEventListener('submit', handleSignupClick);
});