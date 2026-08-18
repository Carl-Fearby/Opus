import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(process.argv[2], "utf8");
const marker = "static short    musicScore[3][1130]";
const start = source.indexOf("{", source.indexOf(marker));
if (start < 0) throw new Error("musicScore was not found");

let depth = 0;
let arrayStart = -1;
const scores = [];
for (let index = start; index < source.length; index += 1) {
  if (source[index] === "{") {
    depth += 1;
    if (depth === 2) arrayStart = index + 1;
  } else if (source[index] === "}") {
    if (depth === 2 && arrayStart >= 0) scores.push(source.slice(arrayStart, index));
    depth -= 1;
    if (depth === 0) break;
  }
}

const constants = { EV_END: 0x40, MUS_STOP: 0, MUS_PLAY: 1 };
const parseScore = (score) => score
  .split(",")
  .map((part) => part.trim())
  .filter(Boolean)
  .map((part) => part in constants ? constants[part] : Number(part));
const title = parseScore(scores[0]);
const game = parseScore(scores[1]);
if ([...title, ...game].some(Number.isNaN)) throw new Error("Unexpected token in score");
const format = (values) => values.map((value, index) => `${index % 24 === 0 ? "  " : ""}${value}${index === values.length - 1 ? "" : ","}${index % 24 === 23 ? "\n" : " "}`).join("").trimEnd();

writeFileSync(
  new URL("../components/JetSetWilly/jetSetWillyAudioData.ts", import.meta.url),
  `// Generated from the licensed native JSW reference score.\nexport const JSW_TITLE_SCORE = [\n${format(title)}\n] as const;\nexport const JSW_GAME_SCORE = [\n${format(game)}\n] as const;\n`,
);
