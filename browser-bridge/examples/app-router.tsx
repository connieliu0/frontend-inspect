/**
 * Next.js App Router integration
 *
 * Place this file at: app/components/ReactGrabDevBridge.tsx
 * Then render it in your root layout.tsx (dev only).
 */

"use client";

import { useEffect } from "react";

export default function ReactGrabDevBridge() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Dynamic import so the bridge code is never bundled in production
    let cleanup: (() => void) | undefined;

    import("../lib/reactGrabBridge").then(({ startReactGrabBridge }) => {
      cleanup = startReactGrabBridge();
    });

    return () => cleanup?.();
  }, []);

  return null;
}

/**
 * In app/layout.tsx:
 *
 *   import ReactGrabDevBridge from './components/ReactGrabDevBridge';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           {children}
 *           {process.env.NODE_ENV === 'development' && <ReactGrabDevBridge />}
 *         </body>
 *       </html>
 *     );
 *   }
 */
