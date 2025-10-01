import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEOHead = ({ 
  title = "ARET Environmental Services - Leading Waste Management in Uyo, Akwa Ibom State",
  description = "Professional waste collection, management, and disposal services in Uyo, Akwa Ibom State. Reliable, sustainable, and affordable waste management solutions for residential and commercial clients.",
  keywords = "waste management Uyo, waste collection Akwa Ibom, environmental services Nigeria, garbage disposal Uyo, recycling services, waste management company",
  image = "/og-image.jpg",
  url = "https://aret-environmental.com"
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;

    // Create or update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'ARET Environmental Services');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
    updateMetaTag('theme-color', '#10b981');
    updateMetaTag('mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');

    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'ARET Environmental Services', true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Local Business Schema
    const updateSchema = () => {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
      
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "ARET Environmental Services",
        description,
        url,
        "telephone": "+2347032224738",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "No. 576 Oron Road",
          "addressLocality": "Uyo",
          "addressRegion": "Akwa Ibom State",
          "addressCountry": "Nigeria"
        },
        "openingHours": [
          "Mo-Fr 08:00-18:00",
          "Sa 09:00-16:00"
        ],
        "serviceArea": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "5.0378",
            "longitude": "7.9085"
          },
          "geoRadius": "50000"
        },
        "services": [
          "Waste Collection",
          "Waste Management",
          "Waste Disposal",
          "Recycling Programs",
          "Environmental Services"
        ]
      };

      script.textContent = JSON.stringify(schema);
    };

    updateSchema();

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;