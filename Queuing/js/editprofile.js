document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
    let originalFullname, originalEmail, originalPosition;

    if (storedUsername) {
        fetchUserProfile(storedUsername);
    } else {
        console.error('No stored username found in localStorage.');
    }

    const editProfileForm = document.getElementById('edit-profile-form');

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const position = document.getElementById('position').value;

        // Log current values for debugging
        console.log('Current form values:', { fullname, email, position });
        console.log('Original values:', { originalFullname, originalEmail, originalPosition });

        if (!storedUsername) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Username not found!',
            });
            return;
        }

        // Check if any changes were made compared to original values
        if (
            fullname === originalFullname &&
            email === originalEmail &&
            position === originalPosition
        ) {
            Swal.fire({
                icon: 'info',
                title: 'No Changes',
                text: 'No changes were made to your profile.',
            });
            return;
        }

        const profileData = {
            username: storedUsername,
            fullname,
            email,
            position,
        };

        // Log data before sending it to the server
        console.log('Profile data being sent:', profileData);

        try {
            const response = await fetch('http://localhost:3000/api/admin/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const result = await response.json();

            // Log response for debugging
            console.log('Server response:', result);

            if (result.success) {
                // Store updated profile data in localStorage
                localStorage.setItem('fullname', result.fullname);
                localStorage.setItem('email', result.email);
                localStorage.setItem('position', result.position);

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: result.message,
                }).then(() => {
                    // Update the profile display
                    updateProfileDisplay();
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: result.message,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the profile!',
            });
        }
    });

    function fetchUserProfile(username) {
        fetch(`http://localhost:3000/api/admin/profile/${username}`)
            .then((response) => response.json())
            .then((userProfile) => {
                console.log('Fetched profile data:', userProfile); // Log data for debugging
                if (!userProfile.success) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: userProfile.message,
                    });
                    return;
                }

                // Set original values for comparison
                originalFullname = userProfile.fullname;
                originalEmail = userProfile.email;
                originalPosition = userProfile.position;

                // Populate form fields with user profile data
                document.getElementById('full-name').value = originalFullname;
                document.getElementById('email').value = originalEmail;
                document.getElementById('position').value = originalPosition;
            })
            .catch((error) => {
                console.error('Fetch error:', error);
           });
    }
    

    function updateProfileDisplay() {
        const updatedFullname = localStorage.getItem('fullname');
        const updatedEmail = localStorage.getItem('email');
        const updatedPosition = localStorage.getItem('position');

        document.getElementById('full-name').value = updatedFullname;
        document.getElementById('email').value = updatedEmail;
        document.getElementById('position').value = updatedPosition;
    }
});
