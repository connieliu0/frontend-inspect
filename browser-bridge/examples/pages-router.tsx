/**
 * Next.js Pages Router integration
 *
 * Add this to pages/_app.tsx.
 */

import { useEffect } from "react";
import type { AppProps } from "next/app";

function useReactGrabBridge() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    let cleanup: (() => void) | undefined;

    import("../lib/reactGrabBridge").then(({ startReactGrabBridge }) => {
      cleanup = startReactGrabBridge();
    });

    return () => cleanup?.();
  }, []);
}

export default function App({ Component, pageProps }: AppProps) {
  useReactGrabBridge();

  return <Component {...pageProps} />;
}

/**
 * Note: copy reactGrabBridge.ts into your project, e.g. lib/reactGrabBridge.ts
 * and adjust the import path above accordingly.
 */
