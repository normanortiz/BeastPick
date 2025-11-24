// Authentication utilities

// Constants
const AUTH_EXPIRY_HOURS = 24;
const ADMIN_PASSCODE = '000000'; // Hardcoded admin passcode

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

// Validate admin passcode (hardcoded)
function validateAdminPasscode(passcode) {
    return passcode === ADMIN_PASSCODE;
}

// Validate display/voting passcode (from config)
async function validateDisplayPasscode(passcode) {
    try {
        // Fetch game config to get the security passcode
        const response = await fetch('/api/config');
        const data = await response.json();

        if (!data.success || !data.config) {
            return {
                success: false,
                message: 'Could not load configuration'
            };
        }

        const configPasscode = data.config.securityPasscode || '123456';

        if (passcode === configPasscode) {
            return {
                success: true,
                message: 'Authentication successful'
            };
        } else {
            return {
                success: false,
                message: 'Invalid passcode'
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
