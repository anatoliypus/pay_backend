const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { jwtVerify, createRemoteJWKSet } = require('jose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Yandex Pay JWK endpoints
const JWK_ENDPOINTS = {
    sandbox: 'https://sandbox.pay.yandex.ru/api/jwks',
    production: 'https://pay.yandex.ru/api/jwks'
};

// Function to fetch and log JWK set
async function fetchJWKS() {
    try {
        const jwksUrl = process.env.NODE_ENV === 'production' ? JWK_ENDPOINTS.production : JWK_ENDPOINTS.sandbox;
        console.log('Fetching JWKS from:', jwksUrl);
        const response = await fetch(jwksUrl);
        const jwks = await response.json();
        console.log('Available JWKS:', JSON.stringify(jwks, null, 2));
        return jwks;
    } catch (error) {
        console.error('Error fetching JWKS:', error);
        throw error;
    }
}

// Create JWK set for token verification
const JWKS = createRemoteJWKSet(new URL(process.env.NODE_ENV === 'production' ? JWK_ENDPOINTS.production : JWK_ENDPOINTS.sandbox));

// Middleware
var rawBodySaver = function (req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}
  
app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

app.use(morgan('dev')); // HTTP request logger

// Logging middleware for all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.post('/v1/webhook', async (req, res) => {
    console.log('Webhook endpoint accessed');
    try {
        const bodyText = req.body.toString('utf-8');
        console.log('Raw JWT:', bodyText);
        
        // Decode JWT header without verification to get kid
        const [headerB64] = bodyText.split('.');
        const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
        console.log('JWT Header (decoded):', header);

        // Fetch and log available JWKS
        const jwks = await fetchJWKS();
        
        // Verify JWT token with minimal requirements
        const { payload, protectedHeader } = await jwtVerify(bodyText, JWKS, {
            algorithms: ['ES256'],
            clockTolerance: 60 // 1 minute clock tolerance
        });

        console.log('JWT Header:', protectedHeader);
        console.log('JWT Payload:', payload);

        // Verify merchantId matches your merchant ID
        if (payload.merchantId !== process.env.YANDEX_MERCHANT_ID) {
            return res.status(403).json({
                status: 'fail',
                reasonCode: 'FORBIDDEN',
                reason: 'Invalid merchantId'
            });
        }

        // Process the webhook payload
        console.log('Event:', payload.event);
        console.log('Event Time:', payload.eventTime);
        console.log('Merchant ID:', payload.merchantId);
        console.log('Order Details:', payload.order);
        
        // Send appropriate response based on event type
        if (payload.event === 'ORDER_STATUS_UPDATED') {
            console.log(`Order ${payload.order.orderId} payment status: ${payload.order.paymentStatus}`);
        }
        
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
            claim: error.claim,
            reason: error.reason,
            payload: error.payload
        });
        res.status(403).json({
            status: 'fail',
            reasonCode: 'FORBIDDEN',
            reason: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'fail',
        reasonCode: 'OTHER',
        reason: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /v1/order/render');
    console.log('- POST /v1/order/create');
    console.log('- POST /v1/webhook');
    console.log('- GET /v1/pickup-options');
    console.log('- GET /v1/pickup-option-details');
    console.log('- POST /v1/onboard');
}); 