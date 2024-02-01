import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline'

const Footer = () => {
  return (
    <>
      <div className="grow w-full"></div>
      <footer className="footer footer-center bottom-0 w-full p-10 bg-base-200 text-base-content rounded">
        <div className="flex lg:flex-row flex-col items-center justify-evenly w-full lg:gap-0 gap-12">
          <div>
            <div className="scale-75 mb-2">
              <div className="logo"></div>
              <article className="flex flex-row prose px-2 items-center justify-center">
                <div className="logo-sm"></div>
                <h1 className="font-nunito text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl">
                  Nimblic
                </h1>
              </article>
            </div>
            <p className="font-nunito font-extrabold text-xs">
              Messer Solutions
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <div>
            <p className="mb-4 font-nunito font-bold text-[1.15em]">LINKS</p>
            <div className="flex flex-col md:flex-row lg:gap-4 gap-2">
              <a href="/terms-of-service" className="link link-hover">Terms of Service</a>
              <div className="divider md:divider-horizontal my-0"></div>
              <a href="/data-protection-policy" className="link link-hover">Data Protection Policy</a>
              <div className="divider md:divider-horizontal my-0"></div>
              <a href="/contact" className="link link-hover">Contact</a>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:text-right text-center">
            <div className="flex flex-row items-center justify-center gap-1.5">Created by <a className="text-primary underline" href="https://www.linkedin.com/in/jakobbjelver/">Jakob Bjelvér</a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.78 4.97a.75.75 0 0 1 0 1.06L2.81 8l1.97 1.97a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0ZM11.22 4.97a.75.75 0 0 0 0 1.06L13.19 8l-1.97 1.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0ZM8.856 2.008a.75.75 0 0 1 .636.848l-1.5 10.5a.75.75 0 0 1-1.484-.212l1.5-10.5a.75.75 0 0 1 .848-.636Z" clipRule="evenodd" />
            </svg>
            </div>
            <p>Version 0.2.8</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

