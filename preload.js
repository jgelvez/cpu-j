const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cpuJ', {
  // ── Datos de hardware ──
  getCpuInfo:    () => ipcRenderer.invoke('get-cpu-info'),
  getCpuSpeed:   () => ipcRenderer.invoke('get-cpu-speed'),
  getCpuTemp:    () => ipcRenderer.invoke('get-cpu-temp'),
  getBaseboard:  () => ipcRenderer.invoke('get-baseboard'),
  getBios:       () => ipcRenderer.invoke('get-bios'),
  getMemory:     () => ipcRenderer.invoke('get-mem'),
  getMemLayout:  () => ipcRenderer.invoke('get-mem-layout'),
  getGraphics:   () => ipcRenderer.invoke('get-graphics'),
  getOsInfo:     () => ipcRenderer.invoke('get-os-info'),
  getSystem:     () => ipcRenderer.invoke('get-system'),
  getAllInfo:     () => ipcRenderer.invoke('get-all-info'),

  // ── Controles de ventana ──
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),
});
