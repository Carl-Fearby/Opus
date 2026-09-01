import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/documentation/components/raw/"],
    },
    sitemap: "https://project-opus.netlify.app/sitemap.xml",
  };
}
