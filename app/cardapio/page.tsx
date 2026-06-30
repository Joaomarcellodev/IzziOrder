// Redirect to default public menu slug
import { redirect } from 'next/navigation';

export default function CardapioRoot() {
  // Use environment variable for default slug if set
  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_SLUG;
  if (defaultSlug) {
    redirect(`/cardapio/${defaultSlug}`);
  }
  // Fallback: redirect to a generic cardapio page or home
  redirect('/');
}
