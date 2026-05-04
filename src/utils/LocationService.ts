import { PermissionsAndroid, Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import { supabase } from './supabase'; // Apnar Supabase client import

// Sleep function background task er loop er delay er jonno
const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

// ==========================================
// BACKGROUND TASK DEFINITION
// ==========================================
const locationTask = async (taskDataArguments: any) => {
    const { delay } = taskDataArguments;

    // Jotokkhon background service running aache, ei loop cholbe
    await new Promise(async (resolve) => {
        for (let i = 0; BackgroundService.isRunning(); i++) {

            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, speed } = position.coords;

                    try {
                        // Supabase e Location Insert kora
                        // Note: Ekhane trip_id dynamically anar dorkar porle AsyncStorage ba kono state manager use korte paren.
                        // Ekhonkar jonno direct insert kora hocche.

                        const { error } = await supabase.from('trip_locations').insert({
                            // trip_id: ACTIVE_TRIP_ID, // Active trip ID ekhane pass korben
                            latitude: latitude,
                            longitude: longitude,
                            speed_kmh: speed ? (speed * 3.6).toFixed(1) : 0, // m/s theke km/h e convert
                            recorded_at: new Date().toISOString()
                        });

                        if (error) {
                            console.log('Error saving location to Supabase:', error.message);
                        } else {
                            console.log('Location saved successfully!', latitude, longitude);
                        }
                    } catch (err) {
                        console.log('Supabase Insert Catch Error:', err);
                    }
                },
                (error) => {
                    console.log('Geolocation Error:', error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 50 }
            );

            // 5 minute (delay parameter) wait korbe next location fetch korar age
            await sleep(delay);
        }
    });
};

// ==========================================
// BACKGROUND SERVICE OPTIONS
// ==========================================
const bgServiceOptions = {
    taskName: 'TripTracking',
    taskTitle: 'Trip in Progress',
    taskDesc: 'Your location is being tracked for the assigned trip.',
    taskIcon: {
        name: 'ic_launcher', // android/app/src/main/res/mipmap theke apnar app icon
        type: 'mipmap',
    },
    color: '#007AFF',
    linkingURI: 'yourSchemeHere://chat/jane', // Notification e click korle jodi app open korate chan
    parameters: {
        delay: 300000, // 300,000 ms = 5 minutes interval
    },
};

// ==========================================
// EXPORTED FUNCTIONS
// ==========================================

export const startTripTracking = async () => {
    if (Platform.OS === 'android') {
        try {
            // 1. First, request FOREGROUND permissions
            const grantedFine = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "App needs access to your location to track trips.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );

            if (grantedFine !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Foreground location permission denied');
                // Return if foreground is denied, we can't do anything
                return;
            }

            // 2. Then, request BACKGROUND permission (Only if Android >= 10)
            if (Platform.Version >= 29) {
                const grantedBackground = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                        title: "Background Location Permission",
                        message: "App needs background location access to track trips even when the app is minimized. Please select 'Allow all the time'.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );

                if (grantedBackground !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Background location permission denied");
                    // Jodi background allow na kore, tobuo amra service start korbo
                    // kintu screen theke berole track hobe na.
                }
            }
        } catch (err) {
            console.warn("Permission Error:", err);
            return; // Crash thekate catch block e return kora hochhe
        }
    }

    try {
        console.log('Starting background location tracking...');
        if (!BackgroundService.isRunning()) {
            await BackgroundService.start(locationTask, bgServiceOptions);
        } else {
            console.log('Service is already running');
        }
    } catch (e) {
        console.log('Error starting background service', e);
    }
};

export const stopTripTracking = async () => {
    try {
        console.log('Stopping background location tracking...');
        if (BackgroundService.isRunning()) {
            await BackgroundService.stop();
            console.log('Background service stopped successfully.');
        }
    } catch (e) {
        console.log('Error stopping background service', e);
    }
};