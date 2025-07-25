import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
// import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  esbuild: {
    // Ensure proper JSX transformation
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
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
        entryFileNames: (chunkInfo) => {
          // Ensure all entry files have .js extension
          return `assets/[name]-[hash].js`;
        },
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          // Keep React and all React-related packages together
          'vendor-react': ['react', 'react-dom', 'react-dom/client', 'react-router-dom', 'scheduler', 'use-sync-external-store'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // UI libraries
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-toast'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Maps (keep separate due to size)
          'vendor-maps': ['mapbox-gl'],
          // Charts
          'vendor-charts': ['recharts'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Dates
          'vendor-dates': ['date-fns']
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
      'react-dom/client',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
      'scheduler',
      'use-sync-external-store'
    ],
    // Force Vite to pre-bundle these packages
    force: true
  },
}));
