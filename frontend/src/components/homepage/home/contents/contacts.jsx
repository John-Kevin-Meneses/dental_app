import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Contacts() {
  return (
        <section id="contact" className="contact section">
            <div className="container section-title" data-aos="fade-up">
                <h2>Contact Us</h2>
            </div>
            <div className="container" data-aos="fade-up" data-aos-delay={100}>
                <div className="row gy-4 mb-5">
                <div className="col-lg-4" data-aos="fade-up" data-aos-delay={100}>
                    <div className="info-card">
                    <div className="icon-box">
                        <i className="bi bi-geo-alt" />
                    </div>
                    <h3>Our Address</h3>
                    <p>2847 Rainbow Road, Springfield, IL 62701, USA</p>
                    </div>
                </div>
                <div className="col-lg-4" data-aos="fade-up" data-aos-delay={200}>
                    <div className="info-card">
                    <div className="icon-box">
                        <i className="bi bi-telephone" />
                    </div>
                    <h3>Contact Number</h3>
                    <p>Mobile: +1 (555) 123-4567<br />
                        Email: info@example.com</p>
                    </div>
                </div>
                <div className="col-lg-4" data-aos="fade-up" data-aos-delay={300}>
                    <div className="info-card">
                    <div className="icon-box">
                        <i className="bi bi-clock" />
                    </div>
                    <h3>Opening Hour</h3>
                    <p>Monday - Saturday: 9:00 - 18:00<br />
                        Sunday: Closed</p>
                    </div>
                </div>
                </div>
            </div>
        </section>
  )
}

export default Contacts
