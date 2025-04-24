
document.getElementById("show-password").addEventListener("change", function() {
    const passwordField = document.getElementById("password");
    const repeatPasswordField = document.getElementById("repeat-password");
    const errorMessage = document.getElementById("error-message");
    
    if (this.checked) {
        passwordField.type = "text";
        repeatPasswordField.type = "text";
        errorMessage.style.display = (passwordField.value === "" && repeatPasswordField.value === "") ? "block" : "none";
    } else {
        passwordField.type = "password";
        repeatPasswordField.type = "password";
    }
});

// Handle password input changes
document.getElementById("password").addEventListener("input", function() {
    document.getElementById("repeat-password").disabled = this.value === "";
    document.getElementById("repeat-password-error").style.display = "none";
});

document.getElementById("repeat-password").addEventListener("input", function() {
    const errorSpan = document.getElementById("repeat-password-error");
    
    if (this.value !== document.getElementById("password").value) {
        errorSpan.style.display = "inline";
    } else {
        errorSpan.style.display = "none";
    } 

    if (this.value === "") {
        errorSpan.style.display = "none";
    }
});

document.querySelector(".change-password-form").addEventListener("submit", async function(event) {
    event.preventDefault(); 
    
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeat-password").value;
    
    if (password && repeatPassword) {
        if (password === repeatPassword) {
            const storedUsername = localStorage.getItem('username'); 
            const apiUrl = 'http://localhost:3000/api/admin/change-password';

            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: storedUsername, newPassword: password }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();

                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: result.message,
                        showConfirmButton: true
                    }).then(() => {
                        window.location.href = 'myprofile.html'; // Redirect to profile page
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: result.message
                    });
                    
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'An error occurred while changing the password.',
                    text: error.message // Show detailed error
                });
            }

            // Clear the fields
            document.getElementById("password").value = "";
            document.getElementById("repeat-password").value = "";
            document.getElementById("repeat-password-error").style.display = "none";
            document.getElementById("show-password").checked = false;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Passwords do not match'
            });
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Both fields must be filled'
        });
    }
});
