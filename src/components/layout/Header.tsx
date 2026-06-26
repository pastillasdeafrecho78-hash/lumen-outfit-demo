import Link from "next/link";
import { SITE } from "@/lib/constants";

export function Header({ showDemoLink = true }: { showDemoLink?: boolean }) {
  return (
    <header className="site-header">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          {SITE.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {showDemoLink && (
            <Link href="/demo" className="button button-primary button-small">
              Probar demo
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
