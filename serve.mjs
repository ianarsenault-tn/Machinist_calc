import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname);
const portArgument = process.argv.find((argument) => argument.startsWith("--port="));
const port = Number(portArgument?.slice("--port=".length) || process.env.PORT || 4173);
const baseArgument = process.argv.find((argument) => argument.startsWith("--base="));

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Port must be an integer from 1 to 65535");
}

function normalizeBasePath(value = "/") {
  let basePath = value.trim() || "/";
  if (!basePath.startsWith("/")) basePath = `/${basePath}`;
  if (!basePath.endsWith("/")) basePath += "/";
  basePath = basePath.replace(/\/{2,}/g, "/");
  if (basePath.includes("..")) throw new Error("Base path cannot contain '..'");
  return basePath;
}

const basePath = normalizeBasePath(baseArgument?.slice("--base=".length));
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);
    if (basePath !== "/" && pathname === basePath.slice(0, -1)) {
      response.writeHead(308, { Location: basePath });
      response.end();
      return;
    }
    if (!pathname.startsWith(basePath)) throw new Error("Outside configured base path");
    const requestedPath = pathname.slice(basePath.length) || "index.html";
    const relativePath = requestedPath.replace(/^\/+/, "");
    const filePath = resolve(root, relativePath);
    if (filePath !== root && !filePath.startsWith(root + sep)) throw new Error("Outside web root");
    const body = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`Marcos's Calculator: http://127.0.0.1:${port}${basePath}\n`);
});
