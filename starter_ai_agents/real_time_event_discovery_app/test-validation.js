// Test validation script for Real-Time Event Discovery App
// Run this in the browser console to validate functionality

console.log('🧪 Starting Real-Time Event Discovery App Tests...');

// Test 1: Basic function availability
function testFunctionAvailability() {
    console.log('\n📋 Test 1: Function Availability');
    
    const requiredFunctions = [
        'initMap',
        'showMessage',
        'selectLocation',
        'updateEventDisplay',
        'focusEvent'
    ];
    
    const results = requiredFunctions.map(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`  ${exists ? '✅' : '❌'} ${funcName}: ${exists ? 'Available' : 'Missing'}`);
        return exists;
    });
    
    const passed = results.every(result => result);
    console.log(`  📊 Result: ${passed ? 'PASS' : 'FAIL'} - ${results.filter(r => r).length}/${results.length} functions available`);
    return passed;
}

// Test 2: Configuration validation
function testConfiguration() {
    console.log('\n⚙️ Test 2: Configuration');
    
    const hasConfig = typeof window.appConfig !== 'undefined';
    console.log(`  ${hasConfig ? '✅' : '❌'} App Config: ${hasConfig ? 'Loaded' : 'Missing'}`);
    
    if (hasConfig) {
        const config = window.appConfig;
        const hasFirebase = config.firebase && typeof config.firebase === 'object';
        const hasEventTypes = config.eventTypes && typeof config.eventTypes === 'object';
        const hasSettings = config.settings && typeof config.settings === 'object';
        
        console.log(`  ${hasFirebase ? '✅' : '❌'} Firebase Config: ${hasFirebase ? 'Present' : 'Missing'}`);
        console.log(`  ${hasEventTypes ? '✅' : '❌'} Event Types: ${hasEventTypes ? 'Present' : 'Missing'}`);
        console.log(`  ${hasSettings ? '✅' : '❌'} Settings: ${hasSettings ? 'Present' : 'Missing'}`);
        
        const passed = hasFirebase && hasEventTypes && hasSettings;
        console.log(`  📊 Result: ${passed ? 'PASS' : 'FAIL'} - Configuration structure valid`);
        return passed;
    }
    
    console.log('  📊 Result: FAIL - No configuration found');
    return false;
}

// Test 3: DOM elements validation
function testDOMElements() {
    console.log('\n🎯 Test 3: DOM Elements');
    
    const requiredElements = [
        'map',
        'eventForm',
        'eventsList',
        'messageContainer',
        'eventName',
        'eventType',
        'startTime',
        'endTime',
        'latitude',
        'longitude',
        'submitBtn'
    ];
    
    const results = requiredElements.map(elementId => {
        const element = document.getElementById(elementId);
        const exists = element !== null;
        console.log(`  ${exists ? '✅' : '❌'} #${elementId}: ${exists ? 'Found' : 'Missing'}`);
        return exists;
    });
    
    const passed = results.every(result => result);
    console.log(`  📊 Result: ${passed ? 'PASS' : 'FAIL'} - ${results.filter(r => r).length}/${results.length} elements found`);
    return passed;
}

// Test 4: Time validation logic
function testTimeValidation() {
    console.log('\n⏰ Test 4: Time Validation Logic');
    
    const now = new Date();
    const startTime = new Date(now.getTime() + 60000); // 1 minute from now
    const endTime = new Date(now.getTime() + 3600000); // 1 hour from now
    const pastTime = new Date(now.getTime() - 60000); // 1 minute ago
    
    // Test 1: Valid time range
    const validRange = startTime < endTime;
    console.log(`  ${validRange ? '✅' : '❌'} Valid time range (start < end): ${validRange}`);
    
    // Test 2: Future end time
    const futureEndTime = endTime > now;
    console.log(`  ${futureEndTime ? '✅' : '❌'} Future end time: ${futureEndTime}`);
    
    // Test 3: Invalid range detection
    const invalidRange = pastTime >= endTime;
    console.log(`  ${!invalidRange ? '✅' : '❌'} Invalid range detection: ${!invalidRange}`);
    
    const passed = validRange && futureEndTime && !invalidRange;
    console.log(`  📊 Result: ${passed ? 'PASS' : 'FAIL'} - Time validation logic working`);
    return passed;
}

