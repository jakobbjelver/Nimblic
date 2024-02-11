import { CheckIcon } from '@heroicons/react/20/solid'
import React, { useState, useEffect, useRef } from 'react';

const includedFeatures = [
  'File size limit: 50 MB (Free: 10 MB)',
  'Daily upload limit: 100 (Free: 5)',
  'Chat credits: 100/day (Free: 10)',
  'Unlimited analysis storage (Free: 10)',
  'Full support from the team',
  'Opportunity to influence the development of the app',
]

export default function Pricing() {

  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  const containerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => setVisible(entry.isIntersecting));
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
}, []);

useEffect(() => {
  if (visible) {
    setPulse(true)
    const timer = setTimeout(() => {
      setPulse(false)
  }, 200);

  return () => clearTimeout(timer);
  }
}, [visible]);

  return (
    <div className="py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h3 className="group md:text-5xl font-bold py-4 tracking-tight text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-info to-secondary">
            Simple no-tricks pricing
            <a href="#pricing" className="md:text-4xl text-xl ml-2 opacity-0 group-hover:opacity-100 bg-clip-text text-transparent bg-gradient-to-r from-primary/60 via-info/60 to-secondary/60 no-underline hover:from-primary hover:via-info hover:to-secondary">#</a>
          </h3>
          <p className="md:mt-4 mt-0 text-lg leading-8 ">
            Get the solution that fits your needs and support a growing service in the meantime.
          </p>
        </div>
        <div className="bg-base-300/50 mx-auto mt-8 max-w-2xl rounded-3xl ring-1 ring-neutral-content/5 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight font-nunito">Enterprise subscription</h3>
            <p className="mt-6 text-base leading-7 ">
              As with the app, the pricing is flexible and can always be tailored to your needs. Do you need a pay as you go-plan? We got you covered. Higher upload limit? No problems.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-secondary">What's included</h4>
              <div className="h-px flex-auto " />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-5 flex-none text-secondary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl py-10 text-center ring-1 ring-inset bg-base-300 ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold ">Starting at</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight ">€99</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide ">EUR / year</span>
                </p>
                <a
                  href="/contact"
                  className={`btn btn-lg btn-primary mt-10 text-base-300 ${pulse ? 'animate-pulse' : ''}`}
                  ref={containerRef}
                >
                  Contact sales
                </a>
                <p className="mt-6 text-xs leading-5 ">
                  Get access to a preview and contact us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
