import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Login from './Login';
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from

    const handleLoginSuccess = () => {
        // Clear the stored path to prevent future unintended redirects
        localStorage.removeItem('preLoginPath');
        
        if (from) {
            navigate(from);
        } else {
            navigate('/');
        }
    };

    return (
        <>
            <div className="h-screen w-full px-8 lg:px-32 md:px-16 items-center flex justify-center fadeInUp homepage">
                <div className="w-full max-w-xl min-w-fit bg-base-300 flex items-center justify-center rounded-3xl py-6 px-6 mt-20">
                    <Login onLoginSuccess={handleLoginSuccess}/>
                </div>
            </div>
        </>
    );
};

export default LoginPage;

