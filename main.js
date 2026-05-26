const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 580,
    height: 750,
    minWidth: 520,
    minHeight: 650,
    frame: false,
    transparent: false,
    backgroundColor: '#06080f',
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Controles de ventana
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('window-close', () => mainWindow?.close());
}

// ── Handlers de hardware con systeminformation ──

ipcMain.handle('get-cpu-info', async () => {
  try { return await si.cpu(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-cpu-speed', async () => {
  try { return await si.cpuCurrentSpeed(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-cpu-temp', async () => {
  try { return await si.cpuTemperature(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-baseboard', async () => {
  try { return await si.baseboard(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-bios', async () => {
  try { return await si.bios(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-mem', async () => {
  try { return await si.mem(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-mem-layout', async () => {
  try { return await si.memLayout(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-graphics', async () => {
  try { return await si.graphics(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-os-info', async () => {
  try { return await si.osInfo(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-system', async () => {
  try { return await si.system(); }
  catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-all-info', async () => {
  try {
    const [cpu, cpuSpeed, cpuTemp, baseboard, bios, mem, memLayout, graphics, osInfo, system] = await Promise.all([
      si.cpu(),
      si.cpuCurrentSpeed(),
      si.cpuTemperature(),
      si.baseboard(),
      si.bios(),
      si.mem(),
      si.memLayout(),
      si.graphics(),
      si.osInfo(),
      si.system(),
    ]);
    return { cpu, cpuSpeed, cpuTemp, baseboard, bios, mem, memLayout, graphics, osInfo, system };
  } catch (e) {
    return { error: e.message };
  }
});

// ── Ciclo de vida de Electron ──

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
