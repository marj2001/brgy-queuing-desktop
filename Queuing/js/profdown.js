
  document.addEventListener('DOMContentLoaded', () => {
      const userProfile = document.querySelector('.user_profile');
      const profileDropdown = document.querySelector('.profile-dropdown');

      userProfile.addEventListener('click', (event) => {
          
          if (event.target.classList.contains('my_profile')) return;

          profileDropdown.classList.toggle('active'); 
      });

     
      window.addEventListener('click', (event) => {
          if (!userProfile.contains(event.target)) {
              profileDropdown.classList.remove('active'); 
          }
      });
  });
