import type { ReactNode } from "react";

import { GameDynamicProvider } from "./providers/GameDynamicProvider";

export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return <GameDynamicProvider>{children}</GameDynamicProvider>;
}
