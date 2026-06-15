import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-5xl font-bold gradient-text">404</h1>
      <p className="text-muted-foreground mt-2">Halaman tidak ditemukan.</p>
      <Link href="/">
        <Button className="mt-4">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
