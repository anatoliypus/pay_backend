const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post('/v1/webhook', (req, res) => {
    console.log('Webhook endpoint accessed');
    try {
        console.log('Body:', req.body);
        const bodyText = req.body.toString('utf-8');
        console.log('Body:', bodyText);
        const jsonBody = JSON.parse(bodyText);
        console.log('JSON Body:', jsonBody);
    } catch (error) {
        console.error('Error:', error);
    }
    // console.log('Everything', req)
    res.json({ status: 'success' });
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