# Frontend - Promptiva React Application

This is a modern React 19 application with Vite, providing a beautiful user interface for the Promptiva AI content generation engine.

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+ (includes npm)
- Ensure Backend is running on http://localhost:8000

### Installation

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Application runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
frontend/
├── .env                  # Environment variables
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── eslint.config.js      # Linting rules
│
├── public/               # Static assets
│   └── ...
│
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Root component with routing
    ├── index.css         # Global styles
    │
    ├── pages/            # Page components (full pages)
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── Home.jsx
    │
    ├── components/       # Reusable components
    │   ├── ModelSelector.jsx
    │   ├── ResponseCard.jsx
    │   └── QuoteCarousel.jsx
    │
    └── services/         # API & utilities
        └── api.js        # Axios API client
```

---

## 🎨 Pages Overview

### `pages/Login.jsx` - Login Page

**Purpose:** Authenticate existing users

**Features:**
- Email and password input
- Form validation before submission
- Error message display
- Loading state
- Link to Register page
- Beautiful gradient UI

---

### `pages/Register.jsx` - Registration Page

**Purpose:** Create new user accounts

**Features:**
- Email input with format validation
- Username input with length validation
- Password input with confirmation
- Real-time error messages
- Beautiful gradient UI matching Login

---

### `pages/Home.jsx` - Main Application

**Purpose:** Content generation interface

**Features:**
- Prompt input textarea
- Comparison toggle checkbox
- Generate button with loading state
- Model responses display (grid layout)
- Winner response with 🏆 badge
- History sidebar with recent generations
- Logout button
- Error handling

---

## 🔐 Authentication Flow

### Protected Routes

All routes in the application use React Router with protected routes that check authentication status before rendering.

```jsx
<ProtectedRoute>
  <Home />
</ProtectedRoute>
```

---

## 🌐 API Integration

### API Client (`services/api.js`)

Centralized HTTP requests with automatic token injection via Axios interceptors.

**Available Functions:**
- `register()` - Create new account
- `login()` - Authenticate user
- `generateContent()` - Call generation endpoint
- `getHistory()` - Retrieve user history

---

## 🎨 Styling

**Design System:**
- Color Gradient: `#FF9500` to `#FF6B35`
- Background: `#0a0e27`
- Surface: `#1a1f3a`
- Responsive grid layout for all screen sizes

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| react | UI framework |
| react-router-dom | Client routing |
| axios | HTTP client |
| vite | Build tool |

---

## 🚀 Development

### Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Run linter
npm run lint
```

---

## 🚀 Production Build

```bash
npm run build
```

Creates optimized bundle in `dist/` folder ready for deployment.

---

## 📚 Related Documentation

- [Backend README](../Backend/README.md) - Backend overview
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md) - Production readiness

---

**Status**: ✅ Production Ready  
**Last Updated**: March 2024
