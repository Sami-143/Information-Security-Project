import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const name = urlParams.get('name');

    if (token && email) {
      localStorage.setItem('token', token);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', name);

      toast.success('Logged in successfully with Google!');
      // navigate('/dashboard'); // or wherever you want to send user
    } else {
      toast.error('Login failed. Please try again.');
      navigate('/signIn');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2 className="text-2xl font-bold">Processing your login...</h2>
    </div>
  );
};

export default OAuthSuccess;
