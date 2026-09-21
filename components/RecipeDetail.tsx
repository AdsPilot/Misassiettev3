"use client";

import { ChevronLeft, Clock3, CookingPot, Minus, Plus, UsersRound } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { categoryMeta, type Ingredient, type Recipe } from "@/lib/recipes";
import { getModelContext } from "@/lib/webmcp";

function formatFraction(value: number) {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const fraction = Math.round((rounded - whole) * 4);
  const fractions: Record<number, string> = { 0: "", 1: "¼", 2: "½", 3: "¾", 4: "" };
  if (fraction === 4) return String(whole + 1);
  if (!whole) return fractions[fraction] || "0";
  return `${whole}${fractions[fraction] ? ` ${fractions[fraction]}` : ""}`;
}

function formattedAmount(ingredient: Ingredient, factor: number) {
  if (ingredient.amount === undefined) return null;
  const raw = ingredient.amount * factor;

  if (ingredient.kind === "fixed") return null;
  if (ingredient.kind === "whole") return String(Math.max(1, Math.ceil(raw)));
  if (ingredient.kind === "fractional") return formatFraction(raw);
  if (ingredient.unit?.startsWith("c.") || ingredient.unit === "verre" || ingredient.unit === "poignées") {
    return formatFraction(raw);
  }
  if (Number.isInteger(raw)) return String(raw);
  return raw.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [portions, setPortions] = useState(recipe.portions);
  const category = categoryMeta[recipe.category];
  const factor = portions / recipe.portions;
  const timing = useMemo(
    () => [
      ["Préparation", recipe.prep],
      recipe.cook ? ["Cuisson", recipe.cook] : null,
      recipe.rest ? ["Repos", recipe.rest] : null,
    ].filter(Boolean) as Array<[string, string]>,
    [recipe.cook, recipe.prep, recipe.rest],
  );

  useEffect(() => {
    const context = getModelContext();
    if (!context) return;
    const lifecycle = new AbortController();

    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "set_misassiette_portions",
            title: "Ajuster les portions",
            description: "Met à jour le nombre de portions de la recette ouverte et recalcule les quantités visibles.",
            inputSchema: {
              type: "object",
              properties: { portions: { type: "integer", minimum: 1, maximum: 24 } },
              required: ["portions"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              const candidate = input as { portions?: unknown };
              if (typeof candidate.portions !== "number" || !Number.isInteger(candidate.portions) || candidate.portions < 1 || candidate.portions > 24) {
                throw new Error("Le nombre de portions doit être un entier compris entre 1 et 24.");
              }
              setPortions(candidate.portions);
              return { recipe: recipe.title, portions: candidate.portions };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => undefined);
    } catch {
      return;
    }

    return () => lifecycle.abort();
  }, [recipe.title]);

  return (
    <main className="recipe-detail" style={{ "--accent": category.color } as CSSProperties}>
      <header className="site-header">
        <a className="wordmark wordmark-small" href="/">
          Misassiette
        </a>
        <a className="header-link" href="/recettes">
          Toutes les recettes
        </a>
      </header>

      <article>
        <a className="back-link" href="/recettes">
          <ChevronLeft size={18} aria-hidden="true" />
          Retour au sommaire
        </a>

        <section className="recipe-hero">
          <div className="recipe-hero-copy">
            <span className="chapter-label">{category.label}</span>
            <h1>{recipe.title}</h1>
            <div className="recipe-timing">
              {timing.map(([label, value]) => (
                <span key={label}>
                  {label === "Cuisson" ? <CookingPot size={17} aria-hidden="true" /> : <Clock3 size={17} aria-hidden="true" />}
                  <b>{label}</b> {value}
                </span>
              ))}
            </div>
          </div>
          <div className="recipe-hero-art">
            <img alt={`Illustration de ${recipe.title}`} src={recipe.illustration} />
          </div>
        </section>

        <section className="servings-panel" aria-label="Ajuster les portions">
          <span className="servings-label">
            <UsersRound size={18} aria-hidden="true" />
            Pour combien de personnes ?
          </span>
          <div className="servings-control">
            <button aria-label="Retirer une portion" disabled={portions <= 1} onClick={() => setPortions((value) => Math.max(1, value - 1))} type="button">
              <Minus size={17} aria-hidden="true" />
            </button>
            <strong>
              {portions} portion{portions > 1 ? "s" : ""}
            </strong>
            <button aria-label="Ajouter une portion" onClick={() => setPortions((value) => value + 1)} type="button">
              <Plus size={17} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="recipe-body">
          <aside className="ingredients-column">
            <p className="eyebrow">À prévoir</p>
            <h2>Ingrédients</h2>
            <ul>
              {recipe.ingredients.map((ingredient, index) => {
                const amount = formattedAmount(ingredient, factor);
                return (
                  <li key={`${ingredient.label}-${index}`}>
                    <span className="ingredient-dot" aria-hidden="true" />
                    <span>
                      {amount ? <b>{amount}{ingredient.unit ? ` ${ingredient.unit}` : ""} </b> : null}
                      {ingredient.label}
                      {ingredient.optional ? <em> · facultatif</em> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="method-column">
            <p className="eyebrow">Pas à pas</p>
            <h2>Préparation</h2>
            <ol>
              {recipe.steps.map((step, index) => (
                <li key={step}>
                  <span className="step-number">{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </section>

        {recipe.note ? (
          <aside className="recipe-note">
            <span>Note</span>
            <p>{recipe.note}</p>
          </aside>
        ) : null}
      </article>
    </main>
  );
}
