# Electron 概述

## 定义

Electron 是由 GitHub 开发的开源框架，使用 Web 技术(JavaScript、HTML、CSS)构建跨平台桌面应用（支持 Windows、macOS、Linux）

Electron 将 Chromium 和 Node.js 嵌入到了一个二进制文件中，因此它允许你仅需一个代码仓库，就可以撰写支持 Windows、macOS 和 Linux 的跨平台应用

## 核心架构

- **Chromium**：跨平台渲染技术栈,提供网页渲染能力，负责 UI 展示。
- **Node.js**：提供系统底层 API 访问（如文件系统、操作系统交互）。

## 适用场景

跨平台桌面应用、Web 应用转桌面应用、轻量级工具类软件(如 VS Code、Slack)

## 主进程与渲染进程对比

| 项目         | 主进程 (Main Process)                           | 渲染进程 (Renderer Process)                    |
| ------------ | ----------------------------------------------- | ---------------------------------------------- |
| **角色**     | 应用入口，管理生命周期、原生交互（菜单/对话框） | 每个窗口独立，负责渲染 HTML/CSS/JS 界面        |
| **环境**     | 完整 Node.js 环境                               | Chromium 浏览器环境（默认无 Node.js 访问权限） |
| **安全限制** | 无限制，可调用系统 API                          | 默认隔离，需通过预加载脚本暴露 API             |
| **通信机制** | 使用 `ipcMain` 接收/处理消息                    | 使用 `ipcRenderer` 发送/接收消息               |

关键点 :

•​​ 进程隔离

- 主进程与渲染进程独立运行，通过 IPC (进程间通信) 交互

•​​ 安全规范

- 渲染进程默认禁用 Node.js（nodeIntegration: false），避免 XSS 攻击导致系统漏洞

- 可以通过特定的机制 (IPC, Preload Script) 与主进程通信以获取系统能力

## 文件结构

index.htm(渲染进程界面)

- 标准 HTML 结构

main.ts(主进程)

- 主进程入口文件，加载 HTML 文件、处理应用生命周期事件

preload.js(渲染进程脚本)

- 在渲染进程加载前运行，作为连接渲染进程和主进程的桥梁，提供安全可控的 API。

- 预加载脚本包含在浏览器窗口加载网页之前运行的代码。 其可访问 DOM 接口和 Node.js 环境，并且经常在其中使用 contextBridge 接口将特权接口暴露给渲染器

```typescript
import { app, BrowserWindow, shell, ipcMain } from "electron";

app:
  这个模块控制着您应用程序的事件生命周期。
  常用事件：ready, window-all-closed, activate, before-quit, will-quit。
  常用方法：app.quit(), app.getPath(name) (获取系统路径), app.getName(), app.getVersion(), app.isPackaged

BrowserWindow:
  这个模块创建和管理 app 的窗口
  构造函数选项 (new BrowserWindow({...})):
    width, height: 窗口尺寸。
    x, y: 窗口位置。
    frame: 是否显示窗口边框和标题栏。
    show: 创建时是否立即显示。
    webPreferences: 配置网页功能的关键选项 (见下)。
  实例方法：win.loadURL(), win.loadFile(), win.close(), win.show(), win.hide(), win.maximize(), win.minimize(), win.isMaximized(), win.webContents (访问 WebContents 对象)
  实例事件：closed, focus, blur, resize, move
```

## 进程间通信 IPC (Inter-Process Communication)

可以使用 Electron 的 ipcMain 模块和 ipcRenderer 模块来进行进程间通信

| 通信方向 | 常用方法 | 特点 | 典型应用场景 |
|---------|---------|------|------------|
| 渲染进程 → 主进程 | ipcRenderer.send | 异步，不等待回复 | 发送通知、触发动作（如日志记录） |
| 渲染进程 → 主进程 | ipcRenderer.invoke / ipcMain.handle | 异步，返回 Promise，现代推荐方式 | 文件操作、数据库查询、复杂计算等异步任务 |
| 渲染进程 → 主进程 | ipcRenderer.sendSync | 同步，会阻塞渲染进程，不推荐耗时操作 | 需要立即结果的简单操作（如读取配置） |
| 主进程 → 渲染进程 | webContents.send | 主进程主动向特定窗口发送消息 | 通知状态更新、推送数据 |
| 主进程 → 渲染进程 | event.reply | 在主进程的 ipcMain.on 监听器中，回复特定渲染进程的请求 | 响应 ipcRenderer.send 的请求 |
| 渲染进程 ↔ 渲染进程 | 通过主进程转发 | 主进程作为中介 | 简单实现不同窗口间的通信 |
| 渲染进程 ↔ 渲染进程 | MessagePort API | 更高效的直接通信方式，支持传输大量数据 | 需要高性能、低延迟的渲染进程间数据交换 |

1. 为什么需要 IPC？

- 主进程和渲染进程是独立的进程，需要一种机制来传递消息和数据。

- 渲染进程需要请求主进程执行特权操作 (如读写文件、显示原生对话框)。

- 主进程需要通知渲染进程更新 UI 或传递数据

2. 主要模块：

- ipcMain (在主进程中使用)

- ipcRenderer (在渲染进程或 preload 脚本中使用)

- contextBridge (在 preload 脚本中使用，用于安全暴露 API)

3. 通信模式

- 渲染进程 -> 主进程 (单向)
  - 渲染进程 (preload 或 renderer): ipcRenderer.send(channel, ...args)
  - 主进程: ipcMain.on(channel, (event, ...args) => { ... })

- 渲染进程 -> 主进程 -> 渲染进程 (双向异步，请求/响应)
  - 渲染进程 (preload 或 renderer): const result = await ipcRenderer.invoke(channel, ...args)
  - 主进程: ipcMain.handle(channel, async (event, ...args) => { ...; return result; })

- 主进程 -> 渲染进程 (单向)
  - 主进程 (需要 webContents 对象): win.webContents.send(channel, ...args)
  - 渲染进程 (preload 或 renderer): ipcRenderer.on(channel, (event, ...args) => { ... })

## Electron Forge

Electron Forge 是一个处理 Electron 应用程序打包与分发的一体化工具

```bash
npm install --save-dev @electron-forge/cli
```

### [集成 vite](https://juejin.cn/post/7475288228230037558)

### Electron 打包工具

- electron-builder
- electron-forge
- electron-packager

| 工具名称          | 主要特点                                                             | 打包输出格式                                                                    | 适用场景                                               | 学习/配置复杂度      |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| electron-builder  | 功能全面、支持自动更新、多平台构建、丰富的安装程序定制选项、应用签名 | Windows: .exe (NSIS), .msi<br>macOS: .dmg, .zip<br>Linux: .AppImage, .deb, .rpm | 需要正式分发、自动更新、多平台支持、定制安装流程的项目 | 中等偏上，配置项较多 |
| electron-packager | 轻量、简单、快速、灵活性高                                           | 各平台的可执行文件及其依赖（需手动分发或压缩）                                  | 快速打包测试、内部使用、需要高度定制打包流程的项目     | 较低，命令行参数简单 |
| electron-forge    | 集成了开发、构建、打包、发布的全套工作流，预置模板                   | 依赖其内部集成的打包器（通常是 electron-builder 或 electron-packager）          | 希望快速开始新项目、需要一体化开发体验的开发者         | 中等，概念较多       |
