import { Outlet } from "react-router";
import Navbar from "@/components/Navbar";
import Update from "@/components/update";

// import { BackgroundBeamsWithCollision } from "@/components/ui/BackgroundBeamsWithCollision";
export default function Layouts() {
  return (
    // <BackgroundBeamsWithCollision>
    <div className="h-full w-full p-3">
      <header className="m-auto mb-7 w-60">
        <Navbar className="flex justify-center p-1" />
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="p-3">
        <Update />
      </footer>
    </div>
    // </BackgroundBeamsWithCollision>
  );
}
