const http = require('http');
const fs = require('fs');
const path = require('path');

// Import API handlers
const playersHandler = require('./api/players.js');
const configHandler = require('./api/config.js');
const authHandler = require('./api/auth.js');
const timeHandler = require('./api/time.js');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Wrapper to adapt Vercel-style response to Node.js http response
function wrapResponse(res) {
    return {
        status: (code) => {
            res.statusCode = code;
            return {
                json: (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                },
                end: () => res.end()
            };
        },
        setHeader: (name, value) => res.setHeader(name, value)
    };
}

// Parse request body for POST/PUT requests
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                req.body = body ? JSON.parse(body) : {};
                resolve();
            } catch (e) {
                req.body = {};
                resolve();
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Handle API routes
    if (req.url.startsWith('/api/players')) {
        await parseBody(req);
        return await playersHandler.default(req, wrapResponse(res));
    }
    if (req.url.startsWith('/api/config')) {
        await parseBody(req);
        return await configHandler.default(req, wrapResponse(res));
    }
    if (req.url.startsWith('/api/auth')) {
        await parseBody(req);
        return await authHandler.default(req, wrapResponse(res));
    }
    if (req.url.startsWith('/api/time')) {
        await parseBody(req);
        return await timeHandler.default(req, wrapResponse(res));
    }

    // Serve static files from public directory
    // Strip query parameters from URL
    const urlWithoutQuery = req.url.split('?')[0];
    let filePath = './public' + (urlWithoutQuery === '/' ? '/index.html' : urlWithoutQuery);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
