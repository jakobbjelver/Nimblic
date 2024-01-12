import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ThemeToggle from './Theme/ThemeToggle';

const NotFound = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    // Handle scroll event
    const handleScroll = () => {
        const offset = window.scrollY;
        setIsScrolled(offset > 0);
    };

    // Add event listener for scroll
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className="h-screen w-full px-8 lg:px-32 md:px-16 items-center flex justify-center flex-row gap-40 fadeInUp homepage">
                <div className="relative w-full mt-20">
                    <div className="relative">
                        <div>
                            <div className="text-9xl font-nunito font-extrabold text-secondary/10 scale-120">404</div>
                        </div>
                        <div className="relative">
                            <div className="">
                                <h1 className="my-2 font-bold text-2xl text-neutral-content/90 font-nunito">
                                    Looks like you've found the
                                    doorway to the great nothing
                                </h1>
                                <p className="my-2 text-neutral-content/80">Sorry about that! Please visit our hompage to get where you need to go.</p>
                                <button className="btn btn-lg btn-secondary text-neutral mt-6" onClick={() => navigate('/')}>Take me home!</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:flex md:flex hidden">
                    <div className="not-found"></div>
                </div>
            </div>
        </>
    );
};

export default NotFound;

