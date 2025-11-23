// Authentication utilities

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

async function validateAdminPassword(password) {
    try {
        const response = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Admin login error:', error);
        return {
            success: false,
            message: 'Connection error'
        };
    }
}

function checkAuthentication(requiredRole) {
    const authenticated = sessionStorage.getItem('authenticated');
    const role = sessionStorage.getItem('role');

    if (!authenticated || authenticated !== 'true') {
        window.location.href = '/index.html';
        return false;
    }

    if (requiredRole && role !== requiredRole) {
        window.location.href = '/index.html';
        return false;
    }

    return true;
}

function logout() {
    sessionStorage.clear();
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
