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
                <span className="badge-text me-3">Innovative Solutions</span>
              </div>
            </div>
            <h1 className="hero-title mb-4">
              Accelerating business growth through innovative technology
            </h1>
            <p className="hero-description mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et. Aenean eu enim justo.
            </p>
            <div className="cta-wrapper">
              <a href="#" className="btn btn-primary">Discover More</a>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image">
              <img src="assets/img/illustration/illustration-16.webp" alt="Business Growth" className="img-fluid" loading="lazy" />
            </div>
          </div>
        </div>
        <div className="row feature-boxes">
          <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay="200">
            <div className="feature-box">
              <div className="feature-icon me-sm-4 mb-3 mb-sm-0">
                <i className="bi bi-gear"></i>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Rapid Deployment</h3>
                <p className="feature-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-box">
              <div className="feature-icon me-sm-4 mb-3 mb-sm-0">
                <i className="bi bi-window"></i>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Advanced Security</h3>
                <p className="feature-text">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
            <div className="feature-box">
              <div className="feature-icon me-sm-4 mb-3 mb-sm-0">
                <i className="bi bi-headset"></i>
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Dedicated Support</h3>
                <p className="feature-text">
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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