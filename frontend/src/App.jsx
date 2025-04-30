// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn/SignIn.jsx';
import SignUp from './Components/Auth/SignUp/SignUp.jsx';
import OTPVerification from './Components/Auth/OTPVerfication.jsx'

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/otp-verification" element={OTPVerification} />
    </Routes>
  );
};

export default App;
