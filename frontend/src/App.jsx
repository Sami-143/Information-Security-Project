// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn/SignIn.jsx';
import SignUp from './Components/Auth/SignUp/SignUp.jsx';
import OTPVerification from './Components/Auth/OTPVerfication.jsx'
import NotFound from './Components/LandingPage/NotFound.jsx';
import LandingPage from './Components/LandingPage/LandingPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signIn" element={<SignIn />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/" element={<LandingPage/>} />
    </Routes>
  );
};

export default App;
