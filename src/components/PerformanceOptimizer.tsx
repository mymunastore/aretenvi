import { useEffect } from "react";

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalImages = [
        "/src/assets/hero-waste-workers.png",
        "/src/assets/aret-logo.png",
        "/src/assets/about-3rs.jpg",
        "/src/assets/service-waste-management.jpg"
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Prefetch likely next pages
    const prefetchPages = () => {
      const pagesToPrefetch = ['/services', '/pricing', '/about'];
      
      pagesToPrefetch.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    };

    // Optimize viewport meta tag for better mobile experience
    const optimizeViewport = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    };

    // Add touch-action optimization for better mobile performance
    const optimizeTouchActions = () => {
      const style = document.createElement('style');
      style.textContent = `
        /* Optimize touch actions for better mobile performance */
        .touch-pan-x { touch-action: pan-x; }
        .touch-pan-y { touch-action: pan-y; }
        .touch-pinch-zoom { touch-action: pinch-zoom; }
        .touch-manipulation { touch-action: manipulation; }
        
        /* Prevent zoom on input focus for iOS */
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="number"],
        textarea,
        select {
          font-size: 16px;
        }
        
        /* Better mobile scrolling */
        body {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        /* Improve button interactions on mobile */
        button, [role="button"] {
          touch-action: manipulation;
          -webkit-user-select: none;
          user-select: none;
        }
      `;
      document.head.appendChild(style);
    };
    // Optimize font loading
    const optimizeFonts = () => {
      const fontPreloadLink = document.createElement('link');
      fontPreloadLink.rel = 'preconnect';
      fontPreloadLink.href = 'https://fonts.googleapis.com';
      document.head.appendChild(fontPreloadLink);

      const fontPreloadLink2 = document.createElement('link');
      fontPreloadLink2.rel = 'preconnect';
      fontPreloadLink2.href = 'https://fonts.gstatic.com';
      fontPreloadLink2.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreloadLink2);
    };

    // Add performance monitoring
    const monitorPerformance = () => {
      if ('performance' in window) {
        window.addEventListener('load', () => {
          const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
          
          if (loadTime > 3000) {
            console.warn(`Page load time is slow: ${loadTime}ms`);
          }
        });
      }
    };

    preloadCriticalResources();
    prefetchPages();
    optimizeViewport();
    optimizeTouchActions();
    optimizeFonts();
    monitorPerformance();

    // Cleanup function
    return () => {
      // Remove performance listeners if needed
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceOptimizer;