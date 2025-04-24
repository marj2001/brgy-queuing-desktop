const mysql = require('mysql');


const db = mysql.createConnection({
  host: 'localhost',    
  user: 'root',         
  password: '',         
  database: 'queuing'    
});



db.connect((err) => {
  if (err) {
    console.log('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database "queuing".');
});

module.exports = db;