import Header from "@/components/header";
import AppSidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true;

  if (!isAuthenticated) redirect("/login");
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebar_state")?.value ==='true';
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar />
      <main className="flex flex-col w-full h-full min-h-screen">
        <Header />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default HomeLayout;
