import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ThemeToggle from '../Theme/ThemeToggle';
import { useModal } from '../Modal/ModalContext';
import { Link, useLocation } from 'react-router-dom';
import { AlertContext } from '../Alert/AlertContext';
import NotificationsComponent from './NotificationsComponent'
import ChatBar from './Chat/ChatBar'
import UserAvatar from './UserAvatar';
import HeaderMenu from './HeaderMenu';

const Header = ({ isHome }) => {
  const [isChatBarOpen, setIsChatBarOpen] = useState(false); // Add state for popover open

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
      <NotificationsComponent />,
      handleRemoveNotifications
    );
  };


  return (
    <div className="flex items-center justify-center w-screen z-[9999]">
      <header className={`navbar my-4 min-w-fit w-11/12 max-w-screen-xl rounded-3xl top-0 fixed z-[9999] transition-colors duration-400 
      ${isHome ? 'shadow-lg bg-base-200' : isChatBarOpen ? 'shadow-sm bg-base-200 w-[780px] ml-14 lg:w-[780px] xl:w-[780px] transition-none' : 'shadow-sm bg-base-200 lg:right-[5%] xl:left-1/4 lg:w-10/12 xl:w-4/6'} 
      ${isScrolled ? 'bg-opacity-0 backdrop-blur-lg' : ''}`}>
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
          <div className="absolute">
            <ChatBar isChatBarOpen={isChatBarOpen} setIsChatBarOpen={setIsChatBarOpen} />
          </div>
        }
        <div className="flex flex-grow"></div>
        {/* Navigation Links */}
        {!isChatBarOpen && <div className="flex md:flex-row flex-row-reverse gap-2">
          <div className="flex-none">
            <ul className="menu menu-horizontal p-0 items-center flex-row-reverse md:flex-row">
              <HeaderMenu />
              <li className="md:inline hidden"><Link to="https://github.com/jakobbjelver/Nimblic"><FontAwesomeIcon icon={faGithub} size="2xl" /></Link></li>
              {isHome ?
                <li className="md:inline hidden"><a><ThemeToggle /></a></li>
                :
                ''}
            </ul>
          </div>
          <div className="flex-none flex mr-2">
            <UserAvatar />
          </div>
        </div>
        }
        {/* Right Aligned Actions */}
        <div className="flex-none md:mr-6 mr-3">
          {!isHome && !isChatBarOpen ?
            <Popover className="relative">
              <Popover.Button as="label" className='btn btn-ghost btn-circle avatar'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h14M3 11h14m-4 4h4" /></svg>
                <span className="indicator absolute top-1.5 right-1.5">
                  <span className={`${isNewNotifiaction ? 'animate-ping opacity-75' : 'opacity-0'} absolute inline-flex h-full w-full rounded-full bg-secondary`}></span>
                  <span className={`${hasUnreadNotifications ? 'opacity-100' : 'opacity-0'} inline-flex rounded-full h-3 w-3 bg-secondary transition-all`}></span>
                </span>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="md:absolute fixed z-10 mt-4 -translate-x-1/2 md:-translate-x-3/4 left-1/2 min-w-[230px] w-fit">

                  <div className="flex-auto overflow-hidden rounded-3xl bg-base-300 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                    <div className="flex flex-col px-6 py-6 gap-3">
                      <span className="font-bold text-lg">{notifications?.length} {notifications?.length !== 1 ? 'Notifications' : 'Notification'}</span>
                      <span className="text-info">You have {notifications?.length} {hasUnreadNotifications ? 'new' : ''} {notifications?.length !== 1 ? 'messages' : 'message'}</span>
                      <div className="card-actions">
                        <button className="btn btn-primary btn-block btn-sm h-9" onClick={handleOpenNotifications}>View all</button>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
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
