document.addEventListener('DOMContentLoaded', async () => {
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const usernameDisplay = document.getElementById('username-display');
  const uploadButton = document.getElementById('change-profile');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none'; // Hide file input by default
  document.body.appendChild(fileInput);

  // Function to load profile data
  async function loadProfileData() {
      const storedUsername = localStorage.getItem('username');
      if (!storedUsername) return;

      try {
          const response = await fetch(`http://localhost:3000/api/admin/profile/${storedUsername}`);
          const data = await response.json();

          if (data.success) {
              // Set the profile picture URL
              const profileImgUrl = `http://localhost:3000${data.profilePicture}`;
              sidebarAvatar.style.backgroundImage = `url(${profileImgUrl})`;

              // Display username as "Admin, [username]"
              usernameDisplay.textContent = `Admin, ${storedUsername}`;
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

  // Handle file selection and upload
  fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = async (event) => {
          const imgUrl = event.target.result;
          sidebarAvatar.style.backgroundImage = `url(${imgUrl})`; // Preview in sidebar

          // Show confirmation dialog with preview
          const result = await Swal.fire({
              title: 'Confirm Upload',
              text: `You are about to upload: ${file.name}`,
              imageUrl: imgUrl,
              imageAlt: 'Profile Picture Preview',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, upload it!',
              cancelButtonText: 'Cancel',
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
                      // Update the profile picture with the new URL
                      const newImageUrl = `http://localhost:3000${uploadResult.filePath}`;
                      sidebarAvatar.style.backgroundImage = `url(${newImageUrl})`;

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
                  Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'An error occurred while uploading the picture!',
                  });
              }
          } else {
              fileInput.value = ''; // Reset file input if canceled
              Swal.fire({
                  icon: 'info',
                  title: 'Upload Canceled',
                  text: 'No changes have been made to your profile picture.',
              });
          }
      };

      // Read the file for preview
      reader.readAsDataURL(file);
  });
});
