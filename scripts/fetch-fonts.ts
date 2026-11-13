/**
 * Downloads Satoshi (body text) from Fontshare into src/assets/fonts.
 *
 * The ITF Free Font License allows self-hosting the font on our own site but
 * not redistributing it through a public repository, so the file is
 * git-ignored and fetched before `dev` and `build` instead. Already-downloaded
 * files are left alone, so this only touches the network once per checkout.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(import.meta.dirname, "../src/assets/fonts");
const FONTS = [
  {
    file: "Satoshi-Variable.woff2",
    // "@1" is Fontshare's variable font (weights 300–900) in one file.
    css: "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap",
  },
];

const isWoff2 = (bytes: Uint8Array) =>
  bytes.length > 1024 && new TextDecoder().decode(bytes.subarray(0, 4)) === "wOF2";

mkdirSync(DIR, { recursive: true });

for (const font of FONTS) {
  const target = join(DIR, font.file);
  if (existsSync(target) && isWoff2(readFileSync(target))) continue;

  try {
    const css = await (await fetch(font.css, { signal: AbortSignal.timeout(20_000) })).text();
    const url = css.match(/url\('([^']+\.woff2)'\)/)?.[1];
    if (!url) throw new Error("no woff2 URL in Fontshare's response");

    const response = await fetch(url.startsWith("//") ? `https:${url}` : url, {
      signal: AbortSignal.timeout(30_000),
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!response.ok || !isWoff2(bytes))
      throw new Error(`unexpected download (HTTP ${response.status})`);

    writeFileSync(target, bytes);
    console.log(`Downloaded ${font.file} from Fontshare`);
  } catch (error) {
    console.error(
      `Could not download ${font.file} from Fontshare: ${error instanceof Error ? error.message : error}\n` +
        `Download Satoshi from https://www.fontshare.com/fonts/satoshi and copy\n` +
        `Fonts/WEB/fonts/${font.file} to src/assets/fonts/.`,
    );
    process.exit(1);
  }
}