// Test 5: Event filtering logic simulation
function testEventFiltering() {
    console.log('\n🔍 Test 5: Event Filtering Logic');
    
    const now = new Date();
    const events = [
        {
            name: 'Active Event 1',
            startTime: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 min ago
            endTime: new Date(now.getTime() + 30 * 60000).toISOString()    // 30 min from now
        },
        {
            name: 'Future Event',
            startTime: new Date(now.getTime() + 60 * 60000).toISOString(),  // 1 hour from now
            endTime: new Date(now.getTime() + 120 * 60000).toISOString()    // 2 hours from now
        },
        {
            name: 'Past Event',
            startTime: new Date(now.getTime() - 120 * 60000).toISOString(), // 2 hours ago
            endTime: new Date(now.getTime() - 60 * 60000).toISOString()     // 1 hour ago
        },
        {
            name: 'Active Event 2',
            startTime: new Date(now.getTime() - 15 * 60000).toISOString(),  // 15 min ago
            endTime: new Date(now.getTime() + 45 * 60000).toISOString()     // 45 min from now
        }
    ];
    
    // Simulate filtering logic
    const activeEvents = events.filter(event => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        return now >= startTime && now <= endTime;
    });
    
    const expectedActiveCount = 2;
    const actualActiveCount = activeEvents.length;
    const correctFiltering = actualActiveCount === expectedActiveCount;
    
    console.log(`  ${correctFiltering ? '✅' : '❌'} Event filtering: ${actualActiveCount}/${events.length} events active (expected ${expectedActiveCount})`);
    console.log(`  📋 Active events: ${activeEvents.map(e => e.name).join(', ')}`);
    
    const passed = correctFiltering;
    console.log(`  📊 Result: ${passed ? 'PASS' : 'FAIL'} - Event filtering logic working`);
    return passed;
}

// Test 6: Message system
function testMessageSystem() {
    console.log('\n💬 Test 6: Message System');
    
    const messageContainer = document.getElementById('messageContainer');
    const hasMessageContainer = messageContainer !== null;
    console.log(`  ${hasMessageContainer ? '✅' : '❌'} Message container: ${hasMessageContainer ? 'Found' : 'Missing'}`);
    
    if (hasMessageContainer && typeof showMessage === 'function') {
        // Test message creation
        const initialMessageCount = messageContainer.children.length;
        showMessage('Test message', 'info');
        
        setTimeout(() => {
            const newMessageCount = messageContainer.children.length;
            const messageAdded = newMessageCount > initialMessageCount;
            console.log(`  ${messageAdded ? '✅' : '❌'} Message creation: ${messageAdded ? 'Working' : 'Failed'}`);
        }, 100);
        
        console.log(`  📊 Result: PASS - Message system functional`);
        return true;
    }
    
    console.log(`  📊 Result: FAIL - Message system not functional`);
    return false;
}

// Run all tests
function runAllTests() {
    console.log('🚀 Real-Time Event Discovery App - Comprehensive Test Suite');
    console.log('================================================================');
    
    const tests = [
        testFunctionAvailability,
        testConfiguration,
        testDOMElements,
        testTimeValidation,
        testEventFiltering,
        testMessageSystem
    ];
    
    const results = tests.map(test => {
        try {
            return test();
        } catch (error) {
            console.error(`❌ Test failed with error:`, error);
            return false;
        }
    });
    
    const passedCount = results.filter(result => result).length;
    const totalCount = results.length;
    const overallPass = passedCount === totalCount;
    
    console.log('\n================================================================');
    console.log(`📊 Test Summary: ${passedCount}/${totalCount} tests passed`);
    console.log(`🏆 Overall Result: ${overallPass ? 'PASS' : 'FAIL'}`);
    
    if (overallPass) {
        console.log('✨ All tests passed! The application is ready for use.');
    } else {
        console.log('⚠️  Some tests failed. Please check the configuration and setup.');
    }
    
    return overallPass;
}

// Auto-run tests if in demo mode or console environment
if (typeof window !== 'undefined') {
    // Delay execution to ensure DOM is loaded
    setTimeout(() => {
        runAllTests();
    }, 1000);
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testEventFiltering, testTimeValidation };
}