import { Outlet } from "react-router";
import Navbar from "@/components/Navbar";

import { BackgroundBeamsWithCollision } from "@/components/ui/BackgroundBeamsWithCollision";
export default function Layouts() {
  return (
    // <BackgroundBeamsWithCollision>
      <div className="w-full h-full">
        <header className="w-60 m-auto">
          <Navbar className="flex justify-center p-1" />
        </header>
        <main>
          <Outlet />
        </main>
        <footer>Footer</footer>
      </div>
    // </BackgroundBeamsWithCollision>
  );
}
