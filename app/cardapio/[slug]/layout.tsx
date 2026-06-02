import { ReactNode } from "react";
import { getEstablishmentBySlug } from "@/app/actions/public-menu-actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Store, Info, Clock } from "lucide-react";

interface PublicMenuLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuLayout({
  children,
  params,
}: PublicMenuLayoutProps) {
  const { slug } = await params;
  const establishment = await getEstablishmentBySlug(slug);

  if (!establishment) {
    notFound();
  }

  const coverUrl =
    (establishment as any).cover_url ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=60";
  const logoUrl = (establishment as any).logo_url || "";

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800 antialiased selection:bg-[#FD7E14]/10 isolate">
      <div className="relative h-40 md:h-56 w-full overflow-hidden bg-neutral-900 z-0">
        <Image
          src={coverUrl}
          alt={`Capa de ${establishment.name}`}
          fill
          priority
          className="object-cover opacity-60 scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-950/20 to-transparent" />
      </div>

      <header className="relative z-0 -mt-12 px-4 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-5 shadow-xl border border-neutral-100/80 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative h-20 w-20 rounded-xl bg-white shadow-md border border-neutral-100 flex items-center justify-center p-2 shrink-0 -mt-12 sm:-mt-16 bg-gradient-to-br from-white to-neutral-50">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`Logo de ${establishment.name}`}
                  width={80}
                  height={80}
                  className="object-contain rounded-lg"
                />
              ) : (
                <Store className="w-10 h-10 text-[#FD7E14]" />
              )}
            </div>

            <div className="flex-1 space-y-1.5 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900">
                  {establishment.name}
                </h1>

                <span className="inline-flex self-center sm:self-auto items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Aberto
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  Entrega: 35-50 min
                </span>
                <span className="hidden sm:inline text-neutral-300">•</span>
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-neutral-400" />
                  Café & Almoço
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-4xl relative z-0">
        {children}
      </main>

      <footer className="py-8 text-center text-xs font-medium text-neutral-400 border-t border-neutral-200/60 bg-neutral-100/50 pb-28 md:pb-8 transition-colors">
        <p className="flex items-center justify-center gap-1.5">
          Desenvolvido por
          <span className="font-extrabold tracking-wide bg-gradient-to-r from-[#FD7E14] to-amber-500 bg-clip-text text-transparent">
            IzziOrder
          </span>
        </p>
      </footer>
    </div>
  );
}
