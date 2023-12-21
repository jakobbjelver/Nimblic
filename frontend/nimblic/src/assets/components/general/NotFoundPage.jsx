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
            <header className={`navbar top-0 sticky z-[100] transition-all duration-400 py-4 shadow-md ${isScrolled ? 'bg-transparent backdrop-blur-xl' : ''}`}>
            <Link to="/">
                        <div className="logo"></div>
                        <article className="flex flex-row prose px-8 items-center justify-center">
                            <div className="logo-sm"></div>
                            <h1 className="font-nunito text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl hidden lg:flex md:flex">
                                Nimblic
                            </h1>
                        </article>
                        </Link>
                <div className="flex-grow"></div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal p-0 items-center pr-6">
                        <li tabIndex="0" className="dropdown-end">
                            <details>
                                <summary className="text-lg">
                                    About
                                </summary>
                                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <Link to="/#" className="justify-between">
                                            Guided Tour
                                            <span className="badge">New</span>
                                        </Link>
                                    </li>
                                    <li><Link to="/#">Data Protection Policy</Link></li>
                                    <li><Link to="/#">Contact</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li><a><FontAwesomeIcon icon={faGithub} size="2xl" /></a></li>
                        <li><a><ThemeToggle /></a></li>
                    </ul>
                </div>
            </header>
            <div className="h-screen w-full px-8 lg:px-32 md:px-16 items-center flex justify-center flex-row gap-40 fadeInUp homepage">
                <div className="relative w-full">
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

