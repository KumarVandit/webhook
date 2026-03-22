"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import {
  type ButtonHTMLAttributes,
  type ComponentType,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  active?: boolean;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  label: string;
}

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

function SidebarProvider({
  children,
  defaultOpen = false,
}: SidebarProviderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  footer?: ReactNode;
  logo?: ReactNode;
  navItems?: NavItem[];
}

function Sidebar({
  className,
  logo,
  navItems,
  footer,
  children,
  ...props
}: SidebarProps) {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          type="button"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-950 text-zinc-50 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          className
        )}
        {...props}
      >
        {/* Logo area */}
        {logo && (
          <div className="flex h-16 shrink-0 items-center gap-2 border-zinc-800 border-b px-6">
            {logo}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {navItems && navItems.length > 0 && (
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-zinc-800",
                      item.active
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white"
                    )}
                    href={item.href}
                  >
                    {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {children}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-zinc-800 border-t p-4">{footer}</div>
        )}
      </aside>
    </>
  );
}
Sidebar.displayName = "Sidebar";

function SidebarTrigger({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, toggle } = useSidebar();

  return (
    <button
      aria-label={open ? "Close sidebar" : "Open sidebar"}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        className
      )}
      onClick={toggle}
      type="button"
      {...props}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}
SidebarTrigger.displayName = "SidebarTrigger";

function SidebarLayout({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("min-h-screen lg:pl-64", className)} {...props}>
      {children}
    </div>
  );
}
SidebarLayout.displayName = "SidebarLayout";

export { Sidebar, SidebarProvider, SidebarTrigger, SidebarLayout, useSidebar };
export type { NavItem, SidebarProps, SidebarContextValue };
