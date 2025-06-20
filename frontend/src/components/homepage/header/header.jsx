import React, { useEffect, useState } from 'react';
import "./header.css";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">
        <a
          href="#header"
          className="logo d-flex align-items-center me-auto me-xl-0"
          onClick={e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
        <img
          src="/assets/img/favicon.svg"
          alt="iDental Logo"
          style={{ height: "32px", marginRight: "8px" }}
        />
        <h1 className="sitename mb-0">iDental Inc.</h1>
        </a>
        <nav id="navmenu" className="navmenu">
          <ul>
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list" />
        </nav>
        <a className="btn-getstarted" href="/login">Book Online</a>
      </div>
    </header>
  );
};

export default Header;