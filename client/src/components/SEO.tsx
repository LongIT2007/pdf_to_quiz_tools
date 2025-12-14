import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export function SEO({
  title = "PDF to Quiz Tools - Chuyển PDF thành Bài Kiểm Tra Trắc Nghiệm",
  description = "Công cụ AI chuyển đổi PDF thành bài kiểm tra trắc nghiệm tương tác. Tạo quiz từ PDF, Word, PowerPoint với nhiều loại câu hỏi khác nhau. Miễn phí và dễ sử dụng.",
  keywords = "PDF to quiz, chuyển PDF thành quiz, tạo bài kiểm tra từ PDF, AI quiz generator, PDF to test, trắc nghiệm từ PDF, quiz maker, đề thi từ PDF",
  image = "/images/pdf-conversion-illustration.png",
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", "PDF to Quiz Tools");
    updateMetaTag("robots", "index, follow");
    updateMetaTag("language", "Vietnamese");
    updateMetaTag("revisit-after", "7 days");

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    // Ensure image URL is absolute for Open Graph
    const absoluteImage = image.startsWith("http") ? image : `https://pdf-to-quiz-tools-v2.vercel.app${image}`;
    updateMetaTag("og:image", absoluteImage, true);
    updateMetaTag("og:url", url, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:locale", "vi_VN", true);
    updateMetaTag("og:site_name", "PDF to Quiz Tools", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    // Ensure image URL is absolute for Twitter
    const absoluteImageForTwitter = image.startsWith("http") ? image : `https://pdf-to-quiz-tools-v2.vercel.app${image}`;
    updateMetaTag("twitter:image", absoluteImageForTwitter);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector("script[type='application/ld+json']");
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, structuredData]);

  return null;
}

