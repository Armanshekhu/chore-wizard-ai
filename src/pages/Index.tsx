
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simply navigate to the dashboard since we've set up complete routes
    navigate('/');
  }, [navigate]);

  return null;
};

export default Index;
