# LocationTracker

A React Native app built with Expo SDK 53 and TypeScript to track GPS locations in the background, store them locally, and display them in real-time. The app features three buttons: **Service On** to start background location tracking, **Service Off** to stop it, and **Clear Data** to remove stored locations. Locations are displayed in a `FlatList` with timestamps formatted as `MM/dd/yyyy hh:mm:ss a` (e.g., `07/07/2025 12:14:00 PM`) using `date-fns`. The background service persists even when the app is killed, with proper configuration for iOS and Android.

## Features

- **Background GPS Tracking**: Collects GPS coordinates every 10 seconds using `expo-location` and `expo-task-manager`, persisting when the app is in the background or killed.
- **Real-Time Updates**: The location list updates every 5 seconds or when the app regains focus, using `AppState` and AsyncStorage polling.
- **Formatted Timestamps**: Displays timestamps in a mobile-friendly format using `date-fns`.
- **Persistent Storage**: Stores locations (latitude, longitude, timestamp) in `@react-native-async-storage/async-storage`.
- **Cross-Platform**: Compatible with iOS and Android, with proper permission handling.
- **User Interface**: Simple UI with three buttons and a scrollable list of locations.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Version 8 or higher.
- **Expo CLI**: Installed automatically with the `expo` package. Use via `npx` (Node.js package runner).
- **Expo Go**: Install the Expo Go app on your iOS/Android device for testing.
- **Xcode** (iOS): Version 15 or higher for native builds and simulator testing.
- **Android Studio**: For Android emulator with Google Play Services support.
- **Physical Device or Simulator**: For testing GPS functionality (simulators require mock locations).

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/LocationTracker.git
   cd LocationTracker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   npx expo install --fix
   ```
   This installs:
   - `expo-location@18.0.4`
   - `expo-task-manager@12.0.3`
   - `@react-native-async-storage/async-storage@1.23.1`
   - `date-fns@3.6.0`

3. **Verify Dependencies**:
   ```bash
   npx expo-doctor@latest
   ```
   If issues are found, reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx expo install --fix
   ```

4. **Configure Permissions**:
   Ensure `app.json` includes the following for iOS and Android background location tracking:
   ```json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "NSLocationWhenInUseUsageDescription": "This app needs access to your location to track it in the foreground.",
           "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs access to your location to track it in the background.",
           "UIBackgroundModes": ["location"]
         }
       },
       "android": {
         "permissions": [
           "ACCESS_FINE_LOCATION",
           "ACCESS_COARSE_LOCATION",
           "ACCESS_BACKGROUND_LOCATION",
           "FOREGROUND_SERVICE",
           "FOREGROUND_SERVICE_LOCATION"
         ]
       }
     }
   }
   ```

## Expo CLI

Expo CLI is a development tool installed automatically with the `expo` package when you create a new project. It streamlines app development by providing commands to start, build, and manage your project. You interact with Expo CLI using `npx`, a Node.js package runner.

### Common Expo CLI Commands

| Command                    | Description                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| `npx expo start`           | Starts the development server for Expo Go or development builds.             |
| `npx expo prebuild`        | Generates native Android and iOS directories using Prebuild.                 |
| `npx expo run:android`     | Compiles and runs the native Android app locally.                            |
| `npx expo run:ios`         | Compiles and runs the native iOS app locally.                                |
| `npx expo install package-name` | Installs or validates/updates a library. Use `--fix` to resolve version issues. |
| `npx expo lint`            | Sets up or runs ESLint to lint project files.                               |

Example usage:
```bash
npx expo start
npx expo install date-fns
```

## Running the App

### Using Expo Go
1. Start the development server:
   ```bash
   npx expo start --clear
   ```
2. Scan the QR code with the Expo Go app on your iOS/Android device.
3. Grant location permissions ("Always" for iOS, "Allow all the time" for Android).

### Native Builds
For reliable background tasks, especially on iOS, create a development build.

#### Android
1. Prebuild the project:
   ```bash
   npx expo prebuild --clean
   ```
2. Run on an emulator or device:
   ```bash
   npx expo run:android
   ```
   Ensure Android Studio is set up with an emulator supporting Google Play Services.

#### iOS
1. Prebuild the project:
   ```bash
   npx expo prebuild --clean
   ```
2. Run on a simulator or device:
   ```bash
   npx expo run:ios
   ```
   Requires Xcode and an Apple Developer account for device testing. Set a custom location in the simulator (Xcode: **Debug > Location > Custom Location**).

