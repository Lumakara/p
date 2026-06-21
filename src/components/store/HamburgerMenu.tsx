"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, Package, Receipt, User, HelpCircle, ShieldCheck,
  ChevronRight, Menu, X, LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";

function NavLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40" />
    </Link>
  );
}

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Menu"
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            {user ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&size=80&background=random`}
                alt="Avatar"
                className="h-11 w-11 rounded-full object-cover border-2 border-border flex-shrink-0"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-left gradient-text text-lg font-bold leading-tight">
                Digital Store
              </SheetTitle>
              {user ? (
                <p className="text-xs text-muted-foreground text-left truncate mt-0.5">
                  {user.displayName || user.email}
                </p>
              ) : (
                <Link href="/login" onClick={close} className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                  <LogIn className="h-3 w-3" /> Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-3 px-3">
          <Accordion type="multiple" defaultValue={["store", "account"]} className="space-y-1">

            {/* Store */}
            <AccordionItem value="store" className="border-none">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-lg hover:bg-muted hover:no-underline">
                Toko
              </AccordionTrigger>
              <AccordionContent className="pb-1 space-y-0.5">
                <NavLink href="/" icon={Home} label="Beranda" onClick={close} />
                <NavLink href="/products" icon={Package} label="Semua Produk" onClick={close} />
              </AccordionContent>
            </AccordionItem>

            {/* Account */}
            <AccordionItem value="account" className="border-none">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-lg hover:bg-muted hover:no-underline">
                Akun
              </AccordionTrigger>
              <AccordionContent className="pb-1 space-y-0.5">
                <NavLink href="/orders" icon={Receipt} label="Riwayat Pesanan" onClick={close} />
                <NavLink href="/profile" icon={User} label="Profil & Pengaturan" onClick={close} />
              </AccordionContent>
            </AccordionItem>

            {/* Support */}
            <AccordionItem value="support" className="border-none">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-lg hover:bg-muted hover:no-underline">
                Bantuan
              </AccordionTrigger>
              <AccordionContent className="pb-1 space-y-0.5">
                <NavLink href="/support" icon={HelpCircle} label="Pusat Bantuan" onClick={close} />
                <NavLink href="/profile#help" icon={HelpCircle} label="FAQ" onClick={close} />
              </AccordionContent>
            </AccordionItem>

            {/* Admin (logged-in users only) */}
            {user && (
              <AccordionItem value="admin" className="border-none">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-lg hover:bg-muted hover:no-underline">
                  Admin
                </AccordionTrigger>
                <AccordionContent className="pb-1 space-y-0.5">
                  <NavLink href="/dashboard" icon={ShieldCheck} label="Dashboard Admin" onClick={close} />
                </AccordionContent>
              </AccordionItem>
            )}

          </Accordion>
        </div>

        <div className="px-5 py-4 border-t border-border text-[11px] text-muted-foreground">
          © 2025 Digital Store. All rights reserved.
        </div>
      </SheetContent>
    </Sheet>
  );
}
