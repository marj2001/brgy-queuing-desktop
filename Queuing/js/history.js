async function fetchQueueHistory(documentType = '') {
    try {
        console.log(`Fetching queue history with documentType: ${documentType}`);
        const response = await fetch(`http://localhost:3000/api/queue/history?documentType=${documentType}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch queue history: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched queue history data:", data);

        
        if (data.success && data.history.length > 0) {
            const historyItemsHtml = data.history.map(item => {
                return `
                    <tr>
                        <td>${item.FNAME} ${item.LNAME}</td>
                        <td>${item.service_name}</td>
                        <td>
                            <span class="status ${item.status === 'Complete' ? 'complete' : ''}">${item.status}</span>
                        </td>
                        <td>
                            <button class="view-btn" onclick="viewDetails(${item.history_id})"><i class="fas fa-eye"></i> View</button>
                            <button class="delete-btn" onclick="confirmDelete(${item.history_id})"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
            

           
            document.getElementById('queueItems').innerHTML = historyItemsHtml;
        } else {
           
            document.getElementById('queueItems').innerHTML = '<p>No completed queue items found.</p>';
        }
    } catch (error) {
        console.error('Error fetching queue history:', error);
        Swal.fire('Error', 'Failed to fetch queue history.', 'error');
    }
}


fetchQueueHistory();
