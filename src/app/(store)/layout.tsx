import { Header } from "@/components/store/Header";
import { BottomNav } from "@/components/store/BottomNav";
import { ChatWidget } from "@/components/store/ChatWidget";
import { ThemeColorSync } from "@/components/store/ThemeColorSync";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeColorSync />
      <Header />
      <main className="mx-auto max-w-5xl px-4 pt-20 pb-24 sm:pb-10 min-h-screen">
        {children}
      </main>
      <BottomNav />
      <ChatWidget />
    </>
  );
}
