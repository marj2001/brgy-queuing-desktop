function filterUsers() {
    let input = document.getElementById('searchUser').value.toLowerCase();
    let rows = document.querySelectorAll('#userTableBody tr');
    
    rows.forEach((row) => {
        let name = row.cells[1].textContent.toLowerCase();
        let username = row.cells[2].textContent.toLowerCase();
        let email = row.cells[3].textContent.toLowerCase();

        if (name.includes(input) || username.includes(input) || email.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.getElementById('userTableBody');

    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:3000/api/users');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const users = await response.json(); // Parse JSON response
            userTableBody.innerHTML = ''; // Clear existing rows

            // Loop through the user list in the exact order received
            users.forEach((user, index) => {
                const row = document.createElement('div');
                row.className = 'userlist-row';

                // Displaying user data
                row.innerHTML = `
                    <div class="userlist-item">${user.FNAME} ${user.LNAME}</div>
                    <div class="userlist-item">${user.username}</div>
                    <div class="userlist-item">${user.email}</div>
                    <div class="userlist-item">
                        <button class="edit-button"><i class="fas fa-edit"></i> Edit</button>
                        <button class="view-button"><i class="fas fa-eye"></i> View</button>
                    </div>
                `;

                userTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Fetch users initially
    fetchUsers();
});
