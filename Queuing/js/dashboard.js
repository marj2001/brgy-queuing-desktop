var ctx = document.getElementById('statusChart').getContext('2d');
var statusChart = new Chart(ctx, {
  type: 'bar', 
  data: {
    labels: ['Barangay ID', 'Barangay Indigency', 'Barangay Certificate', 'Barangay Clearance'],
    datasets: [{
      label: 'Graph of Requests',
      data: [20, 15, 20, 40], 
      backgroundColor: [
        'rgba(255, 99, 132, 1)',  
        'rgba(54, 162, 235, 1)',  
        'rgba(255, 206, 86, 1)',  
        'rgba(75, 192, 192, 1)'  
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

