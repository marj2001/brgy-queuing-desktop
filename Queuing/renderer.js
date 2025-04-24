const { ipcRenderer } = require('electron');

// Elements
const signupForm = document.getElementById('signup-form');
const inputs = document.querySelectorAll('#signup-form input');
const fingerprintStatus = document.getElementById('fingerprint-status');

let isFingerprintCaptured = false; // To track fingerprint status

// Validate all inputs
function areAllInputsFilled() {
    return Array.from(inputs).every(input => input.value.trim() !== '');
}

// Trigger fingerprint scanning when inputs are filled
function checkInputsAndTriggerFingerprint() {
    if (areAllInputsFilled() && !isFingerprintCaptured) {
        isFingerprintCaptured = true; // Prevent duplicate triggers
        fingerprintStatus.textContent = "Scanning fingerprint...";

        // Start fingerprint scanning process
        ipcRenderer.send('start-fingerprint');
    }
}

// Listen for fingerprint data from main process
ipcRenderer.on('fingerprint-data', (event, data) => {
    console.log('Fingerprint data received:', data);

    if (data.trim() === 'CONFIRMED') {
        fingerprintStatus.textContent = "Fingerprint confirmed! Ready to submit.";
        isFingerprintCaptured = true;
    } else {
        fingerprintStatus.textContent = "Fingerprint scan failed. Retrying...";
        isFingerprintCaptured = false;
        ipcRenderer.send('start-fingerprint'); // Retry scan
    }
});

// Add event listeners to inputs
inputs.forEach(input => {
    input.addEventListener('input', checkInputsAndTriggerFingerprint);
});

// Handle form submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        fullName: document.getElementById('full-name').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        position: document.getElementById('position').value,
        password: document.getElementById('password').value,
    };

    // Check if fingerprint scan is confirmed
    if (!isFingerprintCaptured) {
        Swal.fire({
            icon: 'error',
            title: 'Fingerprint Required',
            text: 'Please complete the fingerprint scan before submitting.',
        });
        return;
    }

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
                text: 'Registration successful!',
            });
            signupForm.reset();
            fingerprintStatus.textContent = "Waiting for input completion...";
            isFingerprintCaptured = false; // Reset fingerprint status
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
