import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo, type ComponentProps } from "react";

let modulesRegistered = false;

function ensureAgGridModules() {
  if (!modulesRegistered) {
    ModuleRegistry.registerModules([AllCommunityModule]);
    modulesRegistered = true;
  }
}

ensureAgGridModules();

export const appGridTheme = themeQuartz.withParams({
  accentColor: "#041632",
  backgroundColor: "#ffffff",
  borderColor: "#c5c6ce",
  browserColorScheme: "light",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontSize: 14,
  foregroundColor: "#191c1e",
  headerBackgroundColor: "#f7f9fb",
  headerFontSize: 12,
  headerFontWeight: 600,
  headerTextColor: "#44474d",
  rowHoverColor: "rgba(242, 244, 246, 0.6)",
  wrapperBorder: true,
});

export const defaultGridColDef: ColDef = {
  filter: false,
  resizable: true,
  suppressMovable: true,
  autoHeight: true, 
};

type AgGridReactProps<TData> = ComponentProps<typeof AgGridReact<TData>>;

export type DataGridProps<TData> = AgGridReactProps<TData> & {
  className?: string;
};

export function DataGrid<TData>({
  className = "app-data-grid w-full",
  defaultColDef,
  theme,
  domLayout = "autoHeight",
  suppressCellFocus = true,
  enableCellTextSelection = true,
  ...props
}: DataGridProps<TData>) {
  const mergedDefaultColDef = useMemo(
    () => ({ ...defaultGridColDef, ...defaultColDef }) as ColDef<TData>,
    [defaultColDef],
  );

  return (
    <div className={className}>
      <AgGridReact<TData>
        theme={theme ?? appGridTheme}
        domLayout={domLayout}
        suppressCellFocus={suppressCellFocus}
        enableCellTextSelection={enableCellTextSelection}
        defaultColDef={mergedDefaultColDef}
        {...props}
      />
    </div>
  );
}
