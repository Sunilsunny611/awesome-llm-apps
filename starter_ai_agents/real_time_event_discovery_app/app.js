// Global variables
let map;
let markers = [];
let currentUser = null;
let db = null;
let selectedLocation = null;
let eventsListener = null;

// Firebase configuration (loaded from config.js)
const firebaseConfig = window.appConfig ? window.appConfig.firebase : {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Firebase imports (available globally from index.html)
const { initializeApp, getFirestore, getAuth } = window.firebaseModules;

// Initialize Firebase
async function initializeFirebase() {
    try {
        // Import Firebase modules
        const { signInAnonymously, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        // Make Firebase functions available globally
        window.firebaseFunctions = {
            signInAnonymously,
            onAuthStateChanged,
            collection,
            addDoc,
            onSnapshot,
            query,
            orderBy,
            serverTimestamp
        };

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        const auth = getAuth(app);

        // Set up anonymous authentication
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                document.getElementById('userId').textContent = user.uid.slice(-8);
                console.log('User authenticated:', user.uid);
                setupEventListener();
            } else {
                try {
                    await signInAnonymously(auth);
                    showMessage('Authenticated successfully!', 'success');
                } catch (error) {
                    console.error('Authentication failed:', error);
                    showMessage('Authentication failed. Some features may not work.', 'error');
                }
            }
        });

    } catch (error) {
        console.error('Firebase initialization failed:', error);
        showMessage('Failed to connect to Firebase. Please check your configuration.', 'error');
    }
}

// Initialize Google Maps
function initMap() {
    // Get default location from config
    const defaultLocation = window.appConfig ? window.appConfig.defaultLocation : { lat: 37.7749, lng: -122.4194 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: window.appConfig ? window.appConfig.settings.mapZoom.default : 13,
        center: defaultLocation,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
                showMessage('Location detected! Click on the map to add events.', 'success');
            },
            (error) => {
                console.warn('Geolocation failed:', error);
                showMessage('Could not detect your location. Using default location.', 'warning');
            }
        );
    }

    // Add click listener for location selection
    map.addListener('click', (event) => {
        selectLocation(event.latLng);
    });

    console.log('Google Maps initialized');
}

// Handle location selection on map click
function selectLocation(latLng) {
    selectedLocation = {
        lat: latLng.lat(),
        lng: latLng.lng()
    };

    // Update form fields
    document.getElementById('latitude').value = selectedLocation.lat.toFixed(6);
    document.getElementById('longitude').value = selectedLocation.lng.toFixed(6);

    // Remove previous selection marker
    markers.forEach(marker => {
        if (marker.isSelection) {
            marker.setMap(null);
        }
    });
    markers = markers.filter(marker => !marker.isSelection);

    // Add selection marker
    const selectionMarker = new google.maps.Marker({
        position: selectedLocation,
        map: map,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="3"/>
                    <circle cx="16" cy="16" r="4" fill="white"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
        },
        title: 'Selected Location'
    });
    
    selectionMarker.isSelection = true;
    markers.push(selectionMarker);

    showMessage('Location selected! Fill in the event details and submit.', 'success');
}

