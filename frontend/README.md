# Frontend

React frontend application built with Vite and TypeScript.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

The default configuration should work for local development:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=Take Home Exam
```

### 3. Start Development Server
```bash
npm run dev
# or
npm start
```

Frontend will run on `http://localhost:3000`

## Available Scripts

- `npm run dev` / `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/src/
├── components/         # Reusable components
│   ├── common/        # Shared UI components
│   │   ├── Layout.tsx
│   │   └── PrivateRoute.tsx
│   └── features/      # Feature-specific components
├── pages/             # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── ItemsPage.tsx
├── contexts/          # React Context providers
│   └── AuthContext.tsx
├── services/          # API services
│   └── api.ts
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
├── types/             # TypeScript type definitions
├── styles/            # Global styles
│   └── index.css
├── App.tsx            # Main app component
└── index.tsx          # Entry point
```

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Automatic token refresh
- Protected routes

### Items Management
- View all items
- Create new items
- Edit existing items
- Delete items
- Filter by status

### Routing
- React Router for navigation
- Protected routes requiring authentication
- Automatic redirect to login if not authenticated

## Components

### Layout
Main layout component with navigation header and content area.

### PrivateRoute
Higher-order component for protecting routes that require authentication.

### AuthContext
Global state management for authentication using React Context API.

## API Integration

The frontend communicates with the backend API through Axios:

```typescript
// Example API call
import { itemsAPI } from './services/api';

const items = await itemsAPI.getAll();
```

### API Service Structure
- `authAPI` - Authentication endpoints
- `itemsAPI` - Items CRUD operations

### Authentication Flow
1. User logs in → receives JWT token
2. Token stored in localStorage
3. Token automatically included in API requests via interceptor
4. On 401 response, user redirected to login

## Styling

Basic CSS with custom styles. Can be easily replaced with:
- **Tailwind CSS**: For utility-first styling
- **Material-UI**: For Material Design components
- **Chakra UI**: For accessible components
- **Ant Design**: For enterprise-grade UI

## State Management

Currently uses:
- React Context API for global auth state
- Component state (useState) for local state

Can be upgraded to Redux or Zustand for more complex state management needs.

## Development Tips

### Hot Module Replacement
Vite provides fast HMR - changes reflect instantly.

### Path Aliases
TypeScript paths are configured for cleaner imports:
```typescript
import Layout from '@components/common/Layout';
import { useAuth } from '@contexts/AuthContext';
```

### API Proxy
Vite proxy configured to forward `/api` requests to backend during development.

## Building for Production

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 3001
- Check VITE_API_URL in .env file
- Verify CORS is enabled on backend

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Authentication Issues
- Clear localStorage: Open DevTools → Application → Clear Storage
- Check token expiration in backend logs
