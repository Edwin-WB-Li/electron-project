import { Boxes } from "@/components/ui/BackgroundBoxes";
import { cn } from "@/utils";

export default function About() {
  async function handleOpenButtonClick() {
    const filePaths = await window.ipcRenderer.showOpenDialog();
    if (filePaths) {
      // 处理返回的文件路径
      console.log("Selected file paths:", filePaths);
    }
  }
  async function handleReadingConfigurations() {
    const file = await window.ipcRenderer.readingConfigurations();
    if (file) {
      // 处理返回的文件
      console.log("file:", file);
    }
  }
  return (
    <>
      <div className="relative flex h-96 w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-slate-900">
        <div className="pointer-events-none absolute inset-0 z-20 h-full w-full bg-slate-900 [mask-image:radial-gradient(transparent,white)]" />
        <Boxes />
        <h1 className={cn("relative z-20 text-xl text-white md:text-4xl")}>
          Tailwind is Awesome
        </h1>
        <p className="relative z-20 mt-2 text-center text-neutral-300">
          Framer motion is the best animation library
        </p>
      </div>

      <div className="space-x-2 py-4 text-center">
        <button onClick={() => window.ipcRenderer.setTitle("新的窗口标题")}>
          修改标题
        </button>
        <button onClick={handleReadingConfigurations}>读取配置</button>
        <button onClick={handleOpenButtonClick}>文件</button>
      </div>
    </>
  );
}
