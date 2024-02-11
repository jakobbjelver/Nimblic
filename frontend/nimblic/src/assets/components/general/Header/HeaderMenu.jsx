import { Fragment, useEffect, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChatBubbleOvalLeftIcon, SparklesIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useNavigate, Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import ThemeToggle from '../Theme/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ReactDOM from 'react-dom';

import { ShieldCheckIcon, QuestionMarkCircleIcon, CurrencyDollarIcon, BoltIcon } from '@heroicons/react/24/outline'

const solutions = [
  { name: 'Features', description: "Get to know the app and its benefits", link: '/#features', icon: BoltIcon, isHash: true },
  { name: 'Privacy Policy', description: 'Your data will be safe and secure', link: '/data-protection-policy', icon: ShieldCheckIcon, isHash: false },
  { name: 'FAQ', description: "Find answers to common questions", link: '/#faq', icon: QuestionMarkCircleIcon, isHash: true },
  { name: 'Pricing', description: 'Explore solutions that fits your needs', link: '/#pricing', icon: CurrencyDollarIcon, isHash: true },
]
const callsToAction = [
  { name: 'Upgrade', link: '/contact', icon: SparklesIcon },
  { name: 'Contact us', link: '/contact', icon: ChatBubbleOvalLeftIcon },
]

export default function HeaderMenu() {
  const navigate = useNavigate();

  const handleItemClick = (link, isHash = false) => {

    if (link) {
      if (isHash) {
        // For hash links, use the navigate function from react-router
        navigate(link);
      } else {
        // For regular links, use the window location
        window.location.href = link;
      }
    }
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
      <Popover.Button className="outline-none">
          <>
            <label className='swap ui-open:swap-active btn btn-circle btn-ghost md:hidden'>
              <Bars3Icon className="h-8 w-8 swap-off" aria-hidden="true" />
              <XMarkIcon className="h-8 w-8 swap-on" aria-hidden="true" />
            </label>
            <label className="md:btn hidden md:btn-ghost">
              <p className="text-lg">About</p>
            <ChevronDownIcon className="h-5 w-5 ui-open:rotate-180 ui-open:transform duration-200" />
            </label>
          </>
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
        <Popover.Panel className="md:absolute md:px-0 px-4 fixed left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2">
          <div className="w-screen max-w-sm flex-auto overflow-hidden rounded-3xl bg-base-300 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
            <div className="px-2 pt-4 md:px-6 md:py-6">
              {solutions.map((item) => (
                <div key={item.name} className="group relative flex md:gap-x-6 gap-x-4 rounded-lg p-4 hover:bg-base-100">
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-base-100 group-hover:bg-base-300">
                    <item.icon className="h-6 w-6 text-base-content group-hover:text-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    {!item.isHash &&
                      <button onClick={() => handleItemClick(item.link, item.isHash)} className="font-semibold text-base-content">
                        {item.name}
                        <span className="absolute inset-0" />
                      </button>
                    }
                    {item.isHash &&
                      <HashLink onClick={() => handleItemClick(item.link, item.isHash)} to={item.link} className="font-semibold text-base-content">
                        {item.name}
                        <span className="absolute inset-0" />
                      </HashLink>
                    }
                    <p className="mt-1 text-neutral-content/80 text-[0.9em]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
              <ul className="flex flex-row items-center justify-evenly w-full my-4 md:hidden">
                <li className="flex flex-col items-center">
                  <Link to="https://github.com/jakobbjelver/Nimblic" className="btn btn-ghost">
                    <FontAwesomeIcon icon={faGithub} size="2xl" />
                    </Link>
                    GitHub
                    </li>
                <li className="flex flex-col items-center"><ThemeToggle />Theme</li>
              </ul>
            <div className="grid grid-cols-2 divide-x divide-neutral-content/5 bg-base-200">
              {callsToAction.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-base-content hover:bg-base-100"
                  onClick={handleItemClick}
                >
                  <item.icon className="h-5 w-5 flex-none text-neutral-content/40" aria-hidden="true" />
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
      {/* Overlay rendered using a portal */}
      {open && ReactDOM.createPortal(
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-30 z-50" onClick={close}>
            </div>,
            document.body
          )}
      </>
      )}
    </Popover>
  )
}
