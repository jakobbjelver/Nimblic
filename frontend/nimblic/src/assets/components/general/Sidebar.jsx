import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCompass, faDatabase, faCog, faCircleQuestion, faChartSimple, faMedal } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './Theme/ThemeToggle';
import { ChatBubbleOvalLeftEllipsisIcon} from '@heroicons/react/24/outline'
import { HashLink } from 'react-router-hash-link';


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(location.pathname);

  useEffect(() => {
    setSelected(location.pathname)
  }, [location]);

  const menuItems = [
    { name: 'New upload', icon: faUpload, href: '/new-upload' },
    { name: 'Explore', icon: faCompass, href: '/explore' },
    { name: 'Statistics', icon: faChartSimple, href: '/statistics' },
    { name: 'Data Quality', icon: faMedal, href: '/data-quality' },
    { name: 'View data', icon: faDatabase, href: '/view-data' },
    { name: 'Settings', icon: faCog, href: '/settings' },
  ];

  const handleItemClick = (item) => {
    navigate(item.href);
  };

  return (
    <>
      <div className={`fixed top-0 z-10 xl:w-1/6 lg:w-1/12 md:w-1/12 h-screen p-6 bg-base-200 shadow-md flex flex-col space-y-4 justify-between`}>
        <nav className="flex flex-col space-y-4 justify-between h-screen">
          <Link to="/">
            <button className="flex flex-row prose mr-5 pb-10 items-center justify-center">
              <div className="logo-sm"></div>
              <h1 className="md:hidden lg:hidden xl:flex font-nunito text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl">
                Nimblic
              </h1>
            </button>
          </Link>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`btn md:w-fit lg:w-fit xl:w-full flex space-x-3 xl:pr-0 shadow-none border-none rounded-lg text-lg justify-start transition-all ${selected === item.href ? 'text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90' : 'bg-base-300 hover:bg-base-100'}`}
              onClick={() => handleItemClick(item)} // Pass the item object
            >
              <FontAwesomeIcon icon={item.icon} />            
                <span className="md:hidden lg:hidden xl:flex 2xl:flex">{item.name}</span>
            </button>
          ))}

          <div className="flex-grow"></div>
          <div className="flex xl:flex-row lg:flex-col md:flex-col md:gap-4 lg:px-2 lg:gap-4 xl:px-12 items-center justify-between py-8">
            <ThemeToggle />
            <HashLink to="/settings/#feedback">
            <ChatBubbleOvalLeftEllipsisIcon className="h-9 w-9" aria-hidden="true" />
            </HashLink>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
