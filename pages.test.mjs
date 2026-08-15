import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = import.meta.dirname;
const read = (name) => readFile(resolve(root, name), "utf8");

test("GitHub Pages entry point uses repository-relative application assets", async () => {
  const html = await read("index.html");

  assert.match(html, /<script\s+type="module">/);
  assert.match(html, /from\s+"\.\/calc-core\.js"/);
  assert.match(html, /navigator\.serviceWorker\.register\("\.\/sw\.js"\)/);
  assert.match(html, /<link\s+rel="manifest"\s+href="manifest\.json"/);

  const assetReferences = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => !/^(?:https?:|data:|mailto:|tel:)/i.test(reference));

  assert.ok(assetReferences.length > 0);
  for (const reference of assetReferences) {
    assert.ok(!reference.startsWith("/"), `${reference} must remain relative for a project Pages URL`);
    await access(resolve(root, reference));
  }
});

test("manifest remains inside the Machinist_calc Pages scope", async () => {
  const manifest = JSON.parse(await read("manifest.json"));
  const pagesBase = new URL("https://ianarsenault-tn.github.io/Machinist_calc/");

  assert.equal(manifest.id, "./");
  assert.equal(manifest.start_url, ".");
  assert.equal(manifest.scope, "./");
  assert.equal(new URL(manifest.start_url, pagesBase).pathname, "/Machinist_calc/");

  for (const icon of manifest.icons) {
    assert.ok(!icon.src.startsWith("/"));
    await access(resolve(root, icon.src));
  }
  for (const shortcut of manifest.shortcuts) {
    assert.ok(shortcut.url.startsWith("./"));
    assert.equal(new URL(shortcut.url, pagesBase).pathname, "/Machinist_calc/");
  }
});

test("service worker precache is complete and repository-relative", async () => {
  const serviceWorker = await read("sw.js");
  const precacheSource = serviceWorker.match(/const PRECACHE = (\[[^;]+\]);/)?.[1];
  assert.ok(precacheSource, "PRECACHE declaration was not found");
  const precache = JSON.parse(precacheSource);

  for (const reference of precache) {
    assert.ok(reference === "./" || reference.startsWith("./"), `${reference} must be relative`);
    if (reference !== "./") await access(resolve(root, reference.slice(2)));
  }
  assert.ok(precache.includes("./index.html"));
  assert.ok(precache.includes("./calc-core.js"));
  assert.ok(precache.includes("./manifest.json"));
});

test("Pages bypasses Jekyll processing", async () => {
  await access(resolve(root, ".nojekyll"));
});
