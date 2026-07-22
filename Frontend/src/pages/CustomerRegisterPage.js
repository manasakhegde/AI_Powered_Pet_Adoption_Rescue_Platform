import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Register is now handled inside CustomerLoginPage via the Sign Up toggle
function CustomerRegisterPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/customer/login', { replace: true });
  }, [navigate]);
  return null;
}

export default CustomerRegisterPage;
