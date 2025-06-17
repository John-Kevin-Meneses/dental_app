import React from 'react'
import "./header.css"
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';


const Header = () => {
  return (
      <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">
        <a href="index.html" className="logo d-flex align-items-center me-auto me-xl-0">
          {/* Uncomment the line below if you also wish to use an image logo */}
          {/* <img src="assets/img/logo.webp" alt=""> */}
          <h1 className="sitename">iDental</h1>
        </a>
        <nav id="navmenu" className="navmenu">
          <ul>
            <li><a href="#hero">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list" />
        </nav>
        <a className="btn btn-primary" href="#about">Book Online</a>
      </div>
    </header>

  )
}

export default Header
