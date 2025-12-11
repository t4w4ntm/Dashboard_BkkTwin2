/* ========================================
   BangkokTwin Dashboard - Main Application
   Entry point with data fetching and UI control
   ======================================== */

import { DataService } from './api/DataService.js';
import './components/AqiCard.js';
import './components/TempCard.js';

const dataService = new DataService();

// ========================================
// Clock with smooth updates
// ========================================
function updateClock() {
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const timeString = now.toLocaleTimeString('th-TH', options);
    const el = document.getElementById('live-clock');

    if (el) {
        el.textContent = timeString;
        el.setAttribute('datetime', now.toISOString());
    }

    requestAnimationFrame(updateClock);
}

// ========================================
// Loading State Management
// ========================================
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        // Remove from DOM after animation
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }
}

function showLoadingState() {
    const cards = document.querySelectorAll('aqi-card, temp-card');
    cards.forEach(card => {
        card.classList.add('loading');
    });
}

function hideLoadingState() {
    const cards = document.querySelectorAll('aqi-card, temp-card');
    cards.forEach(card => {
        card.classList.remove('loading');
    });
}

// ========================================
// Dashboard Data Update
// ========================================
async function updateDashboard() {
    const districts = ['klong', 'thon', 'bang'];

    try {
        // Fetch all district data in parallel
        const promises = districts.map(id => dataService.getDistrictData(id));
        const results = await Promise.all(promises);

        results.forEach((data, index) => {
            if (!data) return;

            const distId = districts[index];

            // Update AQI Card
            const aqiCard = document.getElementById(`aqi-${distId}`);
            if (aqiCard && data.pm25 !== null) {
                aqiCard.setAttribute('pm25', data.pm25);
            }

            // Update Temp Card
            const tempCard = document.getElementById(`temp-${distId}`);
            if (tempCard && data.temp !== null) {
                tempCard.setAttribute('temp', data.temp);
            }
        });

        hideLoadingState();

    } catch (error) {
        console.error('Dashboard update failed:', error);
        hideLoadingState();
    }
}

// ========================================
// Intersection Observer for Scroll Animations
// ========================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe sections
    document.querySelectorAll('.dashboard-grid > section').forEach(section => {
        observer.observe(section);
    });
}

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateClock();

    // Initialize scroll animations
    initScrollAnimations();

    // Initial data fetch
    updateDashboard().then(() => {
        // Hide loading overlay after first data load
        hideLoadingOverlay();
    });

    // Poll every 15 seconds
    setInterval(updateDashboard, 15000);

    // Add visibility change handler for tab switching
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateDashboard();
        }
    });
});

// Log startup
console.log('🚀 BangkokTwin Dashboard 2.0 initialized');