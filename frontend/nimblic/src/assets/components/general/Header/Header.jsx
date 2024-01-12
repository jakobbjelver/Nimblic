import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ThemeToggle from '../Theme/ThemeToggle';
import { useModal } from '../Modal/ModalContext';
import { Link, useLocation } from 'react-router-dom';
import { AlertContext } from '../Alert/AlertContext';
import NotificationsComponent from './NotificationsComponent'
import ChatBar from './ChatBar'
import UserAvatar from './UserAvatar';
import HeaderMenu from './HeaderMenu';

const Header = ( { isHome }) => {
  const location = useLocation();

  //const isHome = location.pathname == '/' || location.pathname == '/contact' || location.pathname == '/data-protection-policy' || location.pathname == '/terms-of-service';

  const { notifications, setNotifications } = useContext(AlertContext);
  const { openModal, closeModal, setModalActions, updateModalContent } = useModal();

  const [isNewNotifiaction, setNewNotification] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll event
  const handleScroll = () => {
    const offset = window.scrollY;
    setIsScrolled(offset > 0);
  };

  // Add event listener for scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (notifications?.length > 0) {
      setHasUnreadNotifications(true)
      setNewNotification(true)
      const timer = setTimeout(() => {
        setNewNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
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
      <NotificationsComponent/>,
      handleRemoveNotifications
    );
  };


  return (
    <div className="flex items-center justify-center w-screen">
    <header className={`navbar my-4 min-w-fit w-11/12 max-w-screen-xl rounded-3xl top-0 fixed z-[100] transition-all duration-400 ${isHome ? 'shadow-lg bg-base-200' : 'shadow-sm bg-base-200 lg:right-[5%] xl:left-1/4 lg:w-10/12 xl:w-4/6'} ${isScrolled ? 'bg-transparent backdrop-blur-xl' : ''}`}>
      {isHome ?
        <Link to="/">

          <div className="logo"></div>
          <article className="flex flex-row prose sm:px-8 px-2 items-center justify-center">
            <div className="logo-sm"></div>
            <h1 className="hidden lg:flex md:flex font-nunito text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl">
              Nimblic
            </h1>
          </article>
        </Link>
        :
        <ChatBar />
      }
      <div className="flex grow"></div>
      {/* Navigation Links */}
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0 items-center flex-row-reverse md:flex-row">
          <HeaderMenu />
          <li><Link to="https://github.com/jakobbjelver/Nimblic"><FontAwesomeIcon icon={faGithub} size="2xl" /></Link></li>
          {isHome ?
            <li><a><ThemeToggle /></a></li>
            :
            ''}
        </ul>
      </div>
      <div className="md:flex-none md:flex mr-2 hidden">
        <UserAvatar />
      </div>
      {/* Right Aligned Actions */}
      <div className="flex-none mr-6">
        {!isHome ?
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
    </div>
  );
};

export default Header;
