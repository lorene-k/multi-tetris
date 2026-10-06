import fs from "fs";
import debug from "debug";
import { fileURLToPath } from "url";
import { join, extname, dirname, resolve, sep } from "path";

const mediaTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..", "..");
const clientDist = join(projectRoot, "src/client/dist");

const logerror = debug("tetris:error");
const loginfo = debug("tetris:info");

// Serves built client (src/client/dist) over HTTP
// index.html SPA fallback so client-side routing works on refresh
export const initApp = (app, params, cb) => {
  const { host, port } = params;

  const handler = (req, res) => {
    const urlPath = req.url.split("?")[0];

    const filePath =
      urlPath === "/"
        ? join(clientDist, "index.html")
        : join(clientDist, urlPath);

    if (!resolve(filePath).startsWith(clientDist + sep)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    const ext = extname(filePath);
    const contentType = mediaTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(join(clientDist, "index.html"), (err2, fallback) => {
          if (err2) {
            logerror(err);
            res.writeHead(500);
            return res.end("Not found");
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(fallback);
        });
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  };

  app.on("request", handler);

  app.listen({ host, port }, () => {
    loginfo(`Server listening on ${params.url}`);
    cb();
  });
};
