import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";
const root = resolve("dist");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const path = resolve(
      root,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (!path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(path);
    const compressed =
      /\b gzip\b|\bgzip\b/.test(req.headers["accept-encoding"] ?? "") &&
      /\.(html|js|css|svg|json)$/.test(path);
    res.writeHead(200, {
      "content-type": mime[extname(path)] ?? "application/octet-stream",
      "cache-control": "no-store",
      vary: "Accept-Encoding",
      ...(compressed ? { "content-encoding": "gzip" } : {}),
    });
    res.end(compressed ? gzipSync(body) : body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(4173, "127.0.0.1", () =>
  console.log("Local production preview: http://127.0.0.1:4173/"),
);
