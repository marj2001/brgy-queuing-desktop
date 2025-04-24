
  // Example of dynamically updating progress
  const progressBar = document.getElementById('progress-bar-inner');
  const statusMessage = document.getElementById('status-message');

  // Simulating progress update (this would normally be handled by backend status updates)
  let progress = 40;
  function updateProgress() {
    if (progress < 100) {
      progress += 10;
      progressBar.style.width = progress + '%';
      progressBar.textContent = progress + '%';

      if (progress === 100) {
        statusMessage.textContent = 'Your Barangay ID is ready for pickup.';
      } else {
        statusMessage.textContent = 'Your document is being processed.';
      }
    }
  }

  // Simulate progress every 5 seconds
  setInterval(updateProgress, 5000);

  // Function to cancel request
  function cancelRequest() {
    alert('Your Barangay ID request has been canceled.');
    // Add logic here to cancel the request in backend
  }
