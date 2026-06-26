import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-page flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Demo por {SITE.author}</p>
        <p className="text-slate-500">Tienda agéntica con voz + MCP</p>
      </div>
    </footer>
  );
}
