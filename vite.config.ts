import { defineConfig } from 'vite';

// GitHub Pages project site: https://jakubstawski.github.io/Octopuzzle/
const base = process.env.GITHUB_PAGES === 'true' ? '/Octopuzzle/' : './';

export default defineConfig({
    publicDir: 'public',
    base,
    server: {
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
