# Building APK Without EAS

This guide will help you build an APK for your Collab Drive app without using Expo Application Services (EAS).

## Prerequisites

Before you start, make sure you have:

1. **Java Development Kit (JDK)** - Version 17 or higher
   - Check if installed: `java -version`
   - Install via Homebrew: `brew install openjdk@17`
   - After installation, add to your shell profile (~/.zshrc):
     ```bash
     export JAVA_HOME=$(/usr/libexec/java_home -v 17)
     export PATH=$JAVA_HOME/bin:$PATH
     ```

2. **Android Studio** (optional but recommended for SDK management)
   - Download from: https://developer.android.com/studio
   - Or install via Homebrew: `brew install --cask android-studio`

3. **Android SDK** and tools
   - If using Android Studio, install via SDK Manager
   - Required components:
     - Android SDK Platform 34 (or the latest)
     - Android SDK Build-Tools
     - Android SDK Command-line Tools
     - Android SDK Platform-Tools

4. **Environment Variables** - Add to your `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

## Step-by-Step Build Process

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate Native Android Project

This command will create the `android/` folder with all necessary native code:

```bash
pnpm run prebuild:android
```

**Note:** If you already have an `android/` folder, this will clean and regenerate it.

### 3. Build Debug APK (for testing)

```bash
pnpm run build:apk:debug
```

The debug APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Build Release APK (for distribution)

For a release build, you'll need to sign the APK. First, create a keystore:

#### Generate a Keystore (one-time setup)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore collab-drive.keystore -alias collab-drive-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save the keystore file and remember the passwords you set!

#### Configure Signing

Create a file `android/gradle.properties` (or add to existing) with:

```properties
MYAPP_UPLOAD_STORE_FILE=collab-drive.keystore
MYAPP_UPLOAD_KEY_ALIAS=collab-drive-key
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Move your keystore file to: `android/app/collab-drive.keystore`

#### Update build.gradle

Edit `android/app/build.gradle` and add before the `android` block:

```gradle
def keystorePropertiesFile = rootProject.file("gradle.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Then inside the `android` block, add:

```gradle
signingConfigs {
    release {
        if (keystoreProperties['MYAPP_UPLOAD_STORE_FILE']) {
            storeFile file(keystoreProperties['MYAPP_UPLOAD_STORE_FILE'])
            storePassword keystoreProperties['MYAPP_UPLOAD_STORE_PASSWORD']
            keyAlias keystoreProperties['MYAPP_UPLOAD_KEY_ALIAS']
            keyPassword keystoreProperties['MYAPP_UPLOAD_KEY_PASSWORD']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... other release configs
    }
}
```

#### Build the Release APK

```bash
pnpm run build:apk
```

The release APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installing the APK

### On a Physical Device

1. Enable USB debugging on your Android device
2. Connect via USB
3. Install using:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

### Via File Transfer

Simply copy the APK file to your device and open it to install (you may need to enable "Install from Unknown Sources" in your device settings).

## Troubleshooting

### Common Issues

1. **"JAVA_HOME is not set"**
   - Make sure you've exported JAVA_HOME in your shell profile
   - Restart your terminal after adding the environment variable

2. **"SDK location not found"**
   - Ensure ANDROID_HOME is set correctly
   - Create `android/local.properties` with:
     ```properties
     sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
     ```

3. **"Unable to locate adb"**
   - Make sure Android SDK Platform-Tools are installed
   - Verify your PATH includes `$ANDROID_HOME/platform-tools`

4. **"Failed to install the app"**
   - Make sure your device has USB debugging enabled
   - Try: `adb devices` to see if your device is recognized

5. **Build fails with native module errors**
   - Run `pnpm run prebuild:android` again to regenerate native code
   - Clean the build: `cd android && ./gradlew clean && cd ..`

### Starting Fresh

If you encounter issues, you can always start over:

```bash
# Remove the android folder
rm -rf android

# Regenerate
pnpm run prebuild:android

# Build again
pnpm run build:apk:debug
```

## Additional Commands

- **Clean build**: `cd android && ./gradlew clean && cd ..`
- **List devices**: `adb devices`
- **View logs**: `adb logcat`
- **Uninstall app**: `adb uninstall com.caiorosadev.collabdrive`

## Notes

- The debug APK is not optimized and is larger in size
- The release APK is minified and optimized for distribution
- Always keep your keystore file safe and backed up - you'll need it for app updates!
- The generated `android/` folder should not be committed to git (it's already in .gitignore)

## Next Steps

After successfully building your APK, you can:
- Test it on multiple devices
- Share it with beta testers
- Eventually publish to Google Play Store (which would require additional setup)



