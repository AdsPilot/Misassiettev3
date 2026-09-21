import { ArrowDown, ArrowRight, Clock3, Search, UsersRound } from "lucide-react";
import type { CSSProperties } from "react";
import { categoryMeta, featuredRecipes } from "@/lib/recipes";

const featuredIllustrations: Record<string, string> = {
  "banana-bread-healthy": "/illustrations/featured-banana-bread.png",
  "courgettes-marinees-citron-thym": "/illustrations/featured-courgettes-marinees.png",
  "pates-burrata-pistaches": "/illustrations/featured-pates-burrata.png",
};

export default function Home() {
  return (
    <main className="home-page">
      <header className="site-header cover-header">
        <a className="wordmark wordmark-small" href="/">
          Misassiette
        </a>
        <a className="header-link" href="/recettes">
          Toutes les recettes
        </a>
      </header>

      <section className="cover">
        <div className="cover-copy">
          <p className="eyebrow">Mon livre de recettes</p>
          <h1>Misassiette</h1>
          <p>Vous me les demandiez, alors les voilà&nbsp;!</p>
        </div>
        <div className="cover-art">
          <img alt="Illustration d’une assiette de pâtes à la burrata et aux pistaches" src="/illustrations/couverture-misassiette.png" />
        </div>
        <a className="open-book-link" href="#sommaire">
          Ouvrir le livre
          <ArrowDown size={17} aria-hidden="true" />
        </a>
      </section>

      <section className="table-of-contents" id="sommaire">
        <div className="section-heading">
          <p className="eyebrow">Le sommaire</p>
          <h2>Qu’est-ce que vous allez cuisiner aujourd’hui&nbsp;?</h2>
        </div>

        <form action="/recettes" className="home-search">
          <Search size={20} aria-hidden="true" />
          <input aria-label="Rechercher une recette ou un ingrédient" name="q" placeholder="Rechercher une recette ou un ingrédient" type="search" />
          <button type="submit">Chercher</button>
        </form>

        <div className="chapter-grid">
          {Object.entries(categoryMeta).map(([key, category]) => (
            <a className="chapter-card" href={`/recettes?categorie=${key}`} key={key} style={{ "--accent": category.color } as CSSProperties}>
              <span className="chapter-doodle">{category.icon}</span>
              <span>{category.label}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          ))}
        </div>

        <a className="all-recipes-link" href="/recettes">
          Parcourir toutes les recettes
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <p className="eyebrow">Découvrir les recettes</p>
          <h2>Laissez-vous tenter</h2>
        </div>
        <div className="featured-grid">
          {featuredRecipes.map((recipe) => {
            const meta = categoryMeta[recipe.category];
            return (
              <a className="featured-card" href={`/recettes/${recipe.slug}`} key={recipe.slug} style={{ "--accent": meta.color } as CSSProperties}>
                <img alt={`Illustration de ${recipe.title}`} src={featuredIllustrations[recipe.slug] ?? recipe.illustration} />
                <div>
                  <span>{meta.label}</span>
                  <h3>{recipe.title}</h3>
                  <p>
                    <Clock3 size={15} aria-hidden="true" /> {recipe.total ?? recipe.cook ?? recipe.prep}
                    <UsersRound size={15} aria-hidden="true" /> {recipe.portions} pers.
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
