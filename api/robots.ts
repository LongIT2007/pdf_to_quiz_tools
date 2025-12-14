import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req: any, res: any) {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), "client", "public", "robots.txt"),
      join(process.cwd(), "dist", "public", "robots.txt"),
      join(process.cwd(), "public", "robots.txt"),
    ];
    
    let robotsContent = null;
    for (const robotsPath of possiblePaths) {
      try {
        robotsContent = readFileSync(robotsPath, "utf-8");
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!robotsContent) {
      // Fallback: return hardcoded robots.txt
      robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://pdf-to-quiz-tools-v2.vercel.app/sitemap.xml

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /quiz/editor/

# Allow important pages
Allow: /
Allow: /quiz/
Allow: /upload
Allow: /quizzes`;
    }
    
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(robotsContent);
  } catch (error) {
    console.error("Error serving robots.txt:", error);
    res.status(500).send("Error loading robots.txt");
  }
}

