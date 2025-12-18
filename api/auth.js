import {
    getPasscode,
    setPasscode,
    getAdminPassword,
    setAdminPassword,
    getPlayer,
    initializeDefaultData
} from '../lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const path = req.url.split('?')[0];

    try {
        // Initialize defaults on first run
        await initializeDefaultData();

        // Validate passcode
        if (path.includes('/validate-passcode')) {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { passcode, role, playerNumber } = req.body;

            if (!passcode || passcode.length !== 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Passcode must be 6 digits'
                });
            }

            const storedPasscode = await getPasscode();

            if (passcode !== storedPasscode) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid passcode'
                });
            }

            // For contestants, verify player number exists
            if (role === 'contestant') {
                if (!playerNumber) {
                    return res.status(400).json({
                        success: false,
                        message: 'Player number required'
                    });
                }

                const player = await getPlayer(parseInt(playerNumber));
                if (!player) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid player number'
                    });
                }

                return res.status(200).json({
                    success: true,
                    role: 'contestant',
                    playerNumber: parseInt(playerNumber),
                    playerName: player.name
                });
            }

            // Display screen access
            return res.status(200).json({
                success: true,
                role: 'display'
            });
        }

        // Admin login with passcode
        if (path.includes('/admin-login')) {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { passcode } = req.body;

            // Admin passcode stored securely in environment variable
            const ADMIN_PASSCODE = (process.env.ADMIN_PASSCODE || '000000').trim();

            if (!passcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Passcode required'
                });
            }

            if (passcode.length !== 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Passcode must be 6 digits'
                });
            }

            if (passcode !== ADMIN_PASSCODE) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid passcode'
                });
            }

            return res.status(200).json({
                success: true,
                role: 'admin'
            });
        }

        // Change passcode (admin only)
        if (path.includes('/change-passcode')) {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { newPasscode, adminPassword } = req.body;

            // Verify admin password
            const storedPassword = await getAdminPassword();
            if (adminPassword !== storedPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid admin password'
                });
            }

            if (!newPasscode || newPasscode.length !== 6 || !/^\d{6}$/.test(newPasscode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Passcode must be 6 digits'
                });
            }

            await setPasscode(newPasscode);

            return res.status(200).json({
                success: true,
                message: 'Passcode updated successfully'
            });
        }

        // Change admin password
        if (path.includes('/change-password')) {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { currentPassword, newPassword } = req.body;

            // Verify current password
            const storedPassword = await getAdminPassword();
            if (currentPassword !== storedPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid current password'
                });
            }

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }

            await setAdminPassword(newPassword);

            return res.status(200).json({
                success: true,
                message: 'Password updated successfully'
            });
        }

        res.status(404).json({ error: 'Endpoint not found' });
    } catch (error) {
        console.error('Auth API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
