import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
// import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.PORT) || 5173,
    allowedHosts: [
      '.netlify.app',
      'localhost',
      '127.0.0.1',
      '::1',
      'nuptul.com',
      'www.nuptul.com'
    ],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'production' &&
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
    }),
    // Sentry plugin for error tracking and performance monitoring
    // Uncomment after installing @sentry/vite-plugin
    // mode === 'production' &&
    // sentryVitePlugin({
    //   org: "your-sentry-org",
    //   project: "nuptily-social-suite",
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    //   sourceMaps: {
    //     include: ["./dist/assets"],
    //     ignore: ["node_modules"],
    //   },
    // }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Routing
          if (id.includes('react-router-dom')) {
            return 'vendor-router';
          }
          
          // UI libraries - split into smaller chunks
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }
          
          // Supabase and data
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          
          // Chart libraries
          if (id.includes('recharts')) {
            return 'features-charts';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'vendor-forms';
          }
          
          // CRITICAL: Separate mapbox into its own chunk
          if (id.includes('mapbox-gl')) {
            return 'vendor-maps';
          }
          
          // Heavy admin components
          if (id.includes('/src/components/admin') || id.includes('/src/pages/dashboard')) {
            return 'features-admin';
          }
          
          // Chat and messaging
          if (id.includes('/src/components/chat') || id.includes('InstantMessenger')) {
            return 'features-messaging';
          }
          
          // Venue pages (without the map component)
          if (id.includes('/src/pages/venues')) {
            return 'pages-venues';
          }
          
          // Venue components (without map)
          if (id.includes('/src/components/venue') && !id.includes('VenueMap')) {
            return 'components-venue';
          }
          
          // Map components separately
          if (id.includes('VenueMap') || id.includes('/src/components/map')) {
            return 'features-maps';
          }
          
          // Utils and helpers
          if (id.includes('/src/utils') || id.includes('/src/integrations')) {
            return 'utils';
          }
          
          // Large component libraries
          if (id.includes('date-fns')) {
            return 'vendor-dates';
          }
          
          // Default fallback for other vendor modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        }
      }
    },
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 400, // Warn for chunks > 400KB
    
    // Assets optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    copyPublicDir: true,
    
    // Additional bundle optimizations
    sourcemap: false, // Disable sourcemaps in production
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react'
    ],
  },
}));
