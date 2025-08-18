# GitHub Copilot Instructions for "As I NEED it" Design Platform

## Repository Overview

**Project**: "As I NEED it" - A vector drawing tool for garment design and component composition
**Type**: Next.js 15.3.3 application with TypeScript 5.9.2
**Size**: Medium-scale React application (~150+ TypeScript/TSX files)
**Purpose**: Canvas-based drag-and-drop garment design platform with AI-powered suggestions

### Key Technologies
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components, Inter font family
- **State Management**: React Context (DesignProvider)
- **AI Integration**: Google Genkit for garment suggestions
- **Performance**: Optimized for mobile with 50% bundle size reduction (159kB first load)
- **Deployment**: Firebase App Hosting + Netlify support

## Build & Development Instructions

### Prerequisites
- Node.js v22.16.0+ (tested with v22.16.0)
- npm 10.9.2+ (npm 11.5.2 recommended)

### Essential Commands (ALWAYS run in this order)

1. **Install Dependencies** (ALWAYS run first):
   ```bash
   npm install
   ```
   ⚠️ **Note**: Expect deprecation warnings for rimraf@2.7.1, inflight@1.0.6, and glob@7.2.3. These are safe to ignore.

2. **Development Server**:
   ```bash
   npm run dev
   ```
   - Runs on port 9002 with Turbopack
   - Uses `--turbopack` flag for faster builds

3. **Type Checking** (run before commits):
   ```bash
   npm run typecheck
   ```
   ⚠️ **Known Issue**: Currently fails with missing `canvasMode` and `setCanvasMode` properties in `DesignContextState` interface.

4. **Linting** (setup required):
   ```bash
   npm run lint
   ```
   ⚠️ **Issue**: ESLint not configured - will prompt for setup on first run.

5. **Production Build**:
   ```bash
   npm run build
   ```

6. **Production Server**:
   ```bash
   npm run start
   ```

### AI Development Commands
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with file watching

### Bundle Analysis
```bash
ANALYZE=true npm run build
```
Generates bundle size analysis reports.

## Known Issues & Workarounds

### TypeScript Compilation Errors
**Problem**: `canvasMode` and `setCanvasMode` missing from `DesignContextState`
**Location**: `src/components/collapsible-menu.tsx:60-61`
**Workaround**: Add these properties to the interface in `src/context/design-context.tsx`

### ESLint Configuration
**Problem**: No ESLint configuration present
**Solution**: Run `npm run lint` and follow setup prompts, or add `.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals"]
}
```

### Security Vulnerabilities
- 8 npm audit issues (5 low, 2 moderate, 1 high)
- Run `npm audit fix` for safe fixes
- Review `npm audit` output before using `--force`

## Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with performance optimizations
│   ├── layout.tsx         # Root layout with Inter font
│   └── page.tsx          # Main application entry point
├── components/            # React components
│   ├── ui/               # shadcn/ui components (35+ components)
│   ├── garment-canvas.tsx # Main drawing canvas (1088 lines)
│   ├── collapsible-menu.tsx # Tools sidebar
│   ├── export-menu.tsx   # PDF/image export functionality
│   └── performance-monitor.tsx # Dev-mode performance tracking
├── context/
│   └── design-context.tsx # Global state management
├── hooks/                 # Custom React hooks
│   ├── use-mobile-optimization.ts # Mobile performance
│   ├── use-pdf-export.ts  # Lazy-loaded PDF export
│   └── use-toast.ts      # Toast notifications
├── lib/                  # Utilities
│   ├── performance.ts    # Performance optimization utilities
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # General utilities (cn function)
└── ai/
    └── genkit.ts        # AI integration setup
```

### Configuration Files
- `next.config.ts` - Next.js config with bundle analyzer and optimizations
- `tailwind.config.ts` - Tailwind CSS with custom theme and design tokens
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*`)
- `components.json` - shadcn/ui configuration
- `apphosting.yaml` - Firebase App Hosting config (maxInstances: 1)
- `netlify.toml` - Netlify deployment config

### Key Features & Components
1. **Canvas System**: SVG-based drawing with layers, points, and transformations
2. **Mobile Optimization**: Touch-optimized with hardware acceleration
3. **Export System**: Lazy-loaded PDF and image export (html2canvas + jsPDF)
4. **Performance Monitoring**: Real-time FPS and memory tracking in development
5. **Design Context**: Centralized state for layers, measurements, and tools

### Style Guidelines (from blueprint)
- Primary: Light sky blue (#87CEEB)
- Background: Very light blue-gray (#F0F8FF)
- Accent: Soft lavender (#E6E6FA)
- Font: Inter (body and headlines)
- Design: Line-based icons, gentle animations

## Deployment & CI/CD

### Deployment Targets
1. **Firebase App Hosting** (primary)
   - Configuration: `apphosting.yaml`
   - Max instances: 1

2. **Netlify** (alternative)
   - Configuration: `netlify.toml`
   - Build command: `npm run build`
   - Publish directory: `.next`

### No GitHub Actions
⚠️ **Important**: This repository has NO GitHub Actions or CI/CD workflows. All validation must be run manually.

## Development Guidelines

### Performance Priorities
- Bundle size is critical (current: 159kB, was 317kB)
- Mobile performance is essential
- Use lazy loading for heavy libraries (PDF, Canvas)
- Implement proper React memoization
- Monitor bundle changes with `ANALYZE=true npm run build`

### Code Patterns
- Use `@/*` path aliases for imports
- Follow shadcn/ui component patterns
- Implement proper TypeScript interfaces
- Use React Context for global state
- Prefer functional components with hooks

### Mobile Considerations
- Test on actual devices, not just browser dev tools
- Ensure 44px minimum touch targets
- Use `use-mobile-optimization.ts` hook
- Implement touch-friendly UI patterns

### Common Gotchas
1. **TypeScript Strict Mode**: Repository uses strict TypeScript - all types must be properly defined
2. **Missing Properties**: Check `DesignContextState` interface when adding new canvas features
3. **Import Paths**: Always use `@/*` aliases, not relative paths
4. **Performance**: Heavy libraries (jsPDF, html2canvas) should be dynamically imported
5. **ESLint**: Not configured - may need setup on first lint run

## File Locations Quick Reference

### Critical Files
- Main app: `src/app/page.tsx`
- Canvas: `src/components/garment-canvas.tsx`
- State: `src/context/design-context.tsx`
- Types: `src/lib/types.ts`
- Styles: `src/app/globals.css`

### Configuration
- Next.js: `next.config.ts`
- TypeScript: `tsconfig.json`
- Tailwind: `tailwind.config.ts`
- shadcn/ui: `components.json`

### Performance Docs
- Optimization guide: `src/README-PERFORMANCE.md`
- Performance utilities: `src/lib/performance.ts`

## Trust These Instructions

These instructions are comprehensive and tested. Only search for additional information if:
1. The instructions are incomplete for your specific task
2. You encounter errors not documented here
3. The instructions appear outdated or incorrect

When in doubt, prioritize the established patterns in this codebase over external examples.