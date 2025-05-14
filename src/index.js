const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { jwtVerify, createRemoteJWKSet } = require('jose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Yandex Pay JWK endpoints
const JWK_ENDPOINTS = {
    sandbox: 'https://sandbox.pay.yandex.ru/api/jwks',
    production: 'https://pay.yandex.ru/api/jwks'
};

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

// Yandex Pay Merchant API endpoints
app.post('/v1/order/render', (req, res) => {
    console.log('Order render endpoint accessed');
    res.json({ status: 'success' });
});

app.post('/v1/order/create', (req, res) => {
    console.log('Order create endpoint accessed');
    res.json({ status: 'success' });
});

app.post('/v1/webhook', async (req, res) => {
    console.log('Webhook endpoint accessed');
    try {
        const bodyText = req.body.toString('utf-8');
        console.log('Raw JWT:', bodyText);
        
        // Verify JWT token
        const { payload, protectedHeader } = await jwtVerify(bodyText, JWKS, {
            issuer: 'https://pay.yandex.ru',
            algorithms: ['ES256']
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
        
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(403).json({
            status: 'fail',
            reasonCode: 'FORBIDDEN',
            reason: error.message
        });
    }
});

app.get('/v1/pickup-options', (req, res) => {
    console.log('Pickup options endpoint accessed');
    res.json({ status: 'success' });
});

app.get('/v1/pickup-option-details', (req, res) => {
    console.log('Pickup option details endpoint accessed');
    res.json({ status: 'success' });
});

app.post('/v1/onboard', (req, res) => {
    console.log('Onboard endpoint accessed');
    res.json({ status: 'success' });
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