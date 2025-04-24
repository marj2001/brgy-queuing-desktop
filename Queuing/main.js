const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const fs = require('fs');
const db = require('./js/db');
const bcrypt = require('bcrypt');
const multer = require('multer');

const PORT = 3000;
const server = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

server.use(express.json());
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    win.loadFile('src/index.html');
}

// Fingerprint handling
ipcMain.on('scan-fingerprint', (event) => {
    const exePath = "C:\\Users\\Administrator\\source\\repos\\DigitalPersonaBiometrics\\bin\\Release\\DigitalPersonaBiometrics.exe";

    console.log("Running fingerprint scanner at:", exePath);

    // Subukan i-execute ang .exe file
    const fingerprintProcess = spawn(exePath, [], { shell: true });

    // Handle stdout output
    fingerprintProcess.stdout.on('data', (data) => {
        console.log(`Fingerprint scanner output: ${data.toString()}`);
    });

    // Handle stderr output
    fingerprintProcess.stderr.on('data', (data) => {
        console.error(`Fingerprint scanner error output: ${data.toString()}`);
    });

    // Handle process close event
    fingerprintProcess.on('close', (code) => {
        console.log(`Fingerprint process exited with code: ${code}`);
        if (code === 0) {
            event.reply('fingerprint-success');
        } else {
            event.reply('fingerprint-error', `Process exited with code ${code}`);
        }
    });

    // Handle errors sa pag-run ng process
    fingerprintProcess.on('error', (error) => {
        console.error(`Failed to start fingerprint scanner: ${error.message}`);
        event.reply('fingerprint-error', error.message);
    });
});


app.whenReady().then(createWindow);

server.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to the MySQL database "queuing".');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Import API endpoints
require('./endpoints')(server, db, bcrypt, upload);
