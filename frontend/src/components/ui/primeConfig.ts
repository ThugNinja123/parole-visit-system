import type { PassThroughOptions } from "primereact/passthrough";

/**
 * Global PrimeReact config: unstyled + Sentinel Command tokens (DESIGN.md / index.css).
 * No Aura/Lara themes. Feature code should import `@/components/ui/*`, not `primereact/*`.
 */
export const primeReactValue = {
  unstyled: true,
  ptOptions: {
    mergeSections: true,
    mergeProps: true,
  } satisfies PassThroughOptions,
};
