

# Electron 概述

## 定义

Electron 是由 GitHub 开发的开源框架，使用 Web 技术（JavaScript、HTML、CSS）构建跨平台桌面应用（支持 Windows、macOS、Linux）。Electron 将 Chromium 和 Node.js 嵌入到了一个二进制文件中，因此它允许你仅需一个代码仓库，就可以撰写支持 Windows、macOS 和 Linux 的跨平台应用

## 核心架构

- **Chromium**：跨平台渲染技术栈,提供网页渲染能力，负责 UI 展示。
- **Node.js**：提供系统底层 API 访问（如文件系统、操作系统交互）。

## 适用场景

跨平台桌面应用、Web 应用转桌面应用、轻量级工具类软件（如 VS Code、Slack）

## 主进程与渲染进程对比

| 项目         | 主进程 (Main Process)                           | 渲染进程 (Renderer Process)                                                                                     |
| ------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **角色**     | 应用入口，管理生命周期、原生交互（菜单/对话框） | 每个窗口独立，负责渲染 HTML/CSS/JS 界面                                                                         |
| **环境**     | 完整 Node.js 环境                               | Chromium 浏览器环境（默认无 Node.js 访问权限）                                                                  |
| **安全限制** | 无限制，可调用系统 API                          | 默认隔离，需通过预加载脚本暴露 API                                                                              |
| **通信机制** | 使用 `ipcMain` 接收/处理消息                    | 使用 [ipcRenderer](file://d:\project\my-project\Electron\my-electron-app\src\vite-env.d.ts) 发送/接收消息 |

关键点 ​​：

•​​ 进程隔离 ​​：主进程与渲染进程独立运行，通过 ​​IPC（进程间通信）​​ 交互。

•​​ 安全规范 ​​：渲染进程默认禁用 Node.js（nodeIntegration: false），避免 XSS 攻击导致系统漏洞。


index.html​​（渲染进程界面）：标准 HTML 结构

preload.js​​（预加载脚本） 预加载脚本包含在浏览器窗口加载网页之前运行的代码。 其可访问 DOM 接口和 Node.js 环境，并且经常在其中使用 contextBridge 接口将特权接口暴露给渲染器

```bash
# import { app, BrowserWindow, shell, ipcMain } from "electron";
# app: 这个模块控制着您应用程序的事件生命周期。
# BrowserWindow:这个模块创建和管理 app 的窗口
```

## 进程间通信 (IPC)
可以使用 Electron 的 ipcMain 模块和 ipcRenderer 模块来进行进程间通信

## Electron Forge 

Electron Forge 是一个处理 Electron 应用程序打包与分发的一体化工具


```bash
npm install --save-dev @electron-forge/cli
```