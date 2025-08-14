# Design Studio - Firebase Studio Optimized

A modern design platform built with Next.js, optimized for Firebase Studio and Android app development. This application provides a comprehensive vector drawing tool with sacred geometry grids, real-time collaboration, and cloud storage capabilities.

## 🚀 Features

### Core Design Features
- **Vector Drawing**: SVG-based drawing with dots and lines
- **Sacred Geometry Grids**: Flower of Life and Diamond Scale patterns
- **Real-time Collaboration**: Multi-user design sessions
- **Cloud Storage**: Firebase-powered design persistence
- **Export Options**: SVG, PNG, and PDF export capabilities
- **Mobile Optimized**: Responsive design for Android devices

### Firebase Integration
- **Authentication**: Email/password and Google OAuth
- **Firestore Database**: Real-time design data synchronization
- **Cloud Storage**: File upload and management
- **Security Rules**: Comprehensive access control
- **Emulator Support**: Local development with Firebase emulators

### Performance Optimizations
- **Code Splitting**: Lazy loading for optimal bundle size
- **PWA Support**: Progressive Web App capabilities
- **Mobile Optimization**: Touch-friendly interface
- **Caching**: Service worker for offline support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Firebase Hosting
- **Development**: Firebase Studio

## 📱 Android Development Setup

### Prerequisites
- Node.js 20+
- Firebase CLI
- Android Studio (for native Android development)
- Firebase Studio access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd design-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase configuration**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Edit .env.local with your Firebase project details
   ```

4. **Initialize Firebase project**
   ```bash
   # Install Firebase CLI globally if not already installed
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase project
   firebase init
   ```

5. **Configure Firebase services**
   - Enable Authentication (Email/Password, Google)
   - Create Firestore database
   - Set up Cloud Storage
   - Configure security rules

### Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Start Firebase emulators**
   ```bash
   npm run firebase:emulators
   ```

3. **Access the application**
   - Web: http://localhost:9002
   - Firebase Emulator UI: http://localhost:4000

### Building for Production

1. **Build static files**
   ```bash
   npm run build:static
   ```

2. **Deploy to Firebase**
   ```bash
   # Deploy everything
   npm run firebase:deploy
   
   # Deploy specific services
   npm run firebase:deploy:hosting
   npm run firebase:deploy:firestore
   npm run firebase:deploy:storage
   ```

## 🔧 Firebase Studio Configuration

### Project Structure
```
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules          # Storage security rules
├── src/
│   ├── lib/firebase.ts    # Firebase initialization
│   ├── hooks/use-firebase.ts # Firebase hooks
│   ├── context/auth-context.tsx # Authentication context
│   └── components/auth/   # Authentication components
```

### Environment Variables
Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Security Rules
The application includes comprehensive security rules for:
- **Firestore**: User-based access control for designs, projects, and templates
- **Storage**: File upload restrictions and user-based permissions

## 📱 Android App Development

### PWA to Native App
This web application is optimized for conversion to a native Android app using:

1. **Capacitor/Cordova**: Wrap the PWA in a native container
2. **Firebase Android SDK**: Native Firebase integration
3. **Android Studio**: Native Android development environment

### Android-Specific Optimizations
- **Touch Interface**: Optimized for mobile touch interactions
- **Offline Support**: Service worker for offline functionality
- **Responsive Design**: Mobile-first responsive layout
- **Performance**: Optimized for mobile devices

### Building Android App
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init

# Add Android platform
npx cap add android

# Build and sync
npm run build:static
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Deploy to Firebase Hosting
npm run firebase:deploy:hosting
```

### Custom Domain
Configure custom domain in Firebase Console:
1. Go to Firebase Console > Hosting
2. Add custom domain
3. Update DNS records
4. Deploy with custom domain

## 🔒 Security

### Authentication
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- Protected routes

### Data Security
- User-based access control
- Secure file uploads
- Input validation
- XSS protection

## 📊 Performance Monitoring

### Core Web Vitals
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Firebase Analytics
- User engagement tracking
- Performance monitoring
- Error reporting
- Custom events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check Firebase documentation
- Review Firebase Studio guides

## 🔄 Updates

Stay updated with the latest changes:
- Follow Firebase release notes
- Monitor Next.js updates
- Check for security updates

---

**Built with ❤️ for Firebase Studio and Android Development**
