import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4 py-8">
      <div className="max-w-2xl text-center text-white space-y-6">
        <FaExclamationTriangle className="text-yellow-400 text-8xl mx-auto animate-bounce" />

        <h1 className="text-9xl font-extrabold tracking-widest animate-pulse">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold">Page Not Found</h2>
        <p className="text-md md:text-lg text-gray-100">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white text-md font-medium rounded-lg transition-all duration-300"
        >
          <FaArrowLeft />
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