### Production Builds
For production, create a development or production build:
```bash
eas build --profile development --platform all
```
Follow EAS documentation: [EAS Build](https://docs.expo.dev/build/setup/).

## Usage

1. **Grant Permissions**: On first run, allow location access ("Always" for iOS, "Allow all the time" for Android).
2. **Service On**: Press to start background location tracking. On iOS, a blue status bar appears; on Android, a notification is shown. Locations update every ~10 seconds.
3. **Service Off**: Press to stop tracking. The status bar/notification disappears.
4. **Clear Data**: Press to remove all stored locations from the list and AsyncStorage.
5. **Location List**: View real-time updates of locations (latitude, longitude, timestamp) in the `FlatList`. Updates occur every 5 seconds or when the app regains focus.
6. **Background Tracking**: Kill the app, wait a few minutes, and reopen. New locations appear if the service was running, with the "Service On" button disabled.

## Project Structure

- `app/index.tsx`: Main app component with UI and logic for GPS tracking, storage, and real-time updates.
- `app.json`: Configuration for permissions and platform-specific settings.
- `package.json`: Lists dependencies and scripts.
- `metro.config.js` (optional): Custom Metro bundler configuration for module resolution.

## Dependencies

- **React Native**: 0.79 (bundled with Expo SDK 53)
- **Expo SDK**: 53
- **Packages**:
  - `expo-location`: GPS access.
  - `expo-task-manager`: Background tasks.
  - `@react-native-async-storage/async-storage`: Persistent storage.
  - `date-fns`: Timestamp formatting.

## iOS Background Service

The app supports background location tracking on iOS when the app is in the background or killed, with the following configurations:
- **Permissions**: Requests "Always" location access via `Location.requestBackgroundPermissionsAsync`.
- **Background Modes**: Enabled with `"UIBackgroundModes": ["location"]	In `app.json`.
- **Indicator**: Shows a blue status bar when tracking (`showsBackgroundLocationIndicator: true`).
- **Limitations**: iOS may throttle background tasks in low-power mode or if "Always" access is denied. Use a development build (`eas build`) for reliable performance, as Expo Go has limitations.

## Troubleshooting

### `date-fns` Module Resolution Error
- **Symptom**: `UnableToResolveError: Unable to resolve module date-fns`.
- **Fix**:
  ```bash
  npm install date-fns
  npx expo start --clear
  ```
  Verify in `package.json`: `"date-fns": "^3.6.0"`.
  Update `metro.config.js` if needed:
  ```javascript
  const { getDefaultConfig } = require('expo/metro-config');
  const config = getDefaultConfig(__dirname);
  config.resolver.unstable_enablePackageExports = false;
  module.exports = config;
  ```

### iOS Background Task Issues
- **Symptom**: Background task stops when the app is killed.
- **Fix**:
  - Ensure `"UIBackgroundModes": ["location"]` is in `app.json`.
  - Verify "Always" location access in **Settings > [Your App] > Location**.
  - Use a development build:
    ```bash
    eas build --profile development --platform ios
    ```
  - Check task status:
    ```typescript
    console.log(await TaskManager.isTaskRegisteredAsync('background-location-task'));
    ```

### Android Background Task Issues
- **Symptom**: Task stops due to battery optimization.
- **Fix**:
  - Verify `ACCESS_BACKGROUND_LOCATION` in `android/app/src/main/AndroidManifest.xml`.
  - Disable battery optimization: **Settings > Apps > [Your App] > Battery > Battery Optimization > Don’t Optimize**.
  - Rebuild:
    ```bash
    npx expo prebuild --clean
    npx expo run:android
    ```

### No Locations in List
- **Symptom**: `FlatList` is empty or not updating.
- **Fix**:
  - Ensure GPS is enabled on the device/simulator.
  - Set a mock location in the simulator (Xcode: **Debug > Location > Custom Location**; Android Studio: Extended Controls > Location).
  - Check AsyncStorage:
    ```typescript
    console.log(await AsyncStorage.getItem('locations'));
    ```
  - Verify the 5-second polling interval in `app/index.tsx`.

### Native Build Issues
- **Fix**:
  - Re-run prebuild:
    ```bash
    npx expo prebuild --clean
    ```
  - Verify `Info.plist` (iOS) or `AndroidManifest.xml` (Android) for permissions.
  - Ensure Xcode (iOS) or Android Studio (Android) is configured.

## Limitations

- **iOS**: Background tasks may be throttled in low-power mode or if "Always" location access is denied. Expo Go has limited support; use a development build.
- **Android**: Battery optimization may limit background tasks. Users must manually exempt the app.
- **Polling**: The 5-second polling interval may impact battery life. Adjust in `app/index.tsx` (e.g., `setInterval(loadStoredLocations, 10000)`).
- **Simulator Testing**: Requires mock locations for GPS data.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contact

For issues or questions, open an issue on GitHub or contact [your-email@example.com].