import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/RecipeDetail";
import { getRecipe, recipes } from "@/lib/recipes";

export function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export const dynamicParams = false;

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipe(slug);

  if (!recipe) notFound();
  return <RecipeDetail recipe={recipe} />;
}
