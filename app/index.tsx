import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Button, FlatList, StyleSheet, Text, View } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the location data type
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };
      try {
        const storedLocations = await AsyncStorage.getItem('locations');
        const locationsArray: LocationData[] = storedLocations ? JSON.parse(storedLocations) : [];
        locationsArray.push(newLocation);
        await AsyncStorage.setItem('locations', JSON.stringify(locationsArray));
      } catch (e) {
        console.error('Error storing location:', e);
      }
    }
  }
});

export default function HomeScreen() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isServiceRunning, setIsServiceRunning] = useState<boolean>(false);
  const appState = useRef(AppState.currentState);

  // Request permissions and load stored locations on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Foreground location permission is required.');
          return;
        }
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Background location permission is required.');
          return;
        }
        await loadStoredLocations();
        // Check if the background task is already running
        const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        setIsServiceRunning(isTaskRegistered);
      } catch (e) {
        console.error('Error in useEffect:', e);
        Alert.alert('Error', 'Failed to initialize app.');
      }
    })();

    // Set up real-time updates with interval and AppState
    const intervalId = setInterval(loadStoredLocations, 5000); // Check every 5 seconds
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  // Handle app state changes to refresh locations when app is active
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      await loadStoredLocations();
    }
    appState.current = nextAppState;
  };

  // Load stored locations from AsyncStorage
  const loadStoredLocations = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('locations');
      if (storedLocations) {
        setLocations(JSON.parse(storedLocations));
      }
    } catch (e) {
      console.error('Error loading locations:', e);
      Alert.alert('Error', 'Failed to load locations.');
    }
  };

  // Start background location service
  const startLocationService = async () => {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isTaskRegistered) {
        Alert.alert('Service Already Running', 'Location service is already active.');
        return;
      }
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'Your location is being tracked in the background.',
        },
      });
      setIsServiceRunning(true);
      Alert.alert('Success', 'Location service started.');
    } catch (e) {
      console.error('Error starting service:', e);
      Alert.alert('Error', 'Failed to start location service.');
    }
  };

  // Stop background location service
  const stopLocationService = async () => {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (!isTaskRegistered) {
        Alert.alert('Service Not Running', 'Location service is not active.');
        return;
      }
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsServiceRunning(false);
      Alert.alert('Success', 'Location service stopped.');
    } catch (e) {
      console.error('Error stopping service:', e);
      Alert.alert('Error', 'Failed to stop location service.');
    }
  };

  // Clear stored location data
  const clearLocationData = async () => {
    try {
      await AsyncStorage.removeItem('locations');
      setLocations([]);
      Alert.alert('Success', 'Location data cleared.');
    } catch (e) {
      console.error('Error clearing data:', e);
      Alert.alert('Error', 'Failed to clear location data.');
    }
  };

  // Render each location item
  const renderLocationItem = ({ item }: { item: LocationData }) => (
    <View style={styles.locationItem}>
      <Text>Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}</Text>
      <Text>Time: {format(new Date(item.timestamp), 'MM/dd/yyyy hh:mm:ss a')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPS Location Tracker</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Service On"
          onPress={startLocationService}
          disabled={isServiceRunning}
        />
        <Button
          title="Service Off"
          onPress={stopLocationService}
          disabled={!isServiceRunning}
        />
        <Button title="Clear Data" onPress={clearLocationData} />
      </View>
      <Text style={styles.subtitle}>Stored Locations:</Text>
      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(_item, index) => index.toString()}
        style={styles.locationList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  locationList: {
    flex: 1,
    marginHorizontal: 20,
  },
});