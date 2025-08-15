# Copilot Instructions for Firebase Studio - As I Need It Draw

## High-Level Repository Information

**Repository Purpose**: This is a Next.js-based vector drawing application called "As I Need It Draw" - a personal vector drawing tool for garment design and pattern creation. The app provides a canvas-based interface where users can draw, manipulate, and export vector designs with real-time measurements and AI-powered suggestions.

**Project Type**: Next.js 15.3.3 web application with TypeScript, React 18, and Tailwind CSS
**Languages**: TypeScript, JavaScript, CSS
**Frameworks**: Next.js, React, Tailwind CSS, Radix UI
**Key Dependencies**: 
- Next.js 15.3.3 with Turbopack
- React 18.3.1
- TypeScript 5.9.2
- Tailwind CSS 3.4.1
- Radix UI components
- Genkit AI integration
- Firebase hosting support

**Repository Size**: Medium-sized project (~36KB main component, 159KB First Load JS)

## Build and Validation Instructions

### Prerequisites
- Node.js (version 18+ recommended)
- npm package manager

### Bootstrap (First Time Setup)
```bash
# Always run this first when cloning the repository
npm install
```

### Build Process
```bash
# Type checking (always run before building)
npm run typecheck

# Production build
npm run build

# Development server (runs on port 9002)
npm run dev
```

### Validation Steps
```bash
# Linting (may timeout in some environments)
npm run lint

# Type checking (required before any build)
npm run typecheck

# Build validation
npm run build
```

### Development Workflow
1. **Always run `npm install` first** when setting up the environment
2. **Always run `npm run typecheck`** before building to catch TypeScript errors
3. **Use `npm run dev`** for development (starts on http://localhost:9002)
4. **Use `npm run build`** to validate production builds

### Known Issues and Workarounds
- **TypeScript Errors**: The project had missing `canvasMode` and `setCanvasMode` properties in the design context. These have been fixed by adding them to `src/context/design-context.tsx`
- **Lint Timeout**: The lint command may timeout in some environments - this is normal and doesn't affect functionality
- **Port Configuration**: Development server runs on port 9002 (not the default 3000)

### Performance Optimizations
- Bundle size optimized to 159KB First Load JS (50% reduction from original)
- Lazy loading implemented for heavy libraries (jsPDF, html2canvas)
- Mobile-optimized touch handling and responsive design
- GPU acceleration for animations and SVG rendering

## Project Layout and Architecture

### Key Directories
```
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application entry point
│   └── globals.css        # Global styles and CSS variables
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI)
│   ├── garment-canvas.tsx # Main drawing canvas (36KB, 1088 lines)
│   ├── collapsible-menu.tsx # Tools panel (14KB, 386 lines)
│   └── modern-color-picker.tsx # Color selection (15KB, 504 lines)
├── context/              # React context providers
│   └── design-context.tsx # Main state management (8.9KB, 284 lines)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and types
└── ai/                   # AI integration (Genkit)
```

### Configuration Files
- `next.config.ts` - Next.js configuration with bundle analyzer
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `tsconfig.json` - TypeScript configuration with path aliases
- `components.json` - shadcn/ui component configuration
- `package.json` - Dependencies and scripts

### Key Source Files
- **Main Entry**: `src/app/page.tsx` - Renders the main application with DesignProvider
- **State Management**: `src/context/design-context.tsx` - Contains all application state including layers, canvas mode, measurements
- **Canvas Component**: `src/components/garment-canvas.tsx` - Main drawing interface with SVG rendering
- **Tools Panel**: `src/components/collapsible-menu.tsx` - Collapsible tools menu for drawing controls

### Design Context State
The main state is managed in `src/context/design-context.tsx` and includes:
- `layers`: Array of drawing layers with points, colors, stroke widths
- `canvasMode`: 'draw' | 'pan' - current canvas interaction mode
- `scale`: Zoom level for the canvas
- `isSymmetryEnabled`: Boolean for symmetry drawing
- `measurement`: Current measurement data
- `gridUnit`: Measurement unit ('inch', 'cm', etc.)

### Validation Pipeline
1. **TypeScript Checking**: `npm run typecheck` - Validates all TypeScript types
2. **Build Process**: `npm run build` - Creates optimized production build
3. **Linting**: `npm run lint` - Code style validation (may timeout)

### Dependencies
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **AI Integration**: Genkit with Google AI (Gemini 2.0 Flash)
- **Export**: jsPDF and html2canvas for PDF/image export
- **Icons**: Lucide React icons
- **Forms**: React Hook Form with Zod validation

## Development Guidelines

### Component Development
- Use TypeScript for all components
- Follow the existing pattern of using the design context for state
- Implement proper memoization with React.memo for expensive components
- Use the existing UI components from `src/components/ui/`

### State Management
- All application state should be managed through the design context
- Add new state properties to the `DesignContextState` interface
- Use the `useDesign()` hook to access state in components

### Styling
- Use Tailwind CSS classes with the custom design system
- Follow the existing color scheme (light sky blue primary, light blue-gray background)
- Use the Inter font family for all text

### Performance Considerations
- The app is optimized for mobile devices with touch handling
- Bundle size is critical - use lazy loading for heavy dependencies
- SVG rendering is optimized with viewport culling
- Follow the performance guidelines in `src/README-PERFORMANCE.md`

### File Structure
- Keep components in `src/components/`
- Add new hooks to `src/hooks/`
- Utility functions go in `src/lib/`
- Types are defined in `src/lib/types.ts`

## Trust These Instructions

**IMPORTANT**: Trust these instructions and only perform searches if the information is incomplete or found to be in error. The build process, file structure, and development workflow described here have been validated and tested.

### When to Search
- Only search if you need to understand a specific component's implementation details
- Only search if you encounter errors not covered in these instructions
- Only search if you need to find specific functionality not documented here

### Quick Reference Commands
```bash
npm install          # Install dependencies
npm run typecheck    # Type checking
npm run build        # Production build
npm run dev          # Development server (port 9002)
```

The application is a sophisticated vector drawing tool with real-time measurements, AI integration, and mobile optimization. Follow the established patterns and use the design context for all state management.