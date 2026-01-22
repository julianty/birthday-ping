# Copilot Instructions for birthday-ping

## Project Overview

- This is a Next.js app (see [README.md](README.md)), using the App Router and bootstrapped with `create-next-app`.
- Main UI code is in [src/app/page.tsx](src/app/page.tsx) and layout in [src/app/layout.tsx](src/app/layout.tsx).
- Styling uses Tailwind CSS, configured via [src/app/globals.css](src/app/globals.css) and `postcss.config.mjs`.
- Fonts are loaded with `next/font` (Geist and Geist_Mono).

## Developer Workflows

- **Start dev server:** `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`).
- **Build for production:** `npm run build`.
- **Run production server:** `npm start`.
- **Lint:** `npm run lint` (uses ESLint, config in [eslint.config.mjs](eslint.config.mjs)).
- Hot reload is enabled for all changes in `src/app`.

## Key Patterns & Conventions

- **App structure:** All pages and layouts are in `src/app/`. The entry point is `page.tsx`, wrapped by `layout.tsx`.
- **Styling:** Use Tailwind utility classes. Global CSS variables for colors and fonts are set in `globals.css`.
- **Fonts:** Use `next/font` for optimized font loading. Font variables are injected into the body class in `layout.tsx`.
- **Dark mode:** Uses CSS media query in `globals.css` to switch colors.
- **Images:** Use Next.js `<Image />` for optimized images.
- **No API routes or server components detected.**

## External Integrations

- No custom API endpoints, database, or external services are present.
- Deployment is recommended via Vercel (see [README.md](README.md)).

## Example: Adding a New Page

1. Create a new file in `src/app/` (e.g., `about.tsx`).
2. Export a default React component.
3. Use Tailwind classes for styling.

## References

- [README.md](README.md): Basic usage and deployment.
- [src/app/page.tsx](src/app/page.tsx): Main page example.
- [src/app/layout.tsx](src/app/layout.tsx): Layout and font setup.
- [src/app/globals.css](src/app/globals.css): Global styles and dark mode.

---

If any conventions or workflows are unclear, please ask for clarification or provide feedback to improve these instructions.
