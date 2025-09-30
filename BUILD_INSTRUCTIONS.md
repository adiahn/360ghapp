# Building APK for 360gh App

## Prerequisites
1. **Java Development Kit (JDK) 11 or higher** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
2. **Android Studio** - Download from [Android Studio](https://developer.android.com/studio)
3. **Android SDK** - Install through Android Studio

## Method 1: Using EAS Build (Recommended)

### Step 1: Install EAS CLI globally
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Initialize EAS project
```bash
eas init
```
- Answer "Y" when prompted to create a project for @adiahn/360gh-app

### Step 4: Build APK
```bash
eas build --platform android --profile preview
```

### Step 5: Download APK
- The build will be processed in the cloud
- You'll get a download link when complete
- Download the APK file to your computer

## Method 2: Local Build (Requires Android Studio)

### Step 1: Set up Android Studio
1. Install Android Studio
2. Install Android SDK (API level 33 or higher)
3. Set JAVA_HOME environment variable to your JDK installation

### Step 2: Build APK locally
```bash
# Navigate to android directory
cd android

# Build release APK
./gradlew assembleRelease
```

### Step 3: Find APK
The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Method 3: Using Expo Web Build

1. Go to [Expo Build Service](https://expo.dev/build)
2. Sign in with your Expo account
3. Create a new build
4. Select Android platform
5. Choose "APK" as build type
6. Upload your project or connect your GitHub repository

## Current App Features
- ✅ Biometric Authentication (Face ID on iOS, Biometrics on Android)
- ✅ Memo Management System
- ✅ Contact Management
- ✅ Action Modals with Security
- ✅ Settings Screen
- ✅ Cross-platform Support

## Troubleshooting

### If EAS build fails:
1. Make sure you're logged in: `eas whoami`
2. Check your app.json configuration
3. Ensure all dependencies are installed: `npm install`

### If local build fails:
1. Check JAVA_HOME is set correctly
2. Ensure Android SDK is installed
3. Run `npx expo prebuild --platform android` first

## Next Steps
1. Test the APK on an Android device
2. Install the APK on your device
3. Test biometric authentication functionality
4. Verify all memo actions work correctly
