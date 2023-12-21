import React from 'react';

const Footer = () => {
  return (
    <>
    <div className="grow w-full"></div>
    <footer className="footer footer-center bottom-0 w-full p-10 bg-base-200 text-base-content rounded">
      <div>
        <p className="font-nunito font-extrabold">
          Messer Solutions
        </p> 
        <p>
        © {new Date().getFullYear()} All rights reserved.
        </p>
      </div> 
      <div>
        <div className="grid grid-flow-col gap-4">
          <a href="/terms" className="link link-hover">Terms of Service</a>
          <a href="/privacy" className="link link-hover">Privacy Policy</a>
          <a href="/about" className="link link-hover">About Us</a>
          <a href="/contact" className="link link-hover">Contact</a>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;

