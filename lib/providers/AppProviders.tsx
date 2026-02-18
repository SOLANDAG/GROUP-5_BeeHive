import React from "react";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { RoleProvider } from "@/lib/auth/RoleProvider";
import { SidebarProvider } from "@/lib/ui/SidebarContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}
