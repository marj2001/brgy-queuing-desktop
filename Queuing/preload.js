const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    signup: (userData) => ipcRenderer.invoke('signup', userData),
    login: (userData) => ipcRenderer.invoke('login', userData),
    updateProfile: (profileData) => ipcRenderer.invoke('updateProfile', profileData),
    changePassword: (data) => ipcRenderer.invoke('changePassword', data),
    uploadProfilePicture: (data) => ipcRenderer.invoke('uploadProfilePicture', data),
    scanFingerprint: () => ipcRenderer.send('scan-fingerprint'),
    onFingerprintSuccess: (callback) => ipcRenderer.on('fingerprint-success', callback),
    onFingerprintError: (callback) => ipcRenderer.on('fingerprint-error', (event, error) => callback(error)),
});
