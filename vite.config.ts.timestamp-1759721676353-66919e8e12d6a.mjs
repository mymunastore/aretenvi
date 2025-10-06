// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { visualizer } from "file:///home/project/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "ARET Environmental Services",
        short_name: "ARET",
        description: "Professional waste management services",
        theme_color: "#10b981",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 31536e3 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  // CSS optimization
  css: {
    devSourcemap: mode === "development"
  },
  // Performance optimizations
  optimizeDeps: {
    force: true,
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "lucide-react",
      "@tanstack/react-query"
    ],
    exclude: ["@vite/client", "@vite/env", "lovable-tagger"]
  },
  esbuild: {
    target: "es2020",
    drop: mode === "production" ? ["console", "debugger"] : [],
    legalComments: "none"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIG1vZGUgPT09IFwicHJvZHVjdGlvblwiICYmIHZpc3VhbGl6ZXIoe1xuICAgICAgZmlsZW5hbWU6IFwiZGlzdC9zdGF0cy5odG1sXCIsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICB9KSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0J10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnQVJFVCBFbnZpcm9ubWVudGFsIFNlcnZpY2VzJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ0FSRVQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1Byb2Zlc3Npb25hbCB3YXN0ZSBtYW5hZ2VtZW50IHNlcnZpY2VzJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMTBiOTgxJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9wd2EtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsanBnfSddLFxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogMzE1MzYwMDAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC8uKlxcLnN1cGFiYXNlXFwuY29cXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3N1cGFiYXNlLWFwaScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogNTAsIG1heEFnZVNlY29uZHM6IDMwMCB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczogeyBlbmFibGVkOiBmYWxzZSB9XG4gICAgfSlcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsXG4gICAgbWluaWZ5OiBcImVzYnVpbGRcIixcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XVwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgfSxcbiAgLy8gQ1NTIG9wdGltaXphdGlvblxuICBjc3M6IHtcbiAgICBkZXZTb3VyY2VtYXA6IG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIixcbiAgfSxcbiAgLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBmb3JjZTogdHJ1ZSxcbiAgICBpbmNsdWRlOiBbXG4gICAgICBcInJlYWN0XCIsXG4gICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgXCJyZWFjdC1yb3V0ZXItZG9tXCIsXG4gICAgICBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiLFxuICAgICAgXCJsdWNpZGUtcmVhY3RcIixcbiAgICAgIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIsXG4gICAgXSxcbiAgICBleGNsdWRlOiBbXCJAdml0ZS9jbGllbnRcIiwgXCJAdml0ZS9lbnZcIiwgXCJsb3ZhYmxlLXRhZ2dlclwiXSxcbiAgfSxcbiAgZXNidWlsZDoge1xuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICBkcm9wOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFtcImNvbnNvbGVcIiwgXCJkZWJ1Z2dlclwiXSA6IFtdLFxuICAgIGxlZ2FsQ29tbWVudHM6IFwibm9uZVwiLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsa0JBQWtCO0FBQzNC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
