import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { BASELINE, LANGS, ROOT, categoryFiles, loadCategory, sentenceLines } from "./helpers.mjs";

// Places where French and English are allowed to differ. Keep this list short and explain each entry.
const MIRROR_EXCEPTIONS = new Set([
  "professions.json", // French has masculine and feminine forms ("pompier" / "pompière")
  "medical.json#health-insurance", // "carte vitale" only exists in France
]);

const files = categoryFiles();
const eachPicto = (fn) => {
  for (const file of files) for (const picto of loadCategory(file).pictograms) fn(file, picto);
};
const report = (problems) => assert.equal(problems.length, 0, `\n${problems.join("\n")}`);

test("every category file is valid JSON with a pictograms array", () => {
  assert.ok(files.length > 0);
  for (const file of files) {
    const data = loadCategory(file);
    assert.ok(Array.isArray(data.pictograms) && data.pictograms.length > 0, `${file}: no pictograms`);
  }
});

test("pictogram ids are unique within a category", () => {
  const problems = [];
  for (const file of files) {
    const seen = new Set();
    for (const { id } of loadCategory(file).pictograms) {
      if (seen.has(id)) problems.push(`${file}: duplicate id "${id}"`);
      seen.add(id);
    }
  }
  report(problems);
});

test("every pictogram has an image, and a label and sentences in French and English", () => {
  const problems = [];
  eachPicto((file, picto) => {
    if (!picto.id || !picto.image) problems.push(`${file} [${picto.id}]: missing id or image`);
    for (const lang of LANGS) {
      const t = picto.translations?.[lang];
      if (!t?.label?.trim()) problems.push(`${file} [${picto.id}] ${lang}: missing label`);
      if (!Array.isArray(t?.phrases)) problems.push(`${file} [${picto.id}] ${lang}: missing phrases`);
      for (const p of t?.phrases ?? []) {
        if (!p.emoji?.trim() || !p.text?.trim()) problems.push(`${file} [${picto.id}] ${lang}: sentence without emoji or text`);
      }
    }
  });
  report(problems);
});

test("French and English sentences mirror each other (same count, same emoji)", () => {
  const problems = [];
  eachPicto((file, picto) => {
    if (MIRROR_EXCEPTIONS.has(file) || MIRROR_EXCEPTIONS.has(`${file}#${picto.id}`)) return;
    const { fr, en } = picto.translations;
    if (fr.phrases.length !== en.phrases.length) {
      problems.push(`${file} [${picto.id}]: ${fr.phrases.length} French vs ${en.phrases.length} English sentences`);
      return;
    }
    fr.phrases.forEach((p, i) => {
      if (p.emoji !== en.phrases[i].emoji) problems.push(`${file} [${picto.id}] sentence ${i + 1}: emoji differs (${p.emoji} / ${en.phrases[i].emoji})`);
    });
  });
  report(problems);
});

test("no sentence appears twice in the same pictogram", () => {
  const problems = [];
  eachPicto((file, picto) => {
    for (const lang of LANGS) {
      const seen = new Set();
      for (const { text } of picto.translations[lang].phrases) {
        const key = text.toLowerCase();
        if (seen.has(key)) problems.push(`${file} [${picto.id}] ${lang}: "${text}"`);
        seen.add(key);
      }
    }
  });
  report(problems);
});

test("punctuation: a space before ? and ! in French, none in English", () => {
  const problems = [];
  eachPicto((file, picto) => {
    for (const { text } of picto.translations.fr.phrases) {
      if (/[^\s  ][?!]/.test(text)) problems.push(`${file} [${picto.id}] fr: "${text}"`);
    }
    for (const { text } of picto.translations.en.phrases) {
      if (/[\s  ][?!]/.test(text)) problems.push(`${file} [${picto.id}] en: "${text}"`);
    }
  });
  report(problems);
});

test("image files exist and are registered in PictogramImageMap", () => {
  const map = readFileSync(path.join(ROOT, "components/PictogramImageMap.ts"), "utf8");
  const problems = [];
  eachPicto((file, picto) => {
    if (!picto.image.startsWith("assets/")) return; // emoji
    if (!existsSync(path.join(ROOT, picto.image))) problems.push(`${file} [${picto.id}]: file not found: ${picto.image}`);
    if (!map.includes(`'${picto.image}'`)) problems.push(`${file} [${picto.id}]: not in PictogramImageMap (run pnpm update-pictos): ${picto.image}`);
  });
  report(problems);
});

test("every category file is loaded by lib/pictograms.ts", () => {
  const loader = readFileSync(path.join(ROOT, "lib/pictograms.ts"), "utf8");
  report(files.filter((f) => !loader.includes(`data/pictograms/${f}`)).map((f) => `${f} is not registered in loadPictograms()`));
});

test("French and English interface translations have the same keys", () => {
  const keys = (obj, prefix = "") =>
    Object.entries(obj).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
  const load = (lang) => new Set(keys(JSON.parse(readFileSync(path.join(ROOT, `locales/${lang}/translation.json`), "utf8"))));
  const fr = load("fr"), en = load("en");
  report([
    ...[...fr].filter((k) => !en.has(k)).map((k) => `missing in English: ${k}`),
    ...[...en].filter((k) => !fr.has(k)).map((k) => `missing in French: ${k}`),
  ]);
});

test("no known sentence has been removed or reworded", () => {
  const current = new Set(sentenceLines());
  const missing = readFileSync(BASELINE, "utf8").split("\n").filter((l) => l && !current.has(l));
  report(missing.map((l) => `removed: ${l.replaceAll("\t", " | ")}`));
});
