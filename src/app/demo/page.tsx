"use client";

import { Header } from "@/components/layout/Header";
import { StorePanel } from "@/components/store/StorePanel";
import { CartDrawer } from "@/components/store/CartDrawer";
import { FloatingAgentBubble } from "@/components/agent/FloatingAgentBubble";

export default function DemoPage() {
  return (
    <>
      <Header showDemoLink={false} />
      <main id="main" className="demo-layout demo-layout--store">
        <StorePanel />
      </main>
      <CartDrawer />
      <FloatingAgentBubble />
    </>
  );
}
