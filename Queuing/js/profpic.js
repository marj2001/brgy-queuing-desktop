document.addEventListener('DOMContentLoaded', async () => {
    const uploadButton = document.getElementById('change-profile');
    const profilePicture = document.getElementById('profile-picture');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none'; 
    
    document.body.appendChild(fileInput);


    
    async function loadProfileData() {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) return;

        try {
            const response = await fetch(`http://localhost:3000/api/admin/profile/${storedUsername}`);
            const data = await response.json();

            if (data.success) {
                // Set profile picture using the correct URL
                const profileImgUrl = `http://localhost:3000${data.profilePicture}`;
                
                profilePicture.style.backgroundImage = `url(${profileImgUrl})`; 
                
                sidebarAvatar.style.backgroundImage = `url(${profileImgUrl})`; 


            } else {
                console.error('Error loading profile data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    // Load profile data when the page loads
    await loadProfileData();

    // Trigger file input on button click
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection and upload process
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Preview the selected file
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imgUrl = event.target.result;
            profilePicture.style.backgroundImage = `url(${imgUrl})`; 
            sidebarAvatar.style.backgroundImage = `url(${imgUrl})`; 
            const result = await Swal.fire({
                title: 'Confirm Upload',
                text: `You are about to upload: ${file.name}`,
            
                imageAlt: 'Profile Picture Preview',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, upload it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                // Proceed with the upload
                const formData = new FormData();
                const storedUsername = localStorage.getItem('username');
                formData.append('username', storedUsername);
                formData.append('profilePicture', file);

                try {
                    const response = await fetch('http://localhost:3000/api/admin/upload-profile-picture', {
                        method: 'POST',
                        body: formData,
                    });

                    const uploadResult = await response.json();

                    if (uploadResult.success) {
                        // Update the profile picture display with the new URL
                        const newImageUrl = `http://localhost:3000${uploadResult.filePath}`;
                        profilePicture.style.backgroundImage = `url(${newImageUrl})`;
                        sidebarAvatar.style.backgroundImage = `url(${newImageUrl})`;

                        // Show success alert
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: uploadResult.message,
                        });
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Warning',
                            text: uploadResult.message,
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while uploading the picture!',
                    });
                }
            } else {
                
                fileInput.value = '';
                Swal.fire({
                    icon: 'info',
                    title: 'Upload Canceled',
                    text: 'No changes have been made to your profile picture.',
                });
            }
        };

        // Read the file as a Data URL for preview
        reader.readAsDataURL(file);
    });
});
