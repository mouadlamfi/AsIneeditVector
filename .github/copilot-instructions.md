# Copilot Instructions for Firebase Studio

## Repository Overview

This is **Firebase Studio**, a Next.js-based vector drawing application called "As I Need It Draw". It's a sophisticated design platform that allows users to create garment designs with drag-and-drop functionality, real-time measurements, and AI-powered suggestions.

**Project Type**: Next.js 15.3.3 web application with TypeScript
**Size**: Medium-sized repository (~36KB main canvas component, 1088 lines)
**Languages**: TypeScript, JavaScript, CSS
**Frameworks**: Next.js 15.3.3, React 18.3.1, Tailwind CSS
**Key Dependencies**: Radix UI components, Lucide React icons, Firebase, Genkit AI, jsPDF, html2canvas

## Build and Development Instructions

### Prerequisites
- Node.js (version 18+ recommended)
- npm (comes with Node.js)

### Environment Setup
1. **Always run `npm install` first** - This installs all dependencies including heavy packages like jsPDF and html2canvas
2. **No environment variables required** - The app works without .env files
3. **Port 9002** - Development server runs on port 9002 (not default 3000)

### Build Commands (Validated Working Sequence)

#### Development
```bash
npm install                    # Always run first
npm run dev                    # Starts dev server on http://localhost:9002
```

#### Production Build
```bash
npm install                    # Always run first
npm run build                  # Creates optimized production build
npm start                      # Serves production build
```

#### Code Quality
```bash
npm run typecheck              # TypeScript type checking (fast, ~2s)
npm run lint                   # ESLint checking (may timeout, use typecheck instead)
```

#### AI Development (Optional)
```bash
npm run genkit:dev            # Starts Genkit AI development server
npm run genkit:watch          # Starts Genkit with file watching
```

### Build Validation Results
- ✅ `npm install` - Works correctly, installs 788 packages
- ✅ `npm run build` - Successful compilation in 6.0s, generates 159kB bundle
- ✅ `npm run typecheck` - Passes TypeScript validation
- ⚠️ `npm run lint` - May timeout, use typecheck for faster validation
- ✅ `npm run dev` - Starts development server on port 9002

### Performance Optimizations
- Bundle size optimized: 159kB First Load JS (50% reduction from original)
- Lazy loading for heavy libraries (jsPDF, html2canvas)
- Mobile-optimized touch handling
- GPU-accelerated SVG rendering

## Project Architecture

### Directory Structure
```
src/
├── app/                      # Next.js app router
│   ├── layout.tsx           # Root layout with dark theme
│   ├── page.tsx             # Main application entry point
│   └── globals.css          # Global styles with CSS variables
├── components/              # React components
│   ├── garment-canvas.tsx   # Main canvas (36KB, 1088 lines)
│   ├── collapsible-menu.tsx # Tools panel (14KB, 386 lines)
│   ├── ui/                  # Reusable UI components (Radix UI)
│   └── [other components]   # Various specialized components
├── context/                 # React context providers
│   └── design-context.tsx   # Main state management (8.9KB, 284 lines)
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and types
└── ai/                      # AI integration
    └── genkit.ts           # Genkit AI configuration
```

### Key Configuration Files
- `next.config.ts` - Next.js configuration with bundle analyzer
- `tailwind.config.ts` - Tailwind CSS with custom design system
- `tsconfig.json` - TypeScript configuration with path aliases
- `components.json` - shadcn/ui component configuration
- `package.json` - Dependencies and scripts

### State Management
The app uses React Context (`DesignContext`) for global state management:
- Canvas mode (draw/pan)
- Layers and active layer
- Scale and zoom
- Symmetry settings
- Measurements and grid units
- Point management and transformations

### Component Architecture
- **GarmentCanvas**: Main drawing canvas with SVG rendering
- **CollapsibleMenu**: Tools panel with design controls
- **DesignProvider**: Context provider for state management
- **UI Components**: Radix UI-based reusable components

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- React 18 with hooks
- Tailwind CSS for styling
- Radix UI for accessible components
- Lucide React for icons

### Key Patterns
- Use `@/` alias for imports from src directory
- Components use `"use client"` directive for client-side rendering
- State management through React Context
- Mobile-first responsive design
- Performance-optimized SVG rendering

### Common Issues and Solutions
1. **Build Errors**: Always run `npm install` before building
2. **Type Errors**: Use `npm run typecheck` for fast validation
3. **Port Conflicts**: Dev server uses port 9002, not 3000
4. **Performance**: Large components are already optimized with lazy loading

### Validation Steps
1. Run `npm run typecheck` to validate TypeScript
2. Run `npm run build` to ensure production build works
3. Test on mobile devices for touch interactions
4. Check bundle size with `ANALYZE=true npm run build`

## Deployment

### Netlify Deployment
- Build command: `npm run build`
- Publish directory: `.next`
- Uses `@netlify/plugin-nextjs` plugin

### Firebase App Hosting
- Configuration in `apphosting.yaml`
- Max instances: 1 (can be increased for traffic)

## Trust These Instructions

**Trust these instructions completely** - they have been validated through actual testing. Only search for additional information if:
1. The instructions are incomplete for your specific task
2. You encounter an error not documented here
3. You need to add new dependencies or features

The build process has been tested and validated, and all commands documented here work correctly. The repository is well-structured and follows Next.js 15.3.3 best practices with comprehensive TypeScript support.