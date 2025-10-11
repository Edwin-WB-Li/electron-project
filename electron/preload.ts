// 预加载脚本
import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
// contextBridge.exposeInMainWorld 将 Electron 的 ipcRenderer 功能安全地暴露给渲染进程，允许渲染进程与主进程进行通信
// 这样渲染进程可以通过 window.ipcRenderer 访问这些方法（名字可以自定义）
contextBridge.exposeInMainWorld("ipcRenderer", {
  // send(channel, ...args)：向主进程发送异步消息（单向）。
  // invoke(channel, ...args)：向主进程发送异步消息并等待主进程返回结果（双向）。
  // on(channel, listener)：监听主进程发来的消息。
  // once(channel, listener)：只监听一次主进程发来的消息。
  // removeListener(channel, listener)：移除监听器。
  // removeAllListeners(channel)：移除某个频道的所有监听器。
  // off(channel, listener)：移除监听器（等价于 removeListener）。
  // sendSync(channel, ...args)：向主进程发送同步消息（不推荐，可能阻塞渲染进程）。
  // postMessage(channel, message, [transfer])：向主进程发送消息（支持 MessagePort）
  // 监听主进程发送的事件
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  // 移除事件监听器
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  // 向主进程发送消息（单向通信）
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  // 向主进程发送消息并等待回复（双向通信）
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  showOpenDialog: () => ipcRenderer.invoke("show-open-dialog"),
  readingConfigurations: () => ipcRenderer.invoke("reading-configurations"),
  // You can expose other APTs you need here.
  // ...
});

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"],
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loader`;
  const styleContent = `
  .${className} {
    width: 48px;
    height: 48px;
    margin: auto;
    position: relative;
  }

  .${className}:before {
    content: '';
    width: 48px;
    height: 5px;
    background: #f0808050;
    position: absolute;
    top: 60px;
    left: 0;
    border-radius: 50%;
    animation: shadow324 0.5s linear infinite;
  }

  .${className}:after {
    content: '';
    width: 100%;
    height: 100%;
    background: #f08080;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 4px;
    animation: jump7456 0.5s linear infinite;
  }

  @keyframes jump7456 {
    15% {
      border-bottom-right-radius: 3px;
    }

    25% {
      transform: translateY(9px) rotate(22.5deg);
    }

    50% {
      transform: translateY(18px) scale(1, .9) rotate(45deg);
      border-bottom-right-radius: 40px;
    }

    75% {
      transform: translateY(9px) rotate(67.5deg);
    }

    100% {
      transform: translateY(0) rotate(90deg);
    }
  }

  @keyframes shadow324 {
    0%,
    100% {
      transform: scale(1, 1);
    }

    50% {
      transform: scale(1.2, 1);
    }
  }

  .app-loading-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #282c34;
    z-index: 9;
  }
  `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
