"use client";

import { Clock3, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { categoryMeta, recipes, type Category } from "@/lib/recipes";
import { getModelContext } from "@/lib/webmcp";

type Props = {
  initialQuery?: string;
  initialCategory?: Category;
};

const categories: Array<Category | "toutes"> = ["toutes", "entrées", "plats", "desserts", "accompagnements"];

const galleryIllustrations: Record<string, string> = {
  "banana-bread-healthy": "/illustrations/uniform/banana-bread-healthy.png",
  "carpaccio-saumon-fume": "/illustrations/uniform/carpaccio-saumon.png",
  "courgettes-marinees-citron-thym": "/illustrations/uniform/courgettes-marinees-citron-thym.png",
  "crispy-rice-salade": "/illustrations/uniform/crispy-rice-salade.png",
  "effiloche-de-poulet": "/illustrations/uniform/effiloche-poulet.png",
  "korean-sticky-beef": "/illustrations/uniform/korean-sticky-beef.png",
  "pates-chorizo-ricotta": "/illustrations/uniform/pates-chorizo-ricotta.png",
  "pates-burrata-pistaches": "/illustrations/uniform/pates-burrata-pistaches.png",
  "pates-thon-citron-ricotta": "/illustrations/uniform/pates-thon-citron-ricotta.png",
  "poke-bowl": "/illustrations/uniform/poke-bowl.png",
  "poulet-abricots-secs": "/illustrations/uniform/poulet-abricots-secs.png",
  "poulet-imperial": "/illustrations/uniform/poulet-imperial.png",
  "poulet-iranien-fesenjan-simplifie": "/illustrations/uniform/poulet-iranien.png",
  "poulet-piccata": "/illustrations/uniform/poulet-piccata.png",
  "quiche-lorraine-epaisse": "/illustrations/uniform/quiche-lorraine.png",
  "riz-au-lait-de-coco": "/illustrations/uniform/riz-lait-coco.png",
  "riz-saute-a-la-tomate": "/illustrations/uniform/riz-saute-tomate.png",
  "salade-de-concombre-a-l-asiatique": "/illustrations/uniform/salade-concombre-asiatique.png",
  "tataki-saumon-pistache": "/illustrations/uniform/tataki-saumon-pistache.png",
  "salade-courgettes-feta-pignons": "/illustrations/uniform/salade-courgettes-feta-pignons.png",
  "salade-fattouche": "/illustrations/uniform/salade-fattouche.png",
  "salade-raviolis-pesto": "/illustrations/uniform/salade-raviolis-pesto.png",
  "salade-thai": "/illustrations/uniform/salade-thai.png",
  "saumon-en-croute": "/illustrations/uniform/saumon-en-croute.png",
  "tarte-au-chocolat": "/illustrations/uniform/tarte-au-chocolat.png",
};

export function RecipeGallery({ initialQuery = "", initialCategory = "toutes" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | "toutes">(initialCategory);
  const [duration, setDuration] = useState("toutes");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q");
    const urlCategory = params.get("categorie");
    if (!initialQuery && urlQuery) setQuery(urlQuery);
    if (initialCategory === "toutes" && urlCategory && urlCategory in categoryMeta) {
      setCategory(urlCategory as Category);
    }
  }, [initialCategory, initialQuery]);

  const filteredRecipes = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr");

    return recipes.filter((recipe) => {
      const recipeText = [recipe.title, recipe.category, ...recipe.ingredients.map((item) => item.label)]
        .join(" ")
        .toLocaleLowerCase("fr");
      const matchesQuery = !search || recipeText.includes(search);
      const matchesCategory = category === "toutes" || recipe.category === category;
      const minutes = Number.parseInt(recipe.total ?? recipe.cook ?? recipe.prep, 10);
      const matchesDuration =
        duration === "toutes" ||
        (duration === "rapide" && minutes <= 20) ||
        (duration === "equilibre" && minutes > 20 && minutes <= 45) ||
        (duration === "long" && minutes > 45);
      return matchesQuery && matchesCategory && matchesDuration;
    });
  }, [category, duration, query]);

  useEffect(() => {
    const context = getModelContext();
    if (!context) return;
    const lifecycle = new AbortController();

    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "search_misassiette_recipes",
            title: "Rechercher dans Misassiette",
            description: "Recherche des recettes par nom ou ingrédient et applique la recherche visible dans le sommaire.",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string" },
                category: { type: "string", enum: ["entrées", "plats", "desserts", "accompagnements"] },
              },
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            execute(input) {
              const candidate = input as { query?: unknown; category?: unknown };
              const nextQuery = typeof candidate.query === "string" ? candidate.query : "";
              const nextCategory =
                typeof candidate.category === "string" && candidate.category in categoryMeta
                  ? (candidate.category as Category)
                  : "toutes";
              const needle = nextQuery.toLocaleLowerCase("fr").trim();
              const matches = recipes
                .filter((recipe) => {
                  const text = [recipe.title, recipe.category, ...recipe.ingredients.map((ingredient) => ingredient.label)]
                    .join(" ")
                    .toLocaleLowerCase("fr");
                  return (!needle || text.includes(needle)) && (nextCategory === "toutes" || recipe.category === nextCategory);
                })
                .map((recipe) => ({ slug: recipe.slug, title: recipe.title, category: recipe.category }));

              setQuery(nextQuery);
              setCategory(nextCategory);
              return { count: matches.length, recipes: matches };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => undefined);
    } catch {
      return;
    }

    return () => lifecycle.abort();
  }, []);

  return (
    <main className="catalogue-page">
      <header className="site-header">
        <a className="wordmark wordmark-small" href="/">
          Misassiette
        </a>
        <a className="header-link" href="/">
          La couverture
        </a>
      </header>

      <section className="catalogue-intro">
        <p className="eyebrow">Le sommaire illustré</p>
        <h1>Toutes les recettes</h1>
        <p>Parcourez le livre à votre rythme, ou partez d’un ingrédient déjà dans votre cuisine.</p>
      </section>

      <section className="catalogue-tools" aria-label="Recherche et filtres">
        <label className="search-field">
          <Search size={19} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une recette ou un ingrédient"
            type="search"
          />
        </label>

        <div className="filter-row">
          <span className="filter-label">
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtrer
          </span>
          <select aria-label="Filtrer par temps de préparation" value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="toutes">Tous les temps</option>
            <option value="rapide">20 min ou moins</option>
            <option value="equilibre">20 à 45 min</option>
            <option value="long">Plus de 45 min</option>
          </select>
        </div>

        <div className="category-filter" aria-label="Filtrer par catégorie">
          {categories.map((item) => {
            const label = item === "toutes" ? "Tout le livre" : categoryMeta[item].label;
            const color = item === "toutes" ? "#29271F" : categoryMeta[item].color;
            return (
              <button
                className={category === item ? "is-active" : ""}
                key={item}
                onClick={() => setCategory(item)}
                style={{ "--filter-color": color } as CSSProperties}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <p className="result-count">
        {filteredRecipes.length} recette{filteredRecipes.length > 1 ? "s" : ""}
      </p>

      {filteredRecipes.length ? (
        <section className="recipe-grid" aria-label="Recettes">
          {filteredRecipes.map((recipe) => {
            const meta = categoryMeta[recipe.category];
            return (
              <a
                className="recipe-card"
                href={`/recettes/${recipe.slug}`}
                key={recipe.slug}
                style={{ "--accent": meta.color } as CSSProperties}
              >
                <div className="recipe-card-art">
                  <img alt={`Illustration de ${recipe.title}`} src={galleryIllustrations[recipe.slug] ?? recipe.illustration} />
                </div>
                <div className="recipe-card-copy">
                  <span className="recipe-category">{meta.label}</span>
                  <h2>{recipe.title}</h2>
                  <div className="card-meta">
                    <span>
                      <Clock3 size={15} aria-hidden="true" />
                      {recipe.total ?? recipe.cook ?? recipe.prep}
                    </span>
                    <span>
                      <UsersRound size={15} aria-hidden="true" />
                      {recipe.portions} pers.
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </section>
      ) : (
        <section className="empty-state">
          <p>Aucune recette ne correspond à cette recherche.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("toutes");
              setDuration("toutes");
            }}
            type="button"
          >
            Voir toutes les recettes
          </button>
        </section>
      )}
    </main>
  );
}
