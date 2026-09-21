// Regenerates the list of known sentences. Run it after ADDING sentences.
// A line that disappears from the baseline means a sentence users know was removed or reworded.
import { writeFileSync } from "node:fs";
import { BASELINE, sentenceLines } from "./helpers.mjs";

const lines = sentenceLines();
writeFileSync(BASELINE, lines.join("\n") + "\n");
console.log(`${lines.length} sentences written to tests/baseline-sentences.tsv`);
