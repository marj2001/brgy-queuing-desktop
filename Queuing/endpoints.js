const endpoints = (server, db, bcrypt, upload) => {
  
    server.post('/api/admin/signup', async (req, res) => {
        const { fullName, username, email, position, password } = req.body;

        try {
            db.query('SELECT * FROM admin WHERE username = ?', [username], async (err, result) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                if (result.length > 0) return res.status(400).json({ success: false, message: 'Username is already in use' });

                const hashedPassword = await bcrypt.hash(password, 10);
                db.query('INSERT INTO admin (fullname, username, email, position, password) VALUES (?, ?, ?, ?, ?)',
                    [fullName, username, email, position, hashedPassword],
                    (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Sign-up failed!' });
                        res.status(201).json({ success: true, message: 'Successfully registered!' });
                    });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error occurred!' });
        }
    });


    
    server.post('/api/admin/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            db.query('SELECT * FROM admin WHERE username = ? OR email = ?', [username, username], async (err, results) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error!' });
                if (results.length > 0) {
                    const user = results[0];
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) {
                        const profilePicture = user.picture_url ? `/uploads/${user.picture_url}` : '/uploads/default/profile.jpg';
                        res.status(200).json({ 
                            success: true,
                            message: 'Login successful!',
                            username: user.username,
                            fullname: user.fullname,
                            email: user.email,
                            position: user.position,
                            profilePicture 
                        });
                    } else {
                        res.status(401).json({ success: false, message: 'Invalid username or password!' });
                    }
                } else {
                    res.status(404).json({ success: false, message: 'User not found!' });
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error occurred!' });
        }
    });

    server.put('/api/admin/update-profile', (req, res) => {
        const { username, fullname, email, position } = req.body;
        if (!username || !fullname || !email || !position) return res.status(400).json({ success: false, message: 'All fields are required!' });

        const sql = 'UPDATE admin SET fullname = ?, email = ?, position = ? WHERE username = ?';
        const values = [fullname, email, position, username];

        db.query(sql, values, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to update profile' });
            res.status(200).json({ success: true, message: 'Profile updated successfully', fullname, email, position });
        });
    });

    server.get('/api/admin/profile/:username', (req, res) => {
        const username = req.params.username;

        db.query('SELECT * FROM admin WHERE username = ?', [username], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error!' });
            if (results.length > 0) {
                const user = results[0];
                const profilePicture = user.picture_url ? `/uploads/${user.picture_url}` : '/uploads/default-profile.jpg';
                res.status(200).json({
                    success: true,
                    fullname: user.fullname,
                    email: user.email,
                    position: user.position,
                    profilePicture,
                });
            } else {
                res.status(404).json({ success: false, message: 'User not found!' });
            }
        });
    });


    server.put('/api/admin/change-password', async (req, res) => {
        const { username, newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query('UPDATE admin SET password = ? WHERE username = ?', [hashedPassword, username], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error!' });
            res.status(200).json({ success: true, message: 'Password successfully updated!' });
        });
    }); 


    server.post('/api/admin/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
        const { username } = req.body;
        const filePath = req.file ? req.file.filename : null; 

        if (!filePath) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const sql = 'UPDATE admin SET picture_url = ? WHERE username = ?';
        const values = [filePath, username];

        db.query(sql, values, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.status(200).json({ success: true, message: 'Profile picture updated successfully', filePath: `/uploads/${filePath}` });
        });
    });


    server.post('/api/user/register', async (req, res) => {
        const { firstName, lastName, username, email, contact, address, password } = req.body;

        try {
            
            db.query('SELECT * FROM user_register WHERE username = ?', [username], async (err, result) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                if (result.length > 0) return res.status(400).json({ success: false, message: 'Username is already in use' });

                
                const hashedPassword = await bcrypt.hash(password, 10);

                
                db.query('INSERT INTO user_register (firstName, lastName, username, email, contact, address, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [firstName, lastName, username, email, contact, address, hashedPassword],
                    (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Registration failed!' });
                        res.status(201).json({ success: true, message: 'Successfully registered!' });
                    });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'An error occurred!' });
        }
    });

    server.get('/api/queue', (req, res) => {
        const documentType = req.query.documentType;
        let sql = `
            SELECT request.queue_number, user_register.FNAME, user_register.LNAME, request.service_name 
            FROM request
            JOIN user_register ON request.id = user_register.id
        `;
        const params = [];
    
        if (documentType) {
            sql += ' WHERE request.service_name = ?';
            params.push(documentType);
        }
    
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error("Error retrieving queue list:", err);
                return res.status(500).json({ success: false, message: 'Failed to retrieve queue list.' });
            }
            res.json({ success: true, queue: results });
        });
    });
    
    server.get('/api/queue/view/:queueNumber', (req, res) => {
        const { queueNumber } = req.params;
    
        const sql = `
            SELECT 
                request.queue_number, 
                user_register.FNAME, 
                user_register.LNAME, 
                request.service_name,
                request.status
            FROM request
            JOIN user_register ON request.id = user_register.id 
            WHERE request.queue_number = ?
        `;
        
        db.query(sql, [queueNumber], (err, result) => {
            if (err) {
                console.error("Error retrieving queue item details:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to retrieve queue item details.',
                    error: err.sqlMessage || err.message 
                });
            }
    
            if (result.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Queue item not found.' 
                });
            }
    
            const item = result[0];
    
            const detailsSql = `
                SELECT 
                    certificateform.first_name AS cert_first_name, 
                    certificateform.middle_name AS cert_middle_name, 
                    certificateform.last_name AS cert_last_name, 
                    certificateform.birth_date AS cert_birth_date, 
                    certificateform.address AS cert_address, 
                    certificateform.purpose AS cert_purpose,
                    
                    clearanceform.first_name AS clear_first_name, 
                    clearanceform.middle_name AS clear_middle_name, 
                    clearanceform.last_name AS clear_last_name, 
                    clearanceform.birth_date AS clear_birth_date, 
                    clearanceform.address AS clear_address, 
                    clearanceform.purpose AS clear_purpose,
                    
                    indigencyform.first_name AS indi_first_name, 
                    indigencyform.middle_name AS indi_middle_name, 
                    indigencyform.last_name AS indi_last_name, 
                    indigencyform.birth_date AS indi_birth_date, 
                    indigencyform.address AS indi_address, 
                    indigencyform.purpose AS indi_purpose
                FROM request
                LEFT JOIN certificateform ON request.request_id = certificateform.request_id
                LEFT JOIN clearanceform ON request.request_id = clearanceform.request_id
                LEFT JOIN indigencyform ON request.request_id = indigencyform.request_id
                WHERE request.queue_number = ?
            `;

            db.query(detailsSql, [queueNumber], (err, detailsResult) => {
                if (err) {
                    console.error("Error retrieving form details:", err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to retrieve form details.',
                        error: err.sqlMessage || err.message 
                    });
                } 
                const formData = detailsResult[0] || {};
                res.json({
                    success: true,
                    item: { ...item, ...formData }
                });
            }); 
        });
    });
    
    server.post('/api/notifications', async (req, res) => {
        console.log("Received data:", req.body);
        const { queue_number, amount, qr_code } = req.body;
    
        try {
        
            const getUserIdQuery = 'SELECT id FROM request WHERE queue_number = ?';
            
            const userId = await new Promise((resolve, reject) => {
                db.query(getUserIdQuery, [queue_number], (err, rows) => {
                    if (err) {
                        console.error('Error fetching user ID:', err);
                        return reject(err);
                    }
                    if (rows.length > 0) {
                        resolve(rows[0].id); // Resolve with the ID
                    } else {
                        reject(new Error('User not found for the given queue number.'));
                    }
                });
            });
    
            const insertQuery = 'INSERT INTO notifications (id, amount, qr_code) VALUES (?, ?, ?)';
            await new Promise((resolve, reject) => {
                db.query(insertQuery, [userId, amount, qr_code], (err, result) => {
                    if (err) {
                        console.error('Database insert error:', err);
                        return reject(err);
                    }
                    console.log('Database insert result:', result);
                    resolve(result);
                });
            });
    
            res.json({ success: true, message: 'Notification saved successfully.' });
        } catch (error) {
            console.error('Error saving notification:', error.message);
            res.status(500).json({ success: false, message: `Failed to save notification: ${error.message}` });
        }
    });
    
    server.get('/api/queue/history', (req, res) => {
        const documentType = req.query.documentType || '';  // Optional documentType filter
        
        let sql = `
            SELECT user_register.FNAME, 
                   user_register.LNAME, 
                   services.service_name, 
                   history.status, 
                   history.history_id
            FROM history
            JOIN user_register ON history.id = user_register.id
            JOIN services ON history.service_id = services.service_id
            ORDER BY history.history_id ASC
      
        `;
        
        const params = [];
        
        
        if (documentType) {
            sql += ' AND services.service_name = ?';
            params.push(documentType);
        }
    
        console.log("Executing query:", sql, params);
    
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error("Error retrieving history:", err);
                return res.status(500).json({ success: false, message: 'Failed to retrieve history.' });
            }
    
            console.log("Database results:", results);
            res.json({ success: true, history: results });
        });
    });
    
    server.put('/api/admin/next-queue', async (req, res) => {
        const { currentQueueNumber } = req.body;
    
        if (!currentQueueNumber) {
            return res.status(400).json({ success: false, message: 'Current queue number is required.' });
        }
    
        const sqlFetchRequest = `
            SELECT 
             request.request_id, 
             user_register.id AS user_id, 
             services.service_id, 
             services.service_name
            FROM request
            JOIN user_register ON request.id = user_register.id
            JOIN services ON request.service_id = services.service_id
            WHERE request.queue_number = ?

        `;
    
        const sqlDeleteFromRequest = 'DELETE FROM request WHERE queue_number = ?';
        const sqlDeleteFromClearance = 'DELETE FROM clearanceform WHERE request_id = ?';
        const sqlDeleteFromIndigency = 'DELETE FROM indigencyform WHERE request_id = ?';
        const sqlDeleteFromCertificate = 'DELETE FROM certificateform WHERE request_id = ?';
        const sqlFetchNextQueue = 'SELECT queue_number FROM request ORDER BY queue_number ASC LIMIT 1';
        const sqlInsertIntoHistory = `
            INSERT INTO history (id, service_id, service_name, status, date)
            VALUES (?, ?, ?, 'Pickup', 'Waiting...')
        `;
    
        try {
            db.query(sqlFetchRequest, [currentQueueNumber], (err, result) => {
                if (err || !result[0]) {
                    return res.status(404).json({ success: false, message: 'Current queue number not found.' });
                }
    
                const { request_id, user_id, service_id, service_name } = result[0];
    
                
                db.query(sqlInsertIntoHistory, [user_id, service_id, service_name], (err) => {
                    if (err) {
                        console.error('Error inserting into history:', err);
                        return res.status(500).json({ success: false, message: 'Failed to save data to history.' });
                    }
    
                    // Delete from child tables
                    db.query(sqlDeleteFromClearance, [request_id], (err) => {
                        if (err) {
                            console.error('Error deleting from clearanceform:', err);
                            return res.status(500).json({ success: false, message: 'Failed to delete from clearanceform.' });
                        }
    
                        db.query(sqlDeleteFromIndigency, [request_id], (err) => {
                            if (err) {
                                console.error('Error deleting from indigencyform:', err);
                                return res.status(500).json({ success: false, message: 'Failed to delete from indigencyform.' });
                            }
    
                            db.query(sqlDeleteFromCertificate, [request_id], (err) => {
                                if (err) {
                                    console.error('Error deleting from certificateform:', err);
                                    return res.status(500).json({ success: false, message: 'Failed to delete from certificateform.' });
                                }
    
                                setTimeout(() => {
                                    db.query(sqlDeleteFromRequest, [currentQueueNumber], (err) => {
                                        if (err) {
                                            console.error('Database delete error from request:', err);
                                            return res.status(500).json({ success: false, message: 'Failed to delete from request table.' });
                                        }
    
                                        db.query(sqlFetchNextQueue, (err, nextQueueResult) => {
                                            if (err || !nextQueueResult[0]) {
                                                return res.status(404).json({ success: false, message: 'No more queue numbers available.' });
                                            }
    
                                            const nextQueueNumber = nextQueueResult[0].queue_number;
    
                                            return res.json({
                                                success: true,
                                                message: 'Queue processed and deleted successfully.',
                                                nextQueueNumber: nextQueueNumber,
                                            });
                                        });
                                    });
                                }, 2000); // 2-second delay
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Error processing queue:', error);
            return res.status(500).json({ success: false, message: 'Failed to process queue.', error: error.message });
        }
    });
    


    server.get('/api/service-total', async (req, res) => {
        const { service_name } = req.query;
        console.log("Fetching total for:", service_name);
    
        if (!service_name) {
            return res.status(400).json({ success: false, message: 'Service name is required.' });
        }
    
        try {
            const query = `
                SELECT COUNT(*) AS total 
                FROM history 
                WHERE service_name = ? AND status = 'Pickup'
            `;
            db.query(query, [service_name], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database query failed.' });
                }
                if (rows.length > 0) {
                    res.json({ success: true, total: rows[0].total });
                } else {
                    res.json({ success: true, total: 0 });
                }
            });
        } catch (error) {
            console.error('Error fetching total:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch total.' });
        }
    });
    
    
    server.get('/api/service-complete', async (req, res) => {
        const { service_name } = req.query;
        console.log("Fetching complete total for:", service_name);
    
        if (!service_name) {
            return res.status(400).json({ success: false, message: 'Service name is required.' });
        }
    
        try {
            const query = `
                SELECT COUNT(*) AS total 
                FROM history 
                WHERE service_name = ? AND status = 'Complete'
            `;
            db.query(query, [service_name], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database query failed.' });
                }
                if (rows.length > 0) {
                    res.json({ success: true, total: rows[0].total });
                } else {
                    res.json({ success: true, total: 0 });
                }
            });
        } catch (error) {
            console.error('Error fetching complete total:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch complete total.' });
        }
    });


    server.get('/api/users', (req, res) => {
        const query = `SELECT id, FNAME, LNAME, username, email FROM user_register ORDER BY created_at ASC`;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching users:', err);
                res.status(500).send('Error fetching users');
            } else {
                res.json(results); // Return results in the same order as fetched
            }
        });
    });
    
    
    

   
};
module.exports = endpoints;
