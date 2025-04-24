async function fetchQueueList(documentType = '') {
    try {
        console.log(`Fetching queue list with documentType: ${documentType}`);
        const response = await fetch(`http://localhost:3000/api/queue?documentType=${documentType}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch queue list: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched queue data:", data);

        if (data.success && data.queue.length > 0) {
            const firstItem = data.queue[0];
            currentQueueNumber = firstItem.queue_number;
            document.getElementById('currentQueueNumber').innerText = currentQueueNumber;

            const queueItemsHtml = data.queue.slice(1).map(item => 
                `<div class="queue-row">
                    <div class="queue-item">${item.queue_number}</div>
                    <div class="queue-item">${item.FNAME} ${item.LNAME}</div>
                    <div class="queue-item">${item.service_name}</div>
                </div>`
            ).join('');

            document.getElementById('queueItems').innerHTML = queueItemsHtml;
        } else {
            document.getElementById('currentQueueNumber').innerText = '0';
            document.getElementById('queueItems').innerHTML = '<p>No more queue items.</p>';
        }
    } catch (error) {
        console.error('Error fetching queue list:', error);
        Swal.fire('Error', 'Failed to fetch queue list.', 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fetchQueueList();  

    document.getElementById('filterDocument').addEventListener('change', (event) => {
        fetchQueueList(event.target.value);
    });
});

async function openModal(queueNumber) {
    console.log(`Fetching details for queue number: ${queueNumber}`);
    try {
        const response = await fetch(`http://localhost:3000/api/queue/view/${queueNumber}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            Swal.fire('', `Failed to load queue details: ${errorData.message || response.statusText}`, 'error');
            return;
        }

        const data = await response.json();
        console.log("Fetched queue item data:", data);

        if (data.success) {
            const item = data.item;

            const queueDetails = generateQueueDetails(item);
            const formDetails = generateFormDetails(item);

            Swal.fire({
                title: '<strong>Queue Details</strong>',
                html: `<div class="modal-content-container">${queueDetails}${formDetails}</div>`,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Generate QR Code',
                cancelButtonText: 'Done',
                customClass: {
                    popup: 'swal-wide',
                    title: 'swal-title-modern',
                    confirmButton: 'swal-button-qr',
                    cancelButton: 'swal-button-done'
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    generateQRCode(item);
                }
            });
        } else {
            Swal.fire(`Failed to load queue details: ${data.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        Swal.fire('Error', `An error occurred: ${error.message}`, 'error');
    }
}

function generateQueueDetails(item) {
    return `
        <div class="queue-details">
            <h4 class="queue-header">Queue Number: ${item.queue_number}</h4>
            <p class="queue-info"><strong>Name:</strong> ${item.FNAME} ${item.LNAME}</p>
            <p class="queue-info"><strong>Document Requested:</strong> ${item.service_name}</p>
        </div>
    `;
}

function generateFormDetails(item) {
    let formHTML = '';
    const formTitleStyles = 'class="form-header"';
    const infoStyles = 'class="form-info"';

    switch (item.service_name) {
        case 'Barangay Indigency':
            formHTML = `
                <h5 ${formTitleStyles}>Barangay Indigency Details</h5>
                <p ${infoStyles}><strong>First Name:</strong> ${item.indi_first_name}</p>
                <p ${infoStyles}><strong>Middle Name:</strong> ${item.indi_middle_name}</p>
                <p ${infoStyles}><strong>Last Name:</strong> ${item.indi_last_name}</p>
                <p ${infoStyles}><strong>Birth Date:</strong> ${item.indi_birth_date}</p>
                <p ${infoStyles}><strong>Address:</strong> ${item.indi_address}</p>
                <p ${infoStyles}><strong>Purpose:</strong> ${item.indi_purpose}</p>
            `;
            break;
        case 'Barangay Clearance':
            formHTML = `
                <h5 ${formTitleStyles}>Barangay Clearance Details</h5>
                <p ${infoStyles}><strong>First Name:</strong> ${item.clear_first_name}</p>
                <p ${infoStyles}><strong>Middle Name:</strong> ${item.clear_middle_name}</p>
                <p ${infoStyles}><strong>Last Name:</strong> ${item.clear_last_name}</p>
                <p ${infoStyles}><strong>Birth Date:</strong> ${item.clear_birth_date}</p>
                <p ${infoStyles}><strong>Address:</strong> ${item.clear_address}</p>
                <p ${infoStyles}><strong>Purpose:</strong> ${item.clear_purpose}</p>
            `;
            break;
        case 'Barangay Certificate':
            formHTML = `
                <h5 ${formTitleStyles}>Barangay Certificate Details</h5>
                <p ${infoStyles}><strong>First Name:</strong> ${item.cert_first_name}</p>
                <p ${infoStyles}><strong>Middle Name:</strong> ${item.cert_middle_name}</p>
                <p ${infoStyles}><strong>Last Name:</strong> ${item.cert_last_name}</p>
                <p ${infoStyles}><strong>Birth Date:</strong> ${item.cert_birth_date}</p>
                <p ${infoStyles}><strong>Address:</strong> ${item.cert_address}</p>
                <p ${infoStyles}><strong>Purpose:</strong> ${item.cert_purpose}</p>
            `;
            break;
        default:
            formHTML = '<p><strong>No additional details available.</strong></p>';
    }

    return formHTML;
}

async function generateQRCode(item) {
    const queueNumber = item.queue_number;
    const qrContent = `Queue Number: ${queueNumber}, Name: ${item.FNAME} ${item.LNAME}, Document Requested: ${item.service_name}`;

    const { value: amount } = await Swal.fire({
        title: 'QR Code Generated!',
        html: `
            <p>QR code for queue number ${queueNumber} has been generated.</p>
            <p>Please bring this amount:</p>
            <input type="number" id="amount" class="swal2-input" placeholder="Enter amount">
        `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const amountInput = Swal.getPopup().querySelector('#amount').value;
            if (!amountInput) {
                Swal.showValidationMessage('Please enter an amount');
            }
            return amountInput;
        }
    });

    if (amount) {
        await saveNotification(queueNumber, amount, qrContent);
    }
}

async function saveNotification(queueNumber, amount, qrCodeContent) {
    console.log("Sending data to backend:", { queue_number: queueNumber, amount: amount, qr_code: qrCodeContent });

    try {
        const response = await fetch('http://localhost:3000/api/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queue_number: queueNumber,
                amount: amount,
                qr_code: qrCodeContent
            })
        });

        const data = await response.json();
        if (data.success) {
            Swal.fire('Success', 'Notification saved successfully!', 'success');
        } else {
            Swal.fire('Error', 'Failed to save notification: ${data.message}', 'error');
         }
    } catch (error) {
        console.error('Save notification error:', error);
        Swal.fire('Error', 'Failed to save notification: ${error.message}', 'error');
    }
}


async function nextQueue() {
    const currentQueueNumberElement = document.getElementById('currentQueueNumber');
    const currentQueueNumber = currentQueueNumberElement ? currentQueueNumberElement.innerText : '0';

    if (!currentQueueNumber || currentQueueNumber === '0') {
        Swal.fire({
            icon: 'warning',
            title: 'No Active Queue',
            text: 'There is no active queue to complete.',
        });
        return;
    }

    try {
        console.log('Sending currentQueueNumber:', currentQueueNumber);

        // Show a loading indicator
        Swal.fire({
            icon: 'info',
            title: 'Processing...',
            text: 'Please wait while the queue is processed.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch('http://localhost:3000/api/admin/next-queue', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentQueueNumber }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: errorData.message || 'Failed to move to the next queue.',
            });
            return;
        }

        const result = await response.json();
        console.log('Next queue result:', result);

        if (result.success) {
            Swal.close(); // Close the loading alert

            if (result.nextQueueNumber) {
                // Update the UI with the next queue number
                currentQueueNumberElement.innerText = result.nextQueueNumber;

                // Display the next queue number
                Swal.fire({
                    icon: 'success',
                    title: 'Now Serving',
                    text: `Queue Number: ${result.nextQueueNumber}`,
                });


                await fetchQueueList();
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Queue Completed',
                    text: 'No more numbers in the queue!',
                });
                currentQueueNumberElement.innerText = '0';
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed to Process',
                text: result.message || 'Could not proceed to the next queue.',
            });
        }
    } catch (error) {
        console.error('Network error:', error.message);
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'A network error occurred while moving to the next queue. Please try again later.',
        });
    }
}

function showOverlay() {
    document.getElementById('modalOverlay').classList.add('active');
}

function hideOverlay() {
    document.getElementById('modalOverlay').classList.remove('active');
}
