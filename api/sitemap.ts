import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req: any, res: any) {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), "client", "public", "sitemap.xml"),
      join(process.cwd(), "dist", "public", "sitemap.xml"),
      join(process.cwd(), "public", "sitemap.xml"),
    ];
    
    let sitemapContent = null;
    for (const sitemapPath of possiblePaths) {
      try {
        sitemapContent = readFileSync(sitemapPath, "utf-8");
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!sitemapContent) {
      // Fallback: return hardcoded sitemap
      sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/</loc>
    <lastmod>2024-12-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/quizzes</loc>
    <lastmod>2024-12-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/upload</loc>
    <lastmod>2024-12-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/upload/smart</loc>
    <lastmod>2024-12-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/quiz/editor</loc>
    <lastmod>2024-12-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    }
    
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(sitemapContent);
  } catch (error) {
    console.error("Error serving sitemap.xml:", error);
    res.status(500).send("Error loading sitemap");
  }
}

