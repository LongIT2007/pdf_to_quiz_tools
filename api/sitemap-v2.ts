import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req: any, res: any) {
  try {
    // Get current date for lastmod
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Try multiple possible paths for sitemap-v2.xml
    const possiblePaths = [
      join(process.cwd(), "client", "public", "sitemap-v2.xml"),
      join(process.cwd(), "dist", "public", "sitemap-v2.xml"),
      join(process.cwd(), "public", "sitemap-v2.xml"),
    ];
    
    let sitemapContent = null;
    for (const sitemapPath of possiblePaths) {
      try {
        sitemapContent = readFileSync(sitemapPath, "utf-8");
        // Remove any script tags that might have been injected
        sitemapContent = sitemapContent.replace(/<script[^>]*>.*?<\/script>/gis, '');
        sitemapContent = sitemapContent.replace(/<script[^>]*\/>/gi, '');
        // Update lastmod dates to current date
        sitemapContent = sitemapContent.replace(
          /<lastmod>[\d-]+<\/lastmod>/g,
          `<lastmod>${currentDate}</lastmod>`
        );
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    // Fallback: return hardcoded sitemap-v2 (always available)
    if (!sitemapContent) {
      sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/quizzes</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/pdfs</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/upload</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/upload/smart</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/quiz/create</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/quiz/smart-create</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    }
    
    // Clean up any remaining script tags or HTML
    sitemapContent = sitemapContent.replace(/<script[^>]*>.*?<\/script>/gis, '');
    sitemapContent = sitemapContent.replace(/<script[^>]*\/>/gi, '');
    
    // Set proper headers for XML response - CRITICAL for Google
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    res.status(200).send(sitemapContent);
  } catch (error) {
    console.error("Error serving sitemap-v2.xml:", error);
    // Even on error, return a basic sitemap
    const currentDate = new Date().toISOString().split('T')[0];
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pdf-to-quiz-tools-v2.vercel.app/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).send(fallbackSitemap);
  }
}

