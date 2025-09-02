import type { PackageJson } from "type-fest";

import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import tailwindcss from "@tailwindcss/vite";

import pkg from "./package.json";

const dependencies = (pkg as PackageJson).dependencies || {};

export default defineConfig(({ command }) => {
  // 每次启动都删除旧构建产物
  rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      electron({
        // 主进程配置
        main: {
          entry: "electron/main.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
              );
            } else {
              args.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild, // 生产环境才压缩代码
              outDir: "dist-electron/main", // 主进程构建输出目录
              rollupOptions: {
                external: Object.keys(dependencies), // 将项目依赖视为外部依赖，不打包进来
              },
            },
          },
        },
        // 预加载脚本配置
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: "electron/preload.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined, // #332
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: Object.keys(dependencies),
              },
            },
          },
        },
        // 渲染进程配置，即 web 相关的 vite 配置，当前 {} 代表使用 Vite 默认的渲染进程配置
        renderer: {},
      }),
    ],
    server: process.env.VSCODE_DEBUG
      ? (() => {
          const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
          return {
            host: url.hostname,
            port: +url.port,
          };
        })()
      : undefined,
    clearScreen: false,
  };
});
