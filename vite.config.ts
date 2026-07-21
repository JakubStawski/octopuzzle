import { defineConfig } from 'vite';

// GitHub Pages project site: https://jakubstawski.github.io/octopuzzle/
// Path must match the GitHub repo name casing (case-sensitive on Pages).
const base = process.env.GITHUB_PAGES === 'true' ? '/octopuzzle/' : './';

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
