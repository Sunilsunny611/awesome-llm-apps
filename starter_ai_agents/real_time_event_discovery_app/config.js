// Configuration file for Real-Time Event Discovery App

// Demo configuration (using a read-only demo project)
// This allows immediate testing without setting up your own Firebase project
const demoFirebaseConfig = {
    apiKey: "AIzaSyDemoKey-Replace-With-Your-Own",
    authDomain: "event-discovery-demo.firebaseapp.com",
    projectId: "event-discovery-demo",
    storageBucket: "event-discovery-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:demoapplicationid"
};

// Production configuration template
// Replace these values with your actual Firebase project details
const productionFirebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Google Maps API Key
// Replace with your actual Google Maps API key
const googleMapsApiKey = "YOUR_GOOGLE_MAPS_API_KEY";

// App configuration
const appConfig = {
    // Use demo config for testing, production for live deployment
    firebase: demoFirebaseConfig, // Change to productionFirebaseConfig for production
    googleMapsApiKey: googleMapsApiKey,
    
    // Collection path in Firestore
    firestoreCollectionPath: {
        artifacts: 'artifacts',
        appId: 'eventDiscoveryApp',
        public: 'public',
        data: 'data',
        events: 'events'
    },
    
    // Default map settings
    defaultLocation: {
        lat: 37.7749,  // San Francisco
        lng: -122.4194
    },
    
    // Event types and their colors
    eventTypes: {
        'Party': {
            color: '#8B5CF6',
            emoji: '🎉'
        },
        'Other': {
            color: '#EF4444',
            emoji: '📍'
        }
    },
    
    // App settings
    settings: {
        autoRemoveMessagesAfter: 5000, // 5 seconds
        defaultEventDuration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        mapZoom: {
            default: 13,
            focused: 16
        },
        maxEventsToDisplay: 100,
        refreshInterval: 30000 // 30 seconds for cleaning up expired events
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = appConfig;
} else {
    window.appConfig = appConfig;
}