'use client';

import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export const SidebarStateE = {
  Expanded: 'expanded',
  Collapsed: 'collapsed',
} as const;
export type SidebarState = (typeof SidebarStateE)[keyof typeof SidebarStateE];

export const VisibilityStateE = {
  Visible: 'visible',
  Hidden: 'hidden',
} as const;
export type VisibilityState =
  (typeof VisibilityStateE)[keyof typeof VisibilityStateE];

type SidebarMainContextT = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  visibility: VisibilityState;
  toggleSidebar: () => void;
  hideSidebar: () => void;
  showSidebar: () => void;
};

const SidebarMainContext = React.createContext<SidebarMainContextT | null>(
  null
);

export const useSidebarMain = () => {
  const context = React.useContext(SidebarMainContext);
  if (!context) {
    throw new Error(
      'useCustomSidebar must be used within SidebarMainProvider.'
    );
  }

  return context;
};

export const SidebarMainProvider = ({
  children,
  open: openProp,
  onOpenChange: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <SidebarProvider>
      <SidebarMainProviderInner onOpenChange={setOpenProp} open={openProp}>
        {children}
      </SidebarMainProviderInner>
    </SidebarProvider>
  );
};

const SidebarMainProviderInner = ({
  children,
  open: openProp,
  onOpenChange: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const {
    open,
    setOpen,
    openMobile: originalOpenMobile,
    setOpenMobile: originalSetOpenMobile,
  } = useSidebar();

  // Define your defaults
  const defaultSidebarState: SidebarState = SidebarStateE.Expanded;
  const defaultSidebarVisibility: VisibilityState = VisibilityStateE.Visible;

  // Path-based rules
  const collapsedPathPartials: string[] = ['conversation'];
  const hiddenPathPartials: string[] = ['/'];

  // State Hooks
  const [sidebarState, setSidebarState] =
    useState<SidebarState>(defaultSidebarState);
  const [visibility, setVisibility] = useState<VisibilityState>(
    defaultSidebarVisibility
  );

  // Use controlled state if provided
  const isControlled = openProp !== undefined;
  const actualOpen = isControlled ? openProp : open;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        setOpenProp?.(newOpen);
      } else {
        setOpen(newOpen);
      }
      // Update the sidebar state with animation
      requestAnimationFrame(() => {
        setSidebarState(
          newOpen ? SidebarStateE.Expanded : SidebarStateE.Collapsed
        );
      });
    },
    [isControlled, setOpen, setOpenProp]
  );

  // Update sidebar state based on pathname
  useEffect(() => {
    if (hiddenPathPartials.some((partial) => pathname === partial)) {
      setVisibility(VisibilityStateE.Hidden);
    } else {
      setVisibility(VisibilityStateE.Visible);
    }

    if (collapsedPathPartials.some((partial) => pathname.includes(partial))) {
      setSidebarState(SidebarStateE.Collapsed);
      handleOpenChange(false);
    }
  }, [pathname, handleOpenChange]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      originalSetOpenMobile(!originalOpenMobile);
      return;
    }
    handleOpenChange(!actualOpen);
  }, [
    isMobile,
    originalOpenMobile,
    originalSetOpenMobile,
    actualOpen,
    handleOpenChange,
  ]);

  // Keep sidebarState in sync with open state
  useEffect(() => {
    requestAnimationFrame(() => {
      setSidebarState(
        actualOpen ? SidebarStateE.Expanded : SidebarStateE.Collapsed
      );
    });
  }, [actualOpen]);

  const hideSidebar = useCallback(
    () => setVisibility(VisibilityStateE.Hidden),
    []
  );
  const showSidebar = useCallback(
    () => setVisibility(VisibilityStateE.Visible),
    []
  );

  return (
    <SidebarMainContext.Provider
      value={{
        state: sidebarState,
        open: actualOpen,
        setOpen: handleOpenChange,
        isMobile,
        openMobile: originalOpenMobile,
        setOpenMobile: originalSetOpenMobile,
        visibility,
        toggleSidebar,
        hideSidebar,
        showSidebar,
      }}
    >
      {children}
    </SidebarMainContext.Provider>
  );
};
