import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import ThemeToggle from '../Theme/ThemeToggle';
import { useModal } from '../Modal/ModalContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertContext } from '../Alert/AlertContext';
import Notifications from './Notifications'

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { notifications, setNotifications } = useContext(AlertContext);
  const { openModal, closeModal, setModalActions, updateModalContent } = useModal();

  const [isNewNotifiaction, setNewNotification] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event
  const handleScroll = () => {
    const offset = window.scrollY;
    setIsScrolled(offset > 0);
  };

  // Add event listener for scroll
  useEffect(() => {
    setModalActions(["Close", "Clear all"])
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setModalActions(["Close", "Clear all"])
    if (notifications?.length > 0) {
      setHasUnreadNotifications(true)
      setNewNotification(true)
      const timer = setTimeout(() => {
        setNewNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }

    updateModalContent(
      <Notifications notifications={notifications}/>
    )
  }, [notifications]);


  const handleRemoveNotifications = () => {
    setNotifications([])
    setHasUnreadNotifications(false)
    localStorage.setItem('notifications', []);
    closeModal();
  };

  const handleOpenNotifications = () => {
    setModalActions(["Close", "Clear all"]);
    openModal(
      <Notifications notifications={notifications}/>,
      handleRemoveNotifications
    );
  };


  return (

    <header className={`navbar top-0 fixed z-[100] transition-all duration-400 py-4 ${currentPath === '/' ? 'shadow-lg bg-base-200 w-full' : 'shadow-sm bg-base-200 lg:w-11/12 xl:w-5/6'} ${isScrolled ? 'bg-transparent backdrop-blur-xl' : ''}`}>
      {currentPath === '/' ?
        <>
          <div className="logo"></div>
          <article className="flex flex-row prose sm:px-8 px-2 items-center justify-center">
            <div className="logo-sm"></div>
            <h1 className="hidden lg:flex md:flex font-nunito text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl">
              Nimblic
            </h1>
          </article>
        </>
        :
        <div className="flex-1 ml-12">
          <div className="form-control flex items-center relative">
            <input type="text" placeholder="Search" className="input input-bordered" />
            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-4 text-secondary" />
          </div>
        </div>
      }
      <div className="flex-grow"></div>
      {/* Navigation Links */}
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0 items-center">
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
          {currentPath === '/' ?
            <li><a><ThemeToggle /></a></li>
            :
            ''}
        </ul>
      </div>
      {/* Right Aligned Actions */}
      <div className="flex-none mr-6">
        {currentPath !== '/' ?
          <div className="dropdown dropdown-end">
            <label tabIndex="0" className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h14M3 11h14m-4 4h4" /></svg>
              <span className="indicator absolute top-1.5 right-1.5">
                <span className={`${isNewNotifiaction ? 'animate-ping opacity-75' : 'opacity-0'} absolute inline-flex h-full w-full rounded-full bg-secondary`}></span>
                <span className={`${hasUnreadNotifications ? 'opacity-100' : 'opacity-0'} inline-flex rounded-full h-3 w-3 bg-secondary transition-all`}></span>
              </span>
            </label>
            <div tabIndex="0" className="mt-3 card card-compact dropdown-content w-52 bg-base-100 shadow">
              <div className="card-body">
                <span className="font-bold text-lg">{notifications?.length} {notifications?.length !== 1 ? 'Notifications' : 'Notification'}</span>
                <span className="text-info">You have {notifications?.length} {hasUnreadNotifications ? 'new' : ''} {notifications?.length !== 1 ? 'messages' : 'message'}</span>
                <div className="card-actions">
                  <button className="btn btn-primary btn-block" onClick={handleOpenNotifications}>View all</button>
                </div>
              </div>
            </div>
          </div>
          :
          <>
          </>
        }
      </div>
    </header>
  );
};

export default Header;
