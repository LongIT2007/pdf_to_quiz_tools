import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req: any, res: any) {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const possiblePaths = [
      join(process.cwd(), "client", "public", "sitemap-new.xml"),
      join(process.cwd(), "dist", "public", "sitemap-new.xml"),
      join(process.cwd(), "public", "sitemap-new.xml"),
    ];
    
    let sitemapContent = null;
    for (const sitemapPath of possiblePaths) {
      try {
        sitemapContent = readFileSync(sitemapPath, "utf-8");
        sitemapContent = sitemapContent.replace(/<script[^>]*>.*?<\/script>/gis, '');
        sitemapContent = sitemapContent.replace(/<script[^>]*\/>/gi, '');
        sitemapContent = sitemapContent.replace(
          /<lastmod>[\d-]+<\/lastmod>/g,
          `<lastmod>${currentDate}</lastmod>`
        );
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!sitemapContent) {
      sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
    
    sitemapContent = sitemapContent.replace(/<script[^>]*>.*?<\/script>/gis, '');
    sitemapContent = sitemapContent.replace(/<script[^>]*\/>/gi, '');
    
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    res.status(200).send(sitemapContent);
  } catch (error) {
    console.error("Error serving sitemap-new.xml:", error);
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

