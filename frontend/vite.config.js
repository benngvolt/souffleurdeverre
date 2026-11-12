import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Remplace Create React App. Le dossier de sortie reste "build" (copié ensuite dans www/)
// et les fichiers générés restent sous /static/ comme avant, pour ne pas entrer en conflit
// avec les fichiers statiques de public/assets/ (polices, images).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Les fichiers .scss utilisent encore @import (avec utils/mixins.scss) ;
        // à migrer vers @use avant Dart Sass 3.0.
        silenceDeprecations: ['import'],
      },
    },
  },
  build: {
    outDir: 'build',
    assetsDir: 'static',
    sourcemap: true,
  },
});
