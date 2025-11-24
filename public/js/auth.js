// Authentication utilities

// Constants
const AUTH_EXPIRY_HOURS = 24;

// Set authentication with 24-hour expiration
function setAuthentication(role, additionalData = {}) {
    const authData = {
        authenticated: true,
        role: role,
        timestamp: Date.now(),
        ...additionalData
    };
    localStorage.setItem('authData', JSON.stringify(authData));
}

// Check if authentication is valid and not expired
function isAuthenticationValid() {
    try {
        const authDataStr = localStorage.getItem('authData');
        if (!authDataStr) return false;

        const authData = JSON.parse(authDataStr);
        const now = Date.now();
        const expiryTime = authData.timestamp + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000);

        if (now > expiryTime) {
            localStorage.removeItem('authData');
            return false;
        }

        return authData.authenticated === true;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Get current authentication data
function getAuthData() {
    try {
        const authDataStr = localStorage.getItem('authData');
        if (!authDataStr) return null;

        const authData = JSON.parse(authDataStr);
        return authData;
    } catch (error) {
        console.error('Error getting auth data:', error);
        return null;
    }
}

// Validate admin passcode via backend API (secure)
async function validateAdminPasscode(passcode) {
    try {
        const response = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ passcode })
        });

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Admin passcode validation error:', error);
        return false;
    }
}

// Validate display/voting passcode via backend API (secure)
async function validateDisplayPasscode(passcode) {
    try {
        const response = await fetch('/api/auth/validate-passcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                passcode,
                role: 'display'
            })
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                message: 'Authentication successful'
            };
        } else {
            return {
                success: false,
                message: data.message || 'Invalid passcode'
            };
        }
    } catch (error) {
        console.error('Passcode validation error:', error);
        return {
            success: false,
            message: 'Connection error'
        };
    }
}

// Legacy API-based validation (kept for potential future use)
async function validatePasscode(passcode, role, playerNumber = null) {
    try {
        const response = await fetch('/api/auth/validate-passcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                passcode,
                role,
                playerNumber
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Passcode validation error:', error);
        return {
            success: false,
            message: 'Connection error'
        };
    }
}

// Check authentication and redirect if not authenticated
function checkAuthentication(requiredRole) {
    if (!isAuthenticationValid()) {
        if (requiredRole === 'admin') {
            window.location.href = '/index.html';
        } else if (requiredRole === 'display') {
            window.location.href = '/display-login.html';
        } else if (requiredRole === 'contestant') {
            window.location.href = '/players.html';
        } else {
            window.location.href = '/index.html';
        }
        return false;
    }

    const authData = getAuthData();
    if (!authData) {
        window.location.href = '/index.html';
        return false;
    }

    if (requiredRole && authData.role !== requiredRole) {
        window.location.href = '/index.html';
        return false;
    }

    return true;
}

function logout() {
    localStorage.removeItem('authData');
    window.location.href = '/index.html';
}

async function loadLogo() {
    try {
        const response = await fetch('/api/config/logo');
        if (response.ok) {
            const data = await response.json();
            if (data.logoUrl) {
                const logoArea = document.getElementById('logoArea');
                if (logoArea) {
                    logoArea.innerHTML = `<img src="${data.logoUrl}" alt="Logo">`;
                }
            }
        }
    } catch (error) {
        console.log('No custom logo configured');
    }
}
