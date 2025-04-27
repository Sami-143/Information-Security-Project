// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn/SignIn.jsx';
import SignUp from './Components/Auth/SignUp/SignUp.jsx';
import OAuthSuccess from './Components/Auth/OAuthSuccess.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<SignIn />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
    </Routes>
  );
};

export default App;
