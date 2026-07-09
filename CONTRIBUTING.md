# Contributing to AdmitFlow

We love contributions! Here's how you can help make AdmitFlow better.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/admission-hq.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start developing: `npm run dev`

## 📋 Contribution Guidelines

### Reporting Issues

- Check existing issues before creating a new one
- Include clear steps to reproduce
- Mention browser and OS version
- Include screenshots if applicable

### Feature Requests

- Describe the problem you're solving
- Explain how the feature helps students
- Keep scope focused and practical

### Code Contributions

- **Keep it simple** — AdmitFlow values simplicity and clarity
- **TypeScript** — All code must be typed
- **No comments** — Write self-documenting code with clear variable/function names
- **Tailwind CSS** — Use Tailwind utility classes, avoid custom CSS
- **Responsive** — Ensure changes work on mobile and desktop
- **Dark mode** — All components must support dark mode via `dark:` variants

### Adding a New College

1. Add college data in `src/data/colleges.ts`
2. Add college timeline in the same file
3. Add sample notices in `src/data/notices.ts`
4. Add to the supported colleges list in `src/app/page.tsx`
5. Add to the README supported colleges table

### Code Style

- Use functional components with hooks
- Use `"use client"` for client components
- Import types from `@/types`
- Import data from `@/data/*`
- Use `@/lib/utils` for utility functions
- Use `@/lib/store` for localStorage operations

### Pull Request Process

1. Update relevant documentation if needed
2. Make sure `npm run build` succeeds
3. Keep PRs focused on a single feature/fix
4. Reference any related issues in the PR description

## 🧪 Adding Seed Data

Colleges are defined in `src/data/colleges.ts` with full profiles including courses, fees, and eligibility.

Notices are in `src/data/notices.ts` with all metadata, AI summaries, and related notice links.

To add realistic data, check the actual college websites for current admission notices.

## 📦 Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components
├── data/         # College and notice seed data
├── types/        # TypeScript interfaces
├── lib/          # Utilities and state management
└── hooks/        # Custom React hooks
```

## 💬 Questions?

Open a discussion or issue on GitHub. We're happy to help!

Thank you for contributing to AdmitFlow! 🎓
