"use client";

import { BookOpen, LogOut, Plus, ScrollText, Webhook } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  type NavItem,
  Sidebar,
  SidebarLayout,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { credentials, disconnect } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!credentials) {
      router.replace("/");
    }
  }, [credentials, router]);

  if (!credentials) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      href: "/dashboard/webhooks",
      icon: Webhook,
      label: "Webhooks",
      active: pathname === "/dashboard/webhooks",
    },
    {
      href: "/dashboard/create",
      icon: Plus,
      label: "Create Webhook",
      active: pathname === "/dashboard/create",
    },
    {
      href: "/dashboard/logs",
      icon: ScrollText,
      label: "Delivery Logs",
      active: pathname === "/dashboard/logs",
    },
    {
      href: "/dashboard/docs",
      icon: BookOpen,
      label: "Integration Docs",
      active: pathname === "/dashboard/docs",
    },
  ];

  const handleDisconnect = () => {
    disconnect();
    router.push("/");
  };

  return (
    <SidebarProvider>
      <Sidebar
        footer={
          <div className="flex flex-col gap-3">
            <div className="truncate text-xs text-zinc-500">
              {credentials.serverUrl}
            </div>
            <button
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              onClick={handleDisconnect}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        }
        logo={
          <span className="font-semibold text-lg text-white tracking-tight flex items-center">
            <Image src="/photon-logo-text.png" alt="Photon Logo" width={100} height={30} />
          </span>
        }
        navItems={navItems}
      />
      <SidebarLayout>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-zinc-200 border-b bg-background px-6 dark:border-zinc-800">
          <SidebarTrigger />
        </header>
        <main className="p-6">{children}</main>
      </SidebarLayout>
    </SidebarProvider>
  );
}
