# 🌍 Real-Time Event Discovery App

A clean, map-centric web application for discovering and sharing live local events. Users can instantly view events happening "right now" through interactive Google Maps markers and contribute to the IRL dataset with a super-simple event creation form.

![Event Discovery App](https://img.shields.io/badge/Status-Ready%20for%20Testing-brightgreen)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)
![Google%20Maps](https://img.shields.io/badge/Maps-Google%20Maps%20API-blue)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC)

## ✨ Features

### 🗺️ Interactive Map Experience
- **Real-time event visualization** with colored markers (Purple for Party 🎉, Red for Other 📍)
- **Click-to-select location** for precise event placement
- **Auto-location detection** when supported by browser
- **Event info windows** with details on marker click
- **Focus on event** by clicking items in the event list

### 📝 Effortless Event Creation
- **Super-simple form** with minimal required fields
- **Map-click location selection** with auto-populated coordinates
- **Event type dropdown** (Party, Other)
- **Start/End time pickers** with smart defaults
- **Instant visual feedback** through custom message system
- **Anonymous user system** with visible user IDs

### ⚡ Real-Time Updates
- **Live event filtering** - only shows currently active events
- **Auto-expiration** - events disappear when end time passes
- **Cross-tab synchronization** - updates appear instantly across multiple browser tabs
- **Firestore real-time listeners** for instant data synchronization

### 🎨 Clean, Modern UI
- **Tailwind CSS styling** for responsive, beautiful design
- **Minimalist event list** with time remaining indicators
- **Color-coded event types** for quick visual identification
- **Custom message notifications** with auto-dismiss
- **Mobile-responsive design** that works on all devices

## 🚀 Quick Start

### Prerequisites
1. **Google Maps API Key** (required for map functionality)
2. **Firebase Project** (for real-time data storage)
3. **Web Server** (for serving the application)

### Setup Instructions

#### 1. Get Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Maps JavaScript API"
4. Create credentials (API Key)
5. Copy your API key

#### 2. Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the Firebase configuration object
5. Set up Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

#### 3. Configure the Application
1. Open `config.js`
2. Replace the `productionFirebaseConfig` values with your Firebase config
3. Update `googleMapsApiKey` with your Google Maps API key
4. In `index.html`, update the Google Maps script src with your API key:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap"></script>
   ```

#### 4. Deploy or Serve Locally
**Option A: Local Development**
```bash
# Using Python (Python 3)
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

**Option B: Deploy to Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Firebase Security Rules

Add these rules to your Firestore database for proper security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to events collection
    match /artifacts/eventDiscoveryApp/public/data/events/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Testing the Application

### Manual Testing Checklist

#### ✅ Basic Functionality
- [ ] Map loads correctly with your location or default location
- [ ] Click on map to select location (green marker appears)
- [ ] Location coordinates auto-populate in form
- [ ] Anonymous user ID appears in header
- [ ] Form validation works (required fields, time validation)

#### ✅ Event Creation
- [ ] Create event with valid data
- [ ] Event appears immediately on map with correct color
- [ ] Event appears in sidebar list
- [ ] Success message displays
- [ ] Form resets after submission

#### ✅ Real-Time Features
- [ ] Open application in multiple browser tabs
- [ ] Create event in one tab
- [ ] Verify event appears instantly in other tabs
- [ ] Create event with short duration (5 minutes)
- [ ] Verify event disappears automatically when time expires

#### ✅ Interactive Features
- [ ] Click on map markers to see event details
- [ ] Click on events in sidebar to focus map on location
- [ ] Verify time remaining countdown updates
- [ ] Test different event types (Party vs Other)

### Console Testing

The application includes JavaScript assertions for automated testing. Check the browser console for:

```javascript
// Time validation assertion
console.assert(startTime < endTime, 'Start time should be before end time');

// Active events assertion  
console.assert(
    activeEvents.every(event => {
        const now = new Date();
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return now >= start && now <= end;
    }),
    'All displayed events should be currently active'
);

// Function availability assertions
console.assert(typeof initMap === 'function', 'initMap function should be defined');
console.assert(typeof showMessage === 'function', 'showMessage function should be defined');
```

## 📁 Project Structure

```
real_time_event_discovery_app/
├── index.html          # Main HTML file with UI structure
├── app.js             # Core JavaScript functionality
├── config.js          # Configuration settings
└── README.md          # Documentation (this file)
```

## 🔧 Configuration Options

### Event Types
Add new event types in `config.js`:
```javascript
eventTypes: {
    'Party': { color: '#8B5CF6', emoji: '🎉' },
    'Other': { color: '#EF4444', emoji: '📍' },
    'Music': { color: '#F59E0B', emoji: '🎵' },  // Add new types here
}
```

### Firestore Collection Path
The app stores events in: `artifacts/eventDiscoveryApp/public/data/events`

This path can be customized in `config.js`.

## 🎯 Future Enhancements

The application is designed for easy extension:

### 🤖 AI Integration Ready
- **OpenAI LLM API integration** for smart event recommendations
- **Automated event discovery** from social media or news sources
- **Smart event categorization** using AI text processing
- **Personalized event suggestions** based on user preferences

### 📊 Analytics & Insights
- **Event popularity tracking**
- **User engagement metrics**
- **Geographic event density heatmaps**
- **Trending event types analysis**

### 🔔 Enhanced Features
- **Push notifications** for nearby events
- **Event search and filtering**
- **User profiles and preferences**
- **Event photos and media support**
- **Social sharing integration**

## 🐛 Troubleshooting

### Common Issues

**Map not loading:**
- Check your Google Maps API key is valid
- Ensure the API key has the correct permissions
- Verify the Maps JavaScript API is enabled in Google Cloud Console

**Firebase errors:**
- Check your Firebase configuration is correct
- Verify Firestore security rules allow authenticated users
- Ensure anonymous authentication is enabled in Firebase Auth

**Events not appearing:**
- Check browser console for JavaScript errors
- Verify your internet connection
- Try refreshing the page
- Check if events have expired (end time passed)

**Authentication issues:**
- Clear browser cache and cookies
- Check Firebase project settings
- Verify anonymous authentication is enabled

## 📄 License

This project is part of the Awesome LLM Apps collection. Feel free to use, modify, and distribute according to the repository license.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

Built with ❤️ for the real-time local events community. Perfect for hackathons, local meetups, spontaneous gatherings, and any "what's happening right now" moments!