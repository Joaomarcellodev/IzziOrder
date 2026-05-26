import { ReactNode } from "react";
import { getEstablishmentBySlug } from "@/app/actions/public-menu-actions";
import { notFound } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Público */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center relative">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 truncate px-8 text-center max-w-md">
            {establishment.name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-4xl relative">
        {children}
      </main>

      {/* Footer Público */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-gray-50 pb-24 md:pb-6">
        <p>
          Powered by{" "}
          <span className="font-bold text-blue-600">IzziOrder</span>
        </p>
      </footer>
    </div>
  );
}
