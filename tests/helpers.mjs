import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const DATA_DIR = path.join(ROOT, "data/pictograms");
export const BASELINE = path.join(ROOT, "tests/baseline-sentences.tsv");
export const LANGS = ["fr", "en"];

export const categoryFiles = () => readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();

export const loadCategory = (file) => JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8"));

// One line per sentence: file, pictogram id, language, text
export const sentenceLines = () => {
  const lines = [];
  for (const file of categoryFiles()) {
    for (const picto of loadCategory(file).pictograms) {
      for (const lang of LANGS) {
        for (const phrase of picto.translations[lang].phrases) {
          lines.push([file, picto.id, lang, phrase.text].join("\t"));
        }
      }
    }
  }
  return lines.sort();
};
