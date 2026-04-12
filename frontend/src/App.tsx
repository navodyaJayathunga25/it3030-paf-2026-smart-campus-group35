import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState } from 'react'
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { Layout } from './components/Layout';
// import { Landing } from './pages/Landing';
// import { Login } from './pages/Login';
// import { Register } from './pages/Register';
// import { OAuthCallback } from './pages/OAuthCallback';
// import { Dashboard } from './pages/Dashboard';
// import { Facilities } from './pages/Facilities';
// import { Bookings } from './pages/Bookings';
// import { Tickets } from './pages/Tickets';
// import { Notifications } from './pages/Notifications';
// import { Admin } from './pages/Admin';
// import { UserRole } from './types';

// Protected Route wrapper for role-based access
// const ProtectedRoute = ({
//   children,
//   allowedRoles,
// }: {
//   children: React.ReactNode;
//   allowedRoles?: UserRole[];
// }) => {
//   const { user, isLoading } = useAuth();
//   if (isLoading) return null;
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/dashboard" replace />;
//   }
//   return <>{children}</>;
// };

// function AppRoutes() {
//   return (
//     <Routes>
//       {/* Public routes */}
//       <Route path="/" element={<Landing />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/oauth2/callback" element={<OAuthCallback />} />

//       {/* Protected routes inside Layout */}
//       <Route element={<Layout />}>
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/facilities" element={<Facilities />} />
//         <Route path="/bookings" element={<Bookings />} />
//         <Route path="/tickets" element={<Tickets />} />
//         <Route path="/notifications" element={<Notifications />} />
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
//               <Admin />
//             </ProtectedRoute>
//           }
//         />
//       </Route>

//       {/* Catch-all */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppRoutes />
//         <Toaster position="top-right" richColors />
//       </Router>
//     </AuthProvider>
//   );
// }

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          {/* <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" /> */}
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              {/* <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a> */}
            </li>
            <li>
              {/* <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a> */}
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
