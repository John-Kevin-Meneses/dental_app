import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Main() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section id="hero" className="hero section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row align-items-center mb-5">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="badge-wrapper mb-3">
              <div className="d-inline-flex align-items-center rounded-pill border border-accent-light">
                <div className="icon-circle me-2">
                  <i className="bi bi-bell"></i>
                </div>
                <span className="badge-text me-3">iDental Inc.</span>
              </div>
            </div>
            <h1 className="hero-title mb-4">
              For The Smile You Deserve
            </h1>
            <p className="hero-description mb-4">
              At iDental Inc., we combine compassionate care with cutting-edge dental technology to deliver precise, comfortable, and personalized treatments—giving you every reason to smile with confidence.
            </p>
            <div className="cta-wrapper">
              <a href="#" className="btn btn-primary">Discover More</a>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image">
              <img src="assets/img/illustration/cosmetic-dentist-smile.jpg" alt="Dentist" className="img-fluid" loading="lazy" />
            </div>
          </div>
        </div>
        <div className="row feature-boxes">
          <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay="200">
            <div className="feature-box">
              <div className="feature-icon me-sm-4 mb-3 mb-sm-0">
                <i className="bi bi-clock"></i>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Extended or Flexible Hours</h3>
                <p className="feature-text">
                  Open early, late, or on weekends. Emergency dental services.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-box">
              <div className="feature-icon me-sm-4 mb-3 mb-sm-0">
                <i className="bi bi-currency-dollar"></i>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Affordable Service</h3>
                <p className="feature-text">
                 Offer transparent pricing with no hidden fees and include discounts for students, seniors, or families.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
            <div className="feature-box">
              <div className="feature-icon me-sm-4 mb-3 mb-sm-0">
                <i className="bi bi-motherboard"></i>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Modern Technology and Techniques</h3>
                <p className="feature-text">
                  Use of digital X-rays, 3D scans, laser treatments, and other advanced technologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Main;