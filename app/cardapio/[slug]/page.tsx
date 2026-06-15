import { getPublicMenu } from "@/app/actions/public-menu-actions";
import { notFound } from "next/navigation";
import { PublicMenuView } from "@/components/organisms/public-menu/public-menu-view";
import { Metadata } from "next";

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicMenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const menuData = await getPublicMenu(slug);

  if (!menuData) {
    return {
      title: "Cardápio não encontrado",
    };
  }

  return {
    title: `Cardápio - ${menuData.establishment.name}`,
    description: `Faça seu pedido online em ${menuData.establishment.name} de forma rápida e fácil!`,
  };
}

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;
  const menuData = await getPublicMenu(slug);

  if (!menuData) {
    notFound();
  }

  return (
    <PublicMenuView
      establishment={menuData.establishment}
      categories={menuData.categories}
      menuItems={menuData.menuItems}
    />
  );
}
