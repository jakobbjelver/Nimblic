import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/20/solid'
import React, { useState } from 'react';

import { Link } from 'react-router-dom'
export default function Banner() {

  const [isDismissed, setDismissed] = useState(false)

  return (
    <>
      <div className={`${isDismissed ? 'hidden' : 'sticky'} [@supports(color:oklch(0_0_0))] z-[99] bottom-0 w-full isolate flex items-center gap-x-6 overflow-hidden bg-base-300 px-6 py-2.5 sm:px-3.5 sm:before:flex-1`}>
        <div
          className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-primary to-info opacity-30"
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
          />
        </div>
        <div
          className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-secondary to-info opacity-30"
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="text-sm leading-6">
            <strong className="font-semibold md:inline hidden">Read our blog</strong>
            <strong className="font-semibold md:hidden inline">Check out our new blog</strong>
            <svg viewBox="0 0 2 2" className="mx-2 h-0.5 w-0.5 fill-current md:inline hidden" aria-hidden="true">
              <circle cx={1} cy={1} r={1} />
            </svg>
            <p className="md:inline hidden">Check out the blog to stay updated on the latest news.</p>
          </div>
          <Link
            to="/blog"
            className="flex flex-row items-center gap-2 rounded-full text-neutral bg-neutral-content px-3.5 py-1 text-sm font-semibold shadow-sm hover:bg-neutral-content/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Read <span aria-hidden="true"><ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </div>
        <div className="flex flex-1 justify-end">
          <button type="button" onClick={
            () => {
              setDismissed(true);
            }
          } className="-m-3 p-3 focus-visible:outline-offset-[-4px]">
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}
