# Smart HealthCare Management System

Smart HealthCare Management System is a full-stack healthcare web app with separate frontend and backend projects. It supports public pages, patient booking, doctor workflows, admin management, medical records, payments, receipts, notifications, hero slide management, and optional integrations such as OTP, email, SMS, WhatsApp, push notifications, online payments, and AI assistant.

## Project Structure

```text
Smart HealthCare Management System/
  backend/
    config/
      db.js                 MongoDB connection file for local and online deployment
      features.js           Central backend feature flags
    middleware/             Authentication middleware
    models/                 MongoDB/Mongoose database models
    routes/                 Backend API routes
    uploads/                Uploaded files
    utils/                  Email, OTP, payment, notification, AI, and PDF helpers
    server.js               Express app entry point
    .env.example            Backend environment template
  frontend/
    src/
      api/                  Axios API setup
      components/           Reusable UI components
      config/               Frontend feature flag defaults
      context/              Authentication state
      layouts/              Dashboard layout
      pages/                Public, patient, doctor, admin, and shared pages
    .env.example            Frontend environment template
    vite.config.js          Vite config
```

## Main Features

- Public landing page with login, register, forgot password, reset password, and email verification pages.
- Role-based authentication for patient, doctor, and admin users.
- Patient dashboard with appointment booking, appointment history, medical records, payment history, and AI assistant screen.
- Doctor dashboard with appointment list, patient list, and patient detail view.
- Admin dashboard with doctor, patient, appointment, payment, report, and hero slide management.
- MongoDB database models for users, doctors, appointments, medical records, payments, notifications, hero slides, OTP tokens, and system settings.
- PDF receipt generation for payments.
- Feature flags for optional services so the app can run locally without paid third-party services.

## Requirements

- Node.js 18 or newer
- npm
- MongoDB local server or MongoDB Atlas database
- A code editor

## Local Setup From A to Z

1. Open the project folder.

2. Install backend packages.

```bash
cd backend
npm install
```

3. Create the backend environment file.

```bash
copy .env.example .env
```

4. Edit `backend/.env`.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

5. Install frontend packages.

```bash
cd ../frontend
npm install
```

6. Create the frontend environment file.

```bash
copy .env.example .env
```

7. Edit `frontend/.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

8. Start the backend.

```bash
cd ../backend
npm run dev
```

9. Start the frontend in another terminal.

```bash
cd frontend
npm run dev
```

10. Open the frontend URL shown by Vite, normally:

```text
http://localhost:5173
```

## Default Seeded Accounts

When the backend starts with an empty database, it automatically creates:

```text
Admin:
Email: admin@healthcare.com
Password: admin123

Doctors:
sarah@healthcare.com / doctor123
```

Change these passwords before real deployment.

## MongoDB Setup

The separate MongoDB database connection file is:

```text
backend/config/db.js
```

This file reads:

```env
MONGODB_URI=your_mongodb_connection_string
```

For local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/smart-healthcare?retryWrites=true&w=majority
```

MongoDB Atlas process:

1. Create a MongoDB Atlas account.
2. Create a new cluster.
3. Create a database user.
4. Add your IP address or `0.0.0.0/0` for deployment access.
5. Copy the connection string.
6. Replace username, password, and database name.
7. Add the final value as `MONGODB_URI` in your backend hosting environment variables.

## Backend Guide

The backend is an Express API.

Important files:

- `backend/server.js`: starts Express, enables CORS, connects routes, connects MongoDB, and seeds default data.
- `backend/config/db.js`: MongoDB connection.
- `backend/config/features.js`: all optional feature flags.
- `backend/middleware/auth.js`: protects private routes.
- `backend/models/`: database schemas.
- `backend/routes/`: API endpoints.
- `backend/utils/`: helper services for OTP, email, SMS, WhatsApp, push, AI, notifications, and receipts.

Backend scripts:

```bash
npm run dev
npm start
```

Backend health check:

```text
GET /api/health
```

## Frontend Guide

The frontend is a React + Vite app.

Important files:

