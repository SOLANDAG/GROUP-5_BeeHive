import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";

type SidebarContextType = {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<
  SidebarContextType | undefined
>(undefined);

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const openSidebar = () =>
    setIsOpen(true);

  const closeSidebar = () =>
    setIsOpen(false);

  const toggleSidebar = () =>
    setIsOpen((prev) => !prev);

  const value = useMemo(
    () => ({
      isOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [isOpen]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(
    SidebarContext
  );

  if (!context) {
    throw new Error(
      "useSidebar must be used within SidebarProvider"
    );
  }

  return context;
}