// Set up real-time event listener
function setupEventListener() {
    if (!db || !window.firebaseFunctions) return;

    const { collection, onSnapshot, query, orderBy } = window.firebaseFunctions;
    
    try {
        const eventsCollection = collection(db, 'artifacts', 'eventDiscoveryApp', 'public', 'data', 'events');
        const eventsQuery = query(eventsCollection, orderBy('createdAt', 'desc'));

        // Listen for real-time updates
        eventsListener = onSnapshot(eventsQuery, (snapshot) => {
            const events = [];
            snapshot.forEach((doc) => {
                events.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateEventDisplay(events);
            console.log(`Received ${events.length} events from Firestore`);
        }, (error) => {
            console.error('Error listening to events:', error);
            showMessage('Failed to load events. Please refresh the page.', 'error');
        });

    } catch (error) {
        console.error('Error setting up event listener:', error);
        showMessage('Failed to set up real-time updates.', 'error');
    }
}

// Update event display (map markers and list)
function updateEventDisplay(events) {
    const currentTime = new Date();
    
    // Filter for currently active events
    const activeEvents = events.filter(event => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        return currentTime >= startTime && currentTime <= endTime;
    });

    // Clear existing event markers (but keep selection marker)
    markers.forEach(marker => {
        if (!marker.isSelection) {
            marker.setMap(null);
        }
    });
    markers = markers.filter(marker => marker.isSelection);

    // Add markers for active events
    activeEvents.forEach(event => {
        const eventMarker = new google.maps.Marker({
            position: { lat: event.lat, lng: event.lng },
            map: map,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="12" fill="${event.type === 'Party' ? '#8B5CF6' : '#EF4444'}" stroke="white" stroke-width="3"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
                            ${event.type === 'Party' ? '🎉' : '📍'}
                        </text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            },
            title: event.name
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="p-2">
                    <h3 class="font-semibold text-gray-900">${event.name}</h3>
                    <p class="text-sm text-gray-600">Type: ${event.type}</p>
                    <p class="text-sm text-gray-600">Until: ${new Date(event.endTime).toLocaleTimeString()}</p>
                    <p class="text-xs text-gray-500 mt-1">By: ${event.userId.slice(-8)}</p>
                </div>
            `
        });

        eventMarker.addListener('click', () => {
            infoWindow.open(map, eventMarker);
        });

        markers.push(eventMarker);
    });

    // Update events list
    updateEventsList(activeEvents);

    // Console assertion for testing
    console.assert(
        activeEvents.every(event => {
            const now = new Date();
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);
            return now >= start && now <= end;
        }),
        'All displayed events should be currently active'
    );
}

// Update events list in sidebar
function updateEventsList(events) {
    const eventsList = document.getElementById('eventsList');
    
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <div class="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <p>No live events right now</p>
                <p class="text-xs mt-1">Be the first to add one!</p>
            </div>
        `;
        return;
    }

    eventsList.innerHTML = events.map(event => {
        const endTime = new Date(event.endTime);
        const timeUntilEnd = Math.max(0, Math.floor((endTime - new Date()) / (1000 * 60)));
        
        return `
            <div class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onclick="focusEvent(${event.lat}, ${event.lng})">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">${event.name}</h4>
                        <div class="flex items-center mt-1">
                            <div class="w-2 h-2 rounded-full mr-2 ${event.type === 'Party' ? 'bg-party' : 'bg-other'}"></div>
                            <span class="text-sm text-gray-600">${event.type}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">
                            ${timeUntilEnd > 0 ? `${timeUntilEnd} min remaining` : 'Ending soon'}
                        </p>
                    </div>
                    <div class="text-xs text-gray-400">
                        ${event.userId.slice(-8)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Focus on event location
function focusEvent(lat, lng) {
    map.setCenter({ lat, lng });
    map.setZoom(window.appConfig ? window.appConfig.settings.mapZoom.focused : 16);
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            showMessage('Please wait for authentication to complete.', 'warning');
            return;
        }

        if (!selectedLocation) {
            showMessage('Please click on the map to select a location.', 'warning');
            return;
        }

        const formData = new FormData(form);
        const eventData = {
            name: formData.get('eventName').trim(),
            type: formData.get('eventType'),
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            userId: currentUser.uid,
            createdAt: window.firebaseFunctions.serverTimestamp()
        };

        // Validate times
        const startTime = new Date(eventData.startTime);
        const endTime = new Date(eventData.endTime);
        const now = new Date();

        if (startTime >= endTime) {
            showMessage('End time must be after start time.', 'error');
            return;
        }

        if (endTime <= now) {
            showMessage('End time must be in the future.', 'error');
            return;
        }

        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            const { collection, addDoc } = window.firebaseFunctions;
            const eventsCollection = collection(db, 'artifacts', 'eventDiscoveryApp', 'public', 'data', 'events');
            
            await addDoc(eventsCollection, eventData);
            
            showMessage(`Event "${eventData.name}" created successfully!`, 'success');
            form.reset();
            selectedLocation = null;
            
            // Clear location inputs
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            
            // Remove selection marker
            markers.forEach(marker => {
                if (marker.isSelection) {
                    marker.setMap(null);
                }
            });
            markers = markers.filter(marker => !marker.isSelection);

            console.log('Event created:', eventData.name);

        } catch (error) {
            console.error('Error creating event:', error);
            showMessage('Failed to create event. Please try again.', 'error');
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Event';
        }
    });

    // Set default start time to now
    const now = new Date();
    const startTimeInput = document.getElementById('startTime');
    startTimeInput.value = now.toISOString().slice(0, 16);
    
    // Set default end time to 2 hours from now
    const endTimeInput = document.getElementById('endTime');
    const defaultEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    endTimeInput.value = defaultEndTime.toISOString().slice(0, 16);
});

// Show message function
function showMessage(text, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    const messageId = 'msg-' + Date.now();
    
    const colors = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `p-3 rounded-md border ${colors[type]} transition-opacity duration-500`;
    messageDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-sm">${text}</span>
            <button onclick="document.getElementById('${messageId}').remove()" class="ml-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const msg = document.getElementById(messageId);
        if (msg) {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }
    }, 5000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    if (eventsListener) {
        eventsListener();
    }
});

// Console assertions for testing
console.assert(typeof initMap === 'function', 'initMap function should be defined');
console.assert(typeof showMessage === 'function', 'showMessage function should be defined');

console.log('Real-Time Event Discovery App initialized');