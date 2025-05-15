import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import SignIn from "./Components/Auth/SignIn/SignIn.jsx";
import SignUp from "./Components/Auth/SignUp/SignUp.jsx";
import OTPVerification from "./Components/Auth/OTPVerfication.jsx";
import LandingPage from "./Components/LandingPage/LandingPage.jsx";
import NotFound from "./Components/LandingPage/NotFound.jsx";
import UserDashboard from "./Components/UserDashboard/UserDashboard.jsx";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard.jsx";

// ----- Route Guards -----
const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/signin" replace />;
};

const GuestRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return !token ? children : <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  console.log(user);
  if (!token) return <Navigate to="/signin" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

// ----- App Component -----
const App = () => {
  return (
    <>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest-only Routes */}
        <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
        <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
        <Route path="/otp-verification" element={<GuestRoute><OTPVerification /></GuestRoute>} />

        {/* User Protected Route */}
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />

        {/* Admin Protected Route */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;
