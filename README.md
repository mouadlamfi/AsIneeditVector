# As I Need It - Design & Geometry Platform

A unified platform combining an immersive homepage with a professional Flower of Life design tool, optimized for performance and deployed on Netlify.

## 🚀 Features

### Homepage (`/`)
- **Platonic Solid Animation**: Optimized Three.js octahedron with explosion effect
- **Smooth Transitions**: WebGL-powered page transitions
- **Performance Optimized**: 60fps animation with GPU acceleration
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Art App (`/art`)
- **Flower of Life Design Tool**: Professional vector drawing with sacred geometry
- **Multi-Format Export**: SVG, PNG, PDF, JPG with custom settings
- **Live Measurements**: Real-time distance and angle calculations
- **Touch Optimized**: Perfect for iPad with Apple Pencil
- **Modern Color Picker**: Advanced HSL/RGB color selection

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 with TypeScript
- **3D Graphics**: Three.js for homepage animation
- **UI Components**: Radix UI with Tailwind CSS
- **Performance**: Optimized rendering with viewport culling
- **Deployment**: Netlify with static export

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/asineedit.com.git
cd asineedit.com

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Building
npm run build            # Production build
npm run build:static     # Static export for Netlify
npm run build:analyze    # Bundle analysis

# Performance
npm run test:performance # Lighthouse performance test
npm run clean           # Clean build artifacts
```

## 🌐 Deployment

### Netlify Deployment

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `out`
   - Node Version: `18`
3. **Environment Variables**: Set any required environment variables
4. **Deploy**: Netlify will automatically build and deploy

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=out
```

## ⚡ Performance Optimizations

### Homepage Animation
- **Frame Limiting**: 60fps animation with throttling
- **GPU Acceleration**: Optimized WebGL rendering
- **Memory Management**: Proper Three.js resource cleanup
- **Responsive Design**: Adaptive rendering for all devices

### Flower of Life Canvas
- **Viewport Culling**: Only render visible elements
- **Performance Limits**: Maximum element counts for smooth rendering
- **Optimized Geometry**: Efficient SVG generation
- **Touch Optimization**: Smooth touch interactions

### General Optimizations
- **Lazy Loading**: Heavy libraries loaded on demand
- **Bundle Splitting**: Optimized code splitting
- **Asset Optimization**: Compressed images and fonts
- **Caching**: Aggressive caching for static assets

## 🎯 Performance Targets

- **Lighthouse Score**: 90+ across all metrics
- **Load Time**: < 3 seconds on 3G
- **Animation**: 60fps smooth performance
- **Memory Usage**: < 100MB for typical usage

## 🔧 Configuration

### Environment Variables

```env
# Development
NODE_ENV=development
NEXT_PUBLIC_USE_EMULATORS=true

# Production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://asineedit.com
```

### Netlify Configuration

The `netlify.toml` file includes:
- Build settings and environment variables
- Redirect rules for SPA routing
- Security headers
- Cache optimization

## 📱 Browser Support

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Tablet**: iPad Safari, Android Chrome

## 🐛 Debugging

### Performance Monitoring
- FPS counter in development mode
- Core Web Vitals tracking
- Memory usage monitoring
- Network performance analysis

### Common Issues
1. **Low FPS**: Check for excessive SVG elements
2. **Memory Leaks**: Ensure proper cleanup in useEffect
3. **Export Issues**: Verify canvas element availability
4. **Touch Problems**: Test on actual touch devices

## 🎨 Creative Direction

The platform provides a unified creative experience:
- **Homepage**: Cosmic portal into the brand's universe
- **Art App**: Deep, immersive design tool
- **Seamless Flow**: Natural transition from discovery to creation

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@asineedit.com
- Documentation: https://docs.asineedit.com
