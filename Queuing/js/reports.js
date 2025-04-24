document.addEventListener("DOMContentLoaded", function() {

    const labels = ['January', 'February', 'March', 'April']; 
    const completeData = [30, 45, 25, 50]; 
    const pendingData = [15, 20, 30, 10]; 

    console.log("Labels:", labels);
    console.log("Complete Data:", completeData);
    console.log("Pending Data:", pendingData);

    const ctx = document.getElementById('serviceChart').getContext('2d');
    const serviceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Services Complete',
                    data: completeData,
                    backgroundColor: 'rgba(45, 196, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 4,
                    fill: false
                },
                {
                    label: 'Services Pickup',
                    data: pendingData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 4,
                    fill: false 
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 1)',
                        lineWidth: 0.7
                    }
                    
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 1)',
                        lineWidth: 0.7
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Services'
                }
            }
        }
    });
});



async function fetchServiceTotal(serviceName, elementId) {
    console.log(`Fetching total for: ${serviceName}`);
    try {
        const response = await fetch(`http://localhost:3000/api/service-total?service_name=${encodeURIComponent(serviceName)}`);
        if (!response.ok) {
            console.error(`HTTP Error for ${serviceName}:`, response.statusText);
            document.getElementById(elementId).textContent = 'Error';
            return;
        }
        const result = await response.json();

        if (result.success) {
            const total = result.total;
            document.getElementById(elementId).textContent = total > 0 ? total : '0';
        } else {
            console.error(`API Error for ${serviceName}:`, result.message);
            document.getElementById(elementId).textContent = 'Error';
        }
    } catch (error) {
        console.error(`Fetch error for ${serviceName}:`, error);
        document.getElementById(elementId).textContent = 'Error';
    }
}


fetchServiceTotal('Barangay ID', 'barangay-id-total');
fetchServiceTotal('Barangay Indigency', 'barangay-indigency-total');
fetchServiceTotal('Barangay Certificate', 'barangay-certificate-total');
fetchServiceTotal('Barangay Clearance', 'barangay-clearance-total');



// ===========================================================================================

async function fetchServiceComplete(serviceName, elementId) {
    console.log(`Fetching complete total for: ${serviceName}`);
    try {
        const response = await fetch(`http://localhost:3000/api/service-complete?service_name=${encodeURIComponent(serviceName)}`);
        if (!response.ok) {
            console.error(`HTTP Error for ${serviceName}:`, response.statusText);
            document.getElementById(elementId).textContent = 'Error';
            return;
        }
        const result = await response.json();

        if (result.success) {
            const total = result.total;
            document.getElementById(elementId).textContent = total > 0 ? total : '0';
        } else {
            console.error(`API Error for ${serviceName}:`, result.message);
            document.getElementById(elementId).textContent = 'Error';
        }
    } catch (error) {
        console.error(`Fetch error for ${serviceName}:`, error);
        document.getElementById(elementId).textContent = 'Error';
    }
}


fetchServiceComplete('Barangay ID', 'barangay-id-complete');
fetchServiceComplete('Barangay Indigency', 'barangay-indigency-complete');
fetchServiceComplete('Barangay Certificate', 'barangay-certificate-complete');
fetchServiceComplete('Barangay Clearance', 'barangay-clearance-complete');
