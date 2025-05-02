import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
      {/* Background Image - Cybersecurity themed */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-70"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-vector/cyber-security-concept_23-2148532223.jpg')",
        }}
      ></div>

      {/* Overlay content */}
      <div className="relative z-10 text-center max-w-2xl px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Welcome to CyberSecure
        </h1>
        <p className="text-lg md:text-xl text-blue-200 mb-10">
          Your Digital Safety Starts Here. Protecting identities, assets, and systems.
        </p>

        <Link
          to="/signin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition duration-300 shadow-lg"
        >
          Login
        </Link>
      </div>

      {/* Dark overlay to improve text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-0"></div>
    </div>
  );
};

export default LandingPage;
