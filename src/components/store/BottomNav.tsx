"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, Receipt, User } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const cartCount = useAppStore((s) => s.cart.reduce((a, i) => a + i.quantity, 0));

  const items = [
    { href: "/", icon: Home, label: t("home") },
    { href: "/products", icon: Package, label: t("products") },
    { href: "/cart", icon: ShoppingCart, label: t("cart"), badge: cartCount },
    { href: "/orders", icon: Receipt, label: t("orders") },
    { href: "/profile", icon: User, label: t("profile") },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-lg sm:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] relative transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