- `frontend/src/App.jsx`: all page routes.
- `frontend/src/api/axios.js`: backend API connection and token handling.
- `frontend/src/context/AuthContext.jsx`: login state.
- `frontend/src/components/ProtectedRoute.jsx`: role-based page protection.
- `frontend/src/config/features.js`: frontend feature defaults loaded from backend.
- `frontend/src/pages/public/`: public pages.
- `frontend/src/pages/patient/`: patient pages.
- `frontend/src/pages/doctor/`: doctor pages.
- `frontend/src/pages/admin/`: admin pages.
- `frontend/src/pages/shared/`: shared profile and settings pages.

Frontend scripts:

```bash
npm run dev
npm run build
npm run preview
```

## API Route Overview

```text
/api/auth              Register, login, profile, password reset, OTP, feature flags
/api/doctors           Doctor list and admin doctor management
/api/appointments      Appointment booking and appointment management
/api/medical-records   Patient medical records
/api/ai                AI assistant responses
/api/patients          Patient management
/api/upload            File uploads
/api/notifications     In-app notifications
/api/settings          System settings
/api/hero              Landing page hero slides
/api/payments          Payment records and gateway placeholders
/api/receipts          PDF receipt download
/api/health            Backend health check
```

## Feature Flag System

All optional features are controlled from:

```text
backend/config/features.js
frontend/src/config/features.js
backend/.env
```

Basic process for every optional feature:

1. Add the required API package if the commented code needs one.
2. Add the required keys to `backend/.env` or your online hosting variables.
3. Set the matching `*_ENABLED=true`.
4. Uncomment the provider block in the related backend utility or route file.
5. Restart the backend.
6. Test the full user flow from the frontend.

## Enable OTP Verification

Purpose:

- Registration OTP
- Login OTP
- Password reset OTP

Files:

```text
backend/config/features.js
backend/utils/otp.js
backend/routes/auth.js
frontend/src/pages/public/RegisterPage.jsx
frontend/src/pages/public/LoginPage.jsx
frontend/src/pages/public/ForgotPasswordPage.jsx
frontend/src/pages/public/ResetPasswordPage.jsx
```

Environment:

```env
OTP_ENABLED=true
OTP_EXPIRY_MINUTES=10
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

Implementation steps:

1. Install the provider package if needed.

```bash
cd backend
npm install twilio
```

2. Open `backend/utils/otp.js`.
3. Uncomment the Twilio SMS integration block.
4. Make sure the function sends the generated OTP to the user phone number.
5. Restart backend.
6. Register a test patient with a phone number.
7. Confirm the first request sends OTP and the second request verifies OTP.

Alternative provider:

- Use MSG91 by adding `MSG91_AUTH_KEY` and `MSG91_SENDER_ID`, then uncomment or implement the MSG91 block in `backend/utils/otp.js`.

## Enable Email Verification And Password Reset Emails

Purpose:

- Email verification after registration
- Password reset email
- Transactional notification foundation

Files:

```text
backend/config/features.js
backend/utils/email.js
backend/routes/auth.js
frontend/src/pages/public/VerifyEmailPage.jsx
frontend/src/pages/public/ForgotPasswordPage.jsx
frontend/src/pages/public/ResetPasswordPage.jsx
```

Environment for SMTP:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@smarthealthcare.com
CLIENT_URL=http://localhost:5173
```

Implementation steps:

1. Install Nodemailer.

```bash
cd backend
npm install nodemailer
```

2. Open `backend/utils/email.js`.
3. Uncomment the Nodemailer SMTP block.
4. Check that verification links use `CLIENT_URL`.
5. Restart backend.
6. Register a new user.
7. Open the email verification link.
8. Test forgot password.

Production note:

- For Gmail, use an app password, not your normal Gmail password.
- On deployment, set `CLIENT_URL` to the live frontend URL.

## Enable SMS Notifications

Purpose:

- Appointment updates
- Future reminders
- General SMS notifications

Files:

```text
backend/config/features.js
backend/utils/sms.js
backend/utils/notificationChannels.js
```

Environment:

```env
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

Implementation steps:

1. Install Twilio if not already installed.
2. Open `backend/utils/sms.js`.
3. Uncomment the Twilio SMS block.
4. Open `backend/utils/notificationChannels.js`.
5. Connect the SMS channel to the notification flow.
6. Restart backend.
7. Create or update an appointment and confirm SMS delivery.

## Enable WhatsApp Notifications

Purpose:

- WhatsApp appointment alerts
- WhatsApp reminders

Files:

```text
backend/config/features.js
backend/utils/whatsapp.js
backend/utils/notificationChannels.js
```

Environment:

```env
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

Implementation steps:

1. Enable Twilio WhatsApp sandbox or production WhatsApp sender.
2. Install Twilio if needed.
3. Open `backend/utils/whatsapp.js`.
4. Uncomment the Twilio WhatsApp block.
5. Confirm user phone numbers are saved in WhatsApp format.
6. Restart backend.
7. Test with an appointment notification.

## Enable Push Notifications

Purpose:

- Browser or mobile push notifications.

Files:

```text
backend/config/features.js
backend/utils/push.js
backend/utils/notificationChannels.js
frontend/src/pages/shared/SettingsPage.jsx
```

Environment:

```env
PUSH_ENABLED=true
FCM_SERVER_KEY=your_firebase_server_key
```

or:

```env
PUSH_ENABLED=true
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

Implementation steps:

1. Choose Firebase Cloud Messaging or Web Push.
2. Install the required backend package.
3. Open `backend/utils/push.js`.
4. Uncomment and complete the selected provider block.
5. Add frontend service worker and permission request if using browser push.
6. Store each user's push token in the database.
7. Send a test notification from an appointment event.

## Enable Payment Gateway

Purpose:

- Online appointment payment
- Payment verification
- Refund placeholder
- Receipt generation

Files:

```text
backend/config/features.js
backend/routes/payments.js
frontend/src/pages/patient/PaymentPage.jsx
frontend/src/pages/patient/PaymentHistoryPage.jsx
frontend/src/pages/admin/ManagePayments.jsx
backend/utils/pdfReceipt.js
```

Razorpay environment:

```env
PAYMENT_ENABLED=true
PAYMENT_PROVIDER=razorpay
PAYMENT_CURRENCY=INR
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

Stripe environment:

```env
PAYMENT_ENABLED=true
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

Razorpay implementation steps:

1. Install Razorpay backend package.

```bash
cd backend
npm install razorpay
```

2. Open `backend/routes/payments.js`.
3. Uncomment the Razorpay order creation block.
4. Uncomment the Razorpay verification block.
5. Open `frontend/src/pages/patient/PaymentPage.jsx`.
6. Add Razorpay checkout script loading.
7. Uncomment the Razorpay checkout block.
8. Restart backend and frontend.
9. Book an appointment as a patient.
10. Complete test payment.
11. Confirm the payment appears in patient history and admin payment management.
12. Download the receipt.

Stripe implementation steps:

1. Install Stripe packages.
2. Uncomment Stripe blocks in backend and frontend payment files.
3. Add Stripe publishable key to the frontend if needed.
4. Use Stripe test cards before live mode.

## Enable AI Assistant

Purpose:

- Patient health questions
- Symptom guidance
- General healthcare assistant

Files:

```text
backend/config/features.js
backend/utils/aiService.js
backend/routes/ai.js
frontend/src/pages/patient/AIAssistant.jsx
frontend/src/pages/patient/PatientDashboard.jsx
```

OpenAI environment:

```env
AI_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4o-mini
```

Gemini environment:

```env
AI_ENABLED=true
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
```

Implementation steps:

1. Install the selected provider package.
2. Open `backend/utils/aiService.js`.
3. Uncomment the OpenAI or Gemini block.
4. Add a medical safety disclaimer in the AI response if needed.
5. Restart backend.
6. Login as patient.
7. Open AI Assistant.
8. Ask a safe test question and confirm a response returns.

Important safety note:

- AI output should be guidance only. It should not replace a doctor, diagnosis, or emergency care.

## Enable Receipt Improvements

Current receipt support already generates PDF receipts.

Future commented features are in:

```text
backend/utils/pdfReceipt.js
```

Optional improvements:

- Hospital logo
- GST or tax section
- QR verification code
- Digital signature

Implementation process:

1. Add hospital details to `.env`.
2. Add logo upload or static logo path.
3. If tax is required, set `HOSPITAL_GST_NUMBER`.
4. Add QR package if needed.
5. Generate QR using receipt verification URL.
6. Add digital signature only after certificate setup is ready.
7. Test by downloading a receipt after payment.

## Enable Refund Tracking

Files:

```text
backend/models/Payment.js
backend/routes/payments.js
frontend/src/pages/admin/ManagePayments.jsx
```

Implementation process:

1. Enable live payment provider.
2. Store provider payment ID after successful payment.
3. Implement provider refund API in `backend/routes/payments.js`.
4. Save `refundId`, refund status, and refund date in the payment document.
5. Add admin refund button if needed.
6. Test refund in provider test mode.

## Hospital Settings

Add these values in backend environment variables:

```env
HOSPITAL_NAME=Smart Healthcare Clinic
HOSPITAL_ADDRESS=Your hospital address
HOSPITAL_PHONE=Your hospital phone
HOSPITAL_EMAIL=contact@yourhospital.com
HOSPITAL_REG_NUMBER=REG-2024-HC-001
HOSPITAL_GST_NUMBER=your_tax_number
```

These values are used in receipts and notifications.

## Online Deployment Guide

Recommended simple deployment:

- Backend: Render, Railway, Fly.io, or any Node.js hosting
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas

### Deploy Backend

1. Push project to GitHub.
2. Create MongoDB Atlas database.
3. Create a new backend web service.
4. Set root directory to:

```text
backend
```

5. Set build command:

```bash
npm install
```

6. Set start command:

```bash
npm start
```

7. Add environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
```

8. Deploy.
9. Test:

```text
https://your-backend-domain.com/api/health
```

### Deploy Frontend

1. Create a frontend deployment.
2. Set root directory to:

```text
frontend
```

3. Set build command:

```bash
npm run build
```

4. Set output directory:

```text
dist
```

5. Add frontend environment variable:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

6. Deploy.
7. Login with admin account.
8. Change default passwords.

### CORS Setup

Backend CORS uses:

```env
CLIENT_URL=https://your-frontend-domain.com
```

If login works locally but fails online, check:

- `CLIENT_URL` exactly matches the frontend URL.
- `VITE_API_URL` exactly points to backend `/api`.
- Backend is deployed and `/api/health` works.
- MongoDB Atlas allows network access from the backend host.

## Environment Variable Checklist

Minimum backend variables:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=7d
CLIENT_URL=
```

Minimum frontend variables:

```env
VITE_API_URL=
```

Optional backend variables:

```env
OTP_ENABLED=false
EMAIL_ENABLED=false
SMS_ENABLED=false
WHATSAPP_ENABLED=false
PUSH_ENABLED=false
PAYMENT_ENABLED=false
AI_ENABLED=false
```

## Common Problems And Fixes

MongoDB connection error:

- Check `MONGODB_URI`.
- Check MongoDB Atlas username and password.
- Check Atlas network access.
- Make sure special characters in password are URL encoded.

Frontend cannot reach backend:

- Check `VITE_API_URL`.
- Confirm backend `/api/health` works.
- Restart frontend after changing `.env`.

Login redirects back to login:

- Check `JWT_SECRET`.
- Clear browser local storage.
- Confirm backend returns a token.

Payment page says payment is disabled:

- Set `PAYMENT_ENABLED=true`.
- Restart backend.
- Confirm `/api/auth/features` returns `paymentEnabled: true`.

AI assistant gives fallback response:

- Set `AI_ENABLED=true`.
- Add provider API key.
- Uncomment provider code in `backend/utils/aiService.js`.
- Restart backend.

OTP not sending:

- Set `OTP_ENABLED=true`.
- Add provider credentials.
- Install provider package.
- Uncomment provider block in `backend/utils/otp.js`.

## Production Security Checklist

- Change default admin password.
- Use a strong `JWT_SECRET`.
- Do not commit `.env` files.
- Use MongoDB Atlas with a strong database password.
- Restrict MongoDB network access when possible.
- Use HTTPS frontend and backend URLs.
- Enable only the third-party features you actually use.
- Keep provider API keys in hosting environment variables only.
- Review upload limits and file types before public launch.

## Suggested Implementation Order

1. Run app locally with MongoDB.
2. Test login, register, admin dashboard, doctor dashboard, and patient booking.
3. Deploy MongoDB Atlas.
4. Deploy backend.
5. Deploy frontend.
6. Enable email.
7. Enable OTP or SMS if needed.
8. Enable payment gateway.
9. Enable receipt improvements.
10. Enable AI assistant.
11. Enable WhatsApp and push notifications.
12. Final production security review.

