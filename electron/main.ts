import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Notification,
  dialog,
  Menu,
  Tray,
  nativeImage,
} from "electron";
// import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { update } from "./update";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let tray = null;

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// 确保应用只能运行一个实例，防止用户多次启动应用
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/preload.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
// let appIcon = null;
async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    // 全屏
    // fullscreen: true,
    fullscreenable: true,
    // 传入脚本
    webPreferences: {
      // 指定一个预加载脚本的路径。该脚本在渲染进程加载网页之前运行，并且可以访问 Node.js API
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  // did-finish-load 该事件在网页内容加载完成时触发
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // 启动时最大化窗口（不是全屏）
  win.maximize();
  // Auto update
  update(win);
}

const NOTIFICATION_TITLE = "Basic Notification";
const NOTIFICATION_BODY = "Notification from the Main process";
// 自定义通知
function showNotification() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
}

// 自定义任务栏
app.setUserTasks([
  {
    program: process.execPath,
    arguments: "--new-window",
    iconPath: process.execPath,
    iconIndex: 0,
    title: "custom task",
    description: "Create a custom task",
  },
]);

// 当 Electron 应用准备就绪后，调用 createWindow 函数
app
  .whenReady()
  .then(() => {
    createWindow();

    const iconPath = path.join(process.env.VITE_PUBLIC, "favicon.ico"); // 图标路径
    const icon = nativeImage.createFromPath(iconPath);

    // 创建托盘实例
    tray = new Tray(icon);

    // 设置悬停提示
    tray.setToolTip("我的 Electron 应用");
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "显示主窗口",
        click: () => {
          if (win) win.show();
        },
      },
      { type: "separator" }, // 分隔线
      {
        label: "退出",
        click: () => app.quit(),
        //   {
        //   const result = await dialog.showMessageBox({
        //   type: 'question',
        //   buttons: ['取消', '确定'],
        //   defaultId: 1,
        //   title: '确认',
        //   message:  '你确定要执行此操作吗？'
        // });
        //   // return result.response === 1; // 返回 true 如果用户点击"确定"
        //  if(result)  app.quit(),
        // }
      },
      { type: "separator" }, // 分隔线
      {
        label: "显示弹框",
        click: () => {
          const result = dialog.showMessageBox({
            type: "question",
            buttons: ["取消", "确定"],
            defaultId: 1,
            title: "确认",
            message: "你确定要执行此操作吗？",
          });
          // return result.response === 1; // 返回 true 如果用户点击"确定"
          console.log(result);
        },
        // click: () => app.quit(),
        //   {
        //   const result = await dialog.showMessageBox({
        //   type: 'question',
        //   buttons: ['取消', '确定'],
        //   defaultId: 1,
        //   title: '确认',
        //   message:  '你确定要执行此操作吗？'
        // });
        //   // return result.response === 1; // 返回 true 如果用户点击"确定"
        //  if(result)  app.quit(),
        // }
      },
    ]);

    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      // 在Windows/Linux上，点击切换窗口显示/隐藏；macOS通常显示菜单
      if (process.platform === "darwin") {
        // macOS可能需要额外逻辑，例如显示/隐藏窗口或显示菜单
      } else {
        if (win?.isVisible()) {
          win?.hide();
        } else {
          win?.show();
        }
      }
    });
  })
  .then(showNotification);

// 当用户尝试启动第二个实例时，聚焦到主窗口
app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

ipcMain.on("set-title", (event, newTitle) => {
  // 修改窗口标题
  const webContents = event.sender;
  const window = BrowserWindow.fromWebContents(webContents);
  if (window) {
    window.setTitle(newTitle);
  }
});

ipcMain.handle("show-open-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });
  return result; // 结果将返回给渲染进程
});
ipcMain.handle("reading-configurations", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openFile"] });
  if (!result.canceled) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, "utf-8");
    return { content, filePath };
  }
  return null;
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
