import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import Preferences from './Page/Preferences/Preferences';
import Feedback from './Page/Feedback/Feedback';
import AccountManagement from './Page/Account/AccountManagement';
import userManager from '../../services/user/userManager';
import { useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SettingsPage() {

  const navigate = useNavigate()
  const location = useLocation()
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function checkUserStatus() {
      await userManager.waitForUserLoad();

      if (!userManager.getUserAuth()) {
        navigate('/') //Should be accessible even when no analysis is found
      }
    }

    // Determine the initial tab based on URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const tabIndex = tabNames.indexOf(hash);
      if (tabIndex !== -1) {
        setSelectedTabIndex(tabIndex);
      }
    }

    checkUserStatus()
  }, [window.location.hash]);

  const tabNames = ['preferences', 'account', 'feedback'];
  let [sections] = useState({
    Preferences: [{ id: 1, content: <Preferences /> }],
    Account: [{ id: 1, content: <AccountManagement /> }],
    Feedback: [{ id: 1, content: <Feedback /> }],
  });

  const handleTabChange = (index) => {
    setSelectedTabIndex(index);
    const hash = tabNames[index];
    window.location.hash = hash;
  };

  return (
    <div className="w-full max-w-screen-xl overflow-x-hidden bg-base-100 md:px-12 px-4 py-4 fadeInUp mt-20 flex flex-col items-center">
      <Tab.Group selectedIndex={selectedTabIndex} onChange={handleTabChange}>
        <Tab.List className="md:w-1/3 w-full flex space-x-1 rounded-xl bg-base-200 p-1">
          {Object.keys(sections).map((section) => (
            <Tab
              key={section}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-neutral/60 text-neutral-content/90 ring-offset-2 ring-offset-primary/50 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-base-300/95 text-primary/90 shadow'
                    : ' hover:bg-base-100/50 hover:text-neutral-content'
                )
              }
            >
              {section}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="md:mt-6 mt-4 w-full">
          {Object.values(sections).map((components, idx) => (
            <Tab.Panel
              key={idx}
            >
              <ul>
                {components.map((component) => (
                  <li
                    key={component.id}
                    className="flex flex-col items-center"
                  >
                    {component.content}
                  </li>
                ))}
              </ul>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}


