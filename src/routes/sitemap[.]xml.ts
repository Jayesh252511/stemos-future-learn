import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry { path: string; changefreq?: string; priority?: string; }

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/tutor", changefreq: "weekly", priority: "0.9" },
          { path: "/quiz", changefreq: "weekly", priority: "0.9" },
          { path: "/dashboard", changefreq: "weekly", priority: "0.8" },
          { path: "/paths", changefreq: "weekly", priority: "0.8" },
          { path: "/signin", changefreq: "monthly", priority: "0.5" },
          { path: "/signup", changefreq: "monthly", priority: "0.5" },
        ];
        const urls = entries.map((e) =>
          `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
