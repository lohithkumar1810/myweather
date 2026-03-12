# Full-Stack Weather Dashboard

A beautiful, production-ready Weather Dashboard built with the MERN stack (MongoDB, Express, React, Node.js) featuring Vanta.js animated backgrounds, Leaflet interactive mapping, and JWT authentication.

## Project Structure
- `backend/` - Express server, MongoDB integration, Auth API, openweathermap proxy
- `frontend/` - React (Vite) frontend with Tailwind CSS, Vanta clouds, and React-Leaflet map.

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- OpenWeatherMap API Key

## Setup & Execution Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   **Important:** Edit `.env` to include your actual `MONGO_URI`, `JWT_SECRET`, and `OPENWEATHER_API_KEY`.
4. Start the backend server:
   ```bash
   node server.js
   # or for development: npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL=http://localhost:5000/api` points to your backend.
4. Start the frontend developer server:
   ```bash
   npm run dev
   ```
5. Open your browser to the local URL provided by Vite (e.g., `http://localhost:5173`).

## Features
- **JWT Authentication**: Register, Login, and Protected Routes. The first registered user automatically delegates as an Admin.
- **Admin Dashboard**: View all registered users securely.
- **Dynamic Weather**: Current and 5-day forecast using OpenWeatherMap.
- **Interactive Map**: Click anywhere to grab local weather. Start centered upon Geolocation APIs.
- **Animated Glassmorphism UI**: High-end Vanta.js cloud backgrounds with responsive Tailwind styling.
