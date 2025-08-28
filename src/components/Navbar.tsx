import type { HTMLAttributes, ReactNode } from "react";

import { Link, useLocation } from "react-router";

import { navConfig } from "@/config/";
import { cn } from "@/utils";

function NavItem({ href, children }: { href: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const isActive = pathname === href;
  return (
    <li>
      <Link
        to={href}
        className={cn(
          "relative block whitespace-nowrap px-3 py-2 transition",
          isActive
            ? "text-lime-600 dark:text-lime-400"
            : "hover:text-lime-600 dark:hover:text-lime-400"
        )}
      >
        {children}
        {isActive && (
          <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-lime-700/0 via-lime-700/70 to-lime-700/0 dark:from-lime-400/0 dark:via-lime-400/40 dark:to-lime-400/0" />
        )}
      </Link>
    </li>
  );
}
export default function Navbar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <nav
      className={cn(
        "w-full h-full",
        "group relative",
        "rounded-full bg-gradient-to-b from-zinc-50/70 to-white/90",
        "shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-md",
        "dark:from-zinc-900/70 dark:to-zinc-800/90 dark:ring-zinc-100/10",
        "[--spotlight-color:rgb(236_252_203_/_0.6)] dark:[--spotlight-color:rgb(217_249_157_/_0.07)]",
        className
      )}
      {...props}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <ul className="flex bg-transparent px-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 ">
        {navConfig.map(({ href, text }) => (
          <NavItem key={href} href={href}>
            {text}
          </NavItem>
        ))}
      </ul>
    </nav>
  );
}
