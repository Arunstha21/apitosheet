// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('gsheet', {
    title: "Sheet to API",
    rungsapi: (data) => ipcRenderer.invoke('rungsapi',data),
    stopgsapi: () => ipcRenderer.invoke('stopgsapi'),

})