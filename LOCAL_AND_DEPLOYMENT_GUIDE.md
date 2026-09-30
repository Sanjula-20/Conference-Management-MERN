Here's a cleaner, professionally structured version of your deployment guide with consistent headings, formatting, notes, and checklists.

# Localhost & NEC Deployment Guide

This guide explains how to switch the project between **Localhost** and **NEC Production Deployment**.

---

# Environment Files

The project uses **two actual environment files**:

```text
Conference Frontend/React Files/.env
conferencebackend/conferencebackend/.env
```

These are the **only files** that normally need to be modified when switching environments.

> **Note**
>

---

# Project Structure

## Frontend

```text
Conference Frontend/React Files
```

## Backend

```text
conferencebackend/conferencebackend
```

---

# Switching Between Localhost and NEC

The project uses comments to activate the desired environment.

Lines beginning with `#` are ignored.

Example:

```env
ACTIVE_VALUE=http://localhost:5800
# INACTIVE_VALUE=https://nec.edu.in
```

Only **one environment** should remain active at any time.

* **Localhost:** Uncomment localhost values and comment deployment values.
* **NEC Deployment:** Uncomment deployment values and comment localhost values.

---

# Frontend Configuration

**File**

```text
Conference Frontend/React Files/.env
```

## Localhost Configuration

```env
VITE_API_BASE_URL=http://localhost:5800/icodses
VITE_FRONTEND_BASE_URL=http://localhost:5173

# Deployment
# VITE_API_BASE_URL=https://nec.edu.in/icodses
# VITE_FRONTEND_BASE_URL=https://nec.edu.in/ICoDSES
```

---

## NEC Deployment Configuration

```env
# Localhost
# VITE_API_BASE_URL=http://localhost:5800/icodses
# VITE_FRONTEND_BASE_URL=http://localhost:5173

VITE_API_BASE_URL=https://nec.edu.in/icodses
VITE_FRONTEND_BASE_URL=https://nec.edu.in/ICoDSES
```

### Important Notes

* All frontend environment variables **must begin with** `VITE_`.
* Restart the frontend development server after modifying `.env`.
* Always rebuild the frontend before deploying.

---

# Backend Configuration

**File**

```text
conferencebackend/conferencebackend/.env
```

Keep your actual secrets (Email, Google OAuth, Razorpay, JWT, Session Secret, etc.) in this file.

---

## Localhost Configuration

```env
PORT=5800

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5800
GOOGLE_CALLBACK_URL=http://localhost:5800/icodses/auth/google/callback
CORS_ORIGINS=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=conference_db

# Deployment
# FRONTEND_URL=https://nec.edu.in/ICoDSES
# BACKEND_URL=https://nec.edu.in
# GOOGLE_CALLBACK_URL=https://nec.edu.in/icodses/auth/google/callback
# CORS_ORIGINS=https://nec.edu.in,https://www.nec.edu.in
```

---

## NEC Deployment Configuration

```env
PORT=5800

# Localhost
# FRONTEND_URL=http://localhost:5173
# BACKEND_URL=http://localhost:5800
# GOOGLE_CALLBACK_URL=http://localhost:5800/icodses/auth/google/callback
# CORS_ORIGINS=http://localhost:5173

FRONTEND_URL=https://nec.edu.in/ICoDSES
BACKEND_URL=https://nec.edu.in
GOOGLE_CALLBACK_URL=https://nec.edu.in/icodses/auth/google/callback
CORS_ORIGINS=https://nec.edu.in,https://www.nec.edu.in

DB_HOST=localhost
DB_USER=your_nec_db_user
DB_PASSWORD=your_nec_db_password
DB_NAME=conference_db
```

### Important Notes

Never keep multiple active values for:

* `FRONTEND_URL`
* `BACKEND_URL`
* `GOOGLE_CALLBACK_URL`
* `CORS_ORIGINS`

Restart the backend after making any changes to `.env`.

---

# Running the Project Locally

Open **two terminals**.

---

## Terminal 1 – Backend

```bash
cd "C:\Users\ragur\Desktop\gaaji\conferencebackend\conferencebackend"

npm install
npm run dev
```

Backend URL

```text
http://localhost:5800
```

Expected output

```text
MySQL Pool connected
All models initialized successfully
Server running on 5800
```

---

## Terminal 2 – Frontend

```bash
cd "C:\Users\ragur\Desktop\gaaji\Conference Frontend\React Files"

npm install
npm run dev
```

Frontend URL

```text
http://localhost:5173/ICoDSES/
```

---

# Building the Frontend for NEC Deployment

Before building:

1. Switch the frontend `.env` to the **NEC Deployment** configuration.

Then execute:

```bash
cd "C:\Users\ragur\Desktop\gaaji\Conference Frontend\React Files"

npm run build
```

The production build will be generated in:

```text
Conference Frontend/React Files/dist
```

Deploy the contents of the **dist** folder to the NEC frontend hosting location.

---

# Starting the Backend on the NEC Server

Navigate to the backend project:

```bash
cd conferencebackend/conferencebackend
```

Install dependencies:

```bash
npm install
```

Start normally:

```bash
npm start
```

Or using Nodemon:

```bash
npm run dev
```

Or using PM2:

```bash
pm2 start server.js --name icodses-backend
pm2 save
```

---

# Localhost → NEC Deployment Checklist

* [ ] Comment localhost values in the frontend `.env`.
* [ ] Uncomment NEC values in the frontend `.env`.
* [ ] Comment localhost URL values in the backend `.env`.
* [ ] Uncomment NEC URL values in the backend `.env`.
* [ ] Configure NEC database credentials.
* [ ] Restart the backend.
* [ ] Build the frontend.
* [ ] Deploy the `dist` folder.

---

# NEC → Localhost Checklist

* [ ] Uncomment localhost values in the frontend `.env`.
* [ ] Comment NEC values in the frontend `.env`.
* [ ] Uncomment localhost URL values in the backend `.env`.
* [ ] Comment NEC URL values in the backend `.env`.
* [ ] Configure local database credentials.
* [ ] Restart the backend.
* [ ] Restart the frontend development server.

---

# Troubleshooting

## API Still Calls NEC While Running Locally

Verify the frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5800/icodses
```

Then restart the frontend:

```bash
npm run dev
```

---

## CORS Errors

### Localhost

```env
CORS_ORIGINS=http://localhost:5173
```

### NEC

```env
CORS_ORIGINS=https://nec.edu.in,https://www.nec.edu.in
```

Restart the backend after updating the configuration.

---

## MySQL Access Denied

Verify the following backend variables:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Ensure:

* The database exists.
* The user has sufficient privileges.
* The password is correct.

---

## Google OAuth Callback Error

### Localhost

```env
GOOGLE_CALLBACK_URL=http://localhost:5800/icodses/auth/google/callback
```

### NEC

```env
GOOGLE_CALLBACK_URL=https://nec.edu.in/icodses/auth/google/callback
```

Also ensure the same callback URL is configured in the **Google Cloud Console OAuth Credentials**.

---

# Security

**Never commit real `.env` files to a public Git repository.**

These files contain sensitive credentials such as:

* Database passwords
* Email credentials
* Google OAuth client secrets
* JWT secrets
* Session secrets
* Razorpay API keys

Only commit `.env.example` files containing placeholder values.

This version is organized like a professional project README, with clear sections, consistent formatting, checklists, notes, and troubleshooting for easier maintenance.
