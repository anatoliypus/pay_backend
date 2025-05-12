# Yandex Pay Backend

A simple backend server that logs Yandex Pay Merchant API endpoint access.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```bash
PORT=3000
NODE_ENV=development
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Available Endpoints

The server implements the following Yandex Pay Merchant API endpoints:

- `POST /v1/order/render` - Render order details
- `POST /v1/order/create` - Create a new order
- `POST /v1/webhook` - Handle webhook notifications
- `GET /v1/pickup-options` - Get available pickup options
- `GET /v1/pickup-option-details` - Get details for a specific pickup option
- `POST /v1/onboard` - Handle merchant onboarding

## Logging

The server logs:
- All incoming requests with timestamp
- Request method and path
- Request headers
- Request body
- Specific endpoint access messages

## Error Handling

The server includes basic error handling that returns appropriate error responses in the Yandex Pay format.

## Deployment

### Deploying to Render.com (Free)

1. Create a GitHub repository and push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [render.com](https://render.com) and:
   - Sign up/login
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `yandex-pay-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

3. Add environment variables in Render dashboard:
   - `PORT`: 10000
   - `NODE_ENV`: production

After deployment, your API will be available at: `https://your-app-name.onrender.com` 