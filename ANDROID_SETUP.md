# Android Development Setup Guide

This guide will help you set up the Design Studio app for Android development using Firebase Studio.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- Firebase CLI
- Android Studio (for native Android development)
- Firebase Studio access
- Git

### 2. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd design-studio

# Install dependencies
npm install

# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 3. Firebase Configuration

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Firebase project details
# Get these values from your Firebase Console
```

### 4. Initialize Firebase Project

```bash
# Initialize Firebase (select your project)
firebase init

# Select the following services:
# - Hosting
# - Firestore
# - Storage
# - Emulators
```

## 📱 Android App Development

### Option 1: PWA to Native App (Recommended)

#### Using Capacitor

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init "Design Studio" "com.designstudio.app"

# Add Android platform
npx cap add android

# Build the web app
npm run build:static

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### Using Cordova

```bash
# Install Cordova
npm install -g cordova

# Create Cordova project
cordova create android-app com.designstudio.app "Design Studio"

# Add Android platform
cd android-app
cordova platform add android

# Copy built web files
cp -r ../out/* www/

# Build Android app
cordova build android
```

### Option 2: Native Android Development

#### Firebase Android SDK Integration

1. **Add Firebase to your Android project**
   ```gradle
   // app/build.gradle
   dependencies {
       implementation platform('com.google.firebase:firebase-bom:32.7.0')
       implementation 'com.google.firebase:firebase-auth'
       implementation 'com.google.firebase:firebase-firestore'
       implementation 'com.google.firebase:firebase-storage'
       implementation 'com.google.firebase:firebase-analytics'
   }
   ```

2. **Initialize Firebase in your Android app**
   ```kotlin
   // MainActivity.kt
   import com.google.firebase.FirebaseApp
   
   class MainActivity : AppCompatActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           FirebaseApp.initializeApp(this)
           // Load your web app or implement native UI
       }
   }
   ```

## 🔧 Development Workflow

### 1. Start Development Environment

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Firebase emulators
npm run firebase:emulators
```

### 2. Access Development Tools

- **Web App**: http://localhost:9002
- **Firebase Emulator UI**: http://localhost:4000
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Storage Emulator**: http://localhost:9199

### 3. Testing on Android Device

```bash
# For Capacitor
npx cap run android

# For Cordova
cordova run android

# For native Android
# Use Android Studio to run on device/emulator
```

## 📦 Building for Production

### 1. Web Build

```bash
# Build static files
npm run build:static

# Deploy to Firebase Hosting
npm run firebase:deploy:hosting
```

### 2. Android Build

#### Capacitor
```bash
# Build web app
npm run build:static

# Sync with Android
npx cap sync android

# Build APK in Android Studio
# Or use command line:
npx cap build android
```

#### Cordova
```bash
# Build for production
cordova build android --release

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name
```

## 🔒 Security Configuration

### 1. Firebase Security Rules

The app includes comprehensive security rules:

- **Firestore**: User-based access control
- **Storage**: File upload restrictions
- **Auth**: Email/password and Google OAuth

### 2. Android Permissions

Add required permissions to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 📊 Performance Optimization

### 1. Web Performance
- Code splitting and lazy loading
- PWA capabilities
- Service worker caching
- Bundle size optimization

### 2. Android Performance
- Native WebView optimization
- Offline support
- Touch interface optimization
- Memory management

## 🧪 Testing

### 1. Unit Tests
```bash
npm test
```

### 2. Integration Tests
```bash
npm run test:integration
```

### 3. E2E Tests
```bash
npm run test:e2e
```

### 4. Android Testing
```bash
# Run Android tests
npx cap run android --target=test

# Or use Android Studio test runner
```

## 🚀 Deployment

### 1. Firebase Hosting
```bash
npm run firebase:deploy
```

### 2. Google Play Store
1. Build signed APK/AAB
2. Create Play Console account
3. Upload app bundle
4. Configure store listing
5. Submit for review

### 3. Internal Testing
```bash
# Build for internal testing
npx cap build android --release
```

## 🔧 Troubleshooting

### Common Issues

1. **Firebase initialization fails**
   - Check environment variables
   - Verify Firebase project configuration
   - Ensure emulators are running

2. **Android build fails**
   - Update Android SDK
   - Check Gradle version compatibility
   - Verify signing configuration

3. **Performance issues**
   - Enable bundle analyzer: `npm run analyze`
   - Check Firebase performance monitoring
   - Optimize images and assets

### Debug Commands

```bash
# Check Firebase configuration
firebase projects:list

# Test Firebase connection
firebase emulators:start --only auth,firestore,storage

# Analyze bundle size
npm run analyze

# Check TypeScript errors
npm run typecheck
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Studio Guide](https://firebase.google.com/docs/studio)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Create an issue in the repository
4. Contact the development team

---

**Happy Android Development! 🎉**