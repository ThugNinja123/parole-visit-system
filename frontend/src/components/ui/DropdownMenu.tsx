import { OverlayPanel } from "primereact/overlaypanel";
import {
  cloneElement,
  createContext,
  useContext,
  useRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "@/lib/utils";

type MenuContextValue = {
  panelRef: RefObject<OverlayPanel | null>;
  hide: () => void;
};

const DropdownMenuContext = createContext<MenuContextValue | null>(null);

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within DropdownMenu");
  return ctx;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const panelRef = useRef<OverlayPanel>(null);
  const hide = () => panelRef.current?.hide();

  return (
    <DropdownMenuContext.Provider value={{ panelRef, hide }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { panelRef } = useDropdownMenu();

  return (
    <button
      type="button"
      className={className}
      {...props}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(e);
        panelRef.current?.toggle(e);
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  className,
  children,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  children: ReactNode;
}) {
  const { panelRef } = useDropdownMenu();

  return (
    <OverlayPanel
      ref={panelRef}
      dismissable
      unstyled
      pt={{
        root: {
          className: cn(
            "z-50 min-w-40 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest py-1 text-sm text-on-surface shadow-lg outline-none",
            className,
          ),
        },
        content: { className: "p-0" },
      }}
    >
      {children}
    </OverlayPanel>
  );
}

const itemClasses =
  "flex cursor-pointer items-center gap-2 px-3 py-1.5 outline-none hover:bg-surface-container-low";

export function DropdownMenuItem({
  className,
  children,
  render,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  render?: ReactElement;
  disabled?: boolean;
}) {
  const { hide } = useDropdownMenu();
  const classes = cn(itemClasses, className);

  if (render) {
    return cloneElement(render, {
      ...props,
      className: cn(classes, (render.props as { className?: string }).className),
      onClick: (e: MouseEvent<HTMLElement>) => {
        (render.props as { onClick?: (ev: MouseEvent<HTMLElement>) => void }).onClick?.(e);
        onClick?.(e);
        hide();
      },
      children,
    } as Partial<typeof render.props>);
  }

  return (
    <button
      type="button"
      className={classes}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        hide();
      }}
    >
      {children}
    </button>
  );
}
