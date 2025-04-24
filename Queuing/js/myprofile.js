document.addEventListener('DOMContentLoaded', () => {
    updateProfileDisplay();
    fetchUserProfile(); // Fetch user profile data on page load
});

function updateProfileDisplay() {
    const storedUsername = localStorage.getItem('username');
    const storedFullname = localStorage.getItem('fullname');
    const storedEmail = localStorage.getItem('email');
    const storedPosition = localStorage.getItem('position');
    const storedProfilePicture = localStorage.getItem('profilePicture'); // Profile picture URL

    // Update profile information in profile section
    document.getElementById('username-display').textContent = `Admin, ${storedUsername}`;
    document.getElementById('profile-fullname').textContent = storedFullname || 'No Name Provided';
    document.getElementById('profile-email').textContent = `Email: ${storedEmail || 'No Email'}`;
    document.getElementById('profile-position').textContent = `Position: ${storedPosition || 'No Position'}`;

    // Update profile picture
    setProfilePicture(storedProfilePicture);
}

function fetchUserProfile() {
    const apiUrl = `http://localhost:3000/api/admin/profile/${localStorage.getItem('username')}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
        }
    })
    .then(response => response.json())
    .then(userProfile => {
        if (!userProfile.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: userProfile.message,
            });
            return;
        }

        // Update localStorage with fetched profile data
        localStorage.setItem('fullname', userProfile.fullname);
        localStorage.setItem('email', userProfile.email);
        localStorage.setItem('position', userProfile.position);
        localStorage.setItem('profilePicture', userProfile.picture_url); // Store profile picture URL

        // Update profile display with fetched data
        updateProfileDisplay();
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch user profile data.',
        });
    });
}

function setProfilePicture(profilePicture) {
    const profilePictureElement = document.getElementById('profile-picture');

    if (profilePicture) {
        profilePictureElement.src = `http://localhost:3000/${profilePicture}`; 
    } else {
        profilePictureElement.src = 'default-avatar.jpg'; 
    }
}


