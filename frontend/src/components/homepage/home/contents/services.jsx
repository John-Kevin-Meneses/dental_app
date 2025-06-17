import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';


function Services() {
  return (
    <section id="services" className="services section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Services</h2>
      </div>{/* End Section Title */}
      <div className="container" data-aos="fade-up" data-aos-delay={100}>
        <div className="row justify-content-center g-5">
          <div className="col-md-6" data-aos="fade-right" data-aos-delay={100}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-code-slash" />
              </div>
              <div className="service-content">
                <h3>Preventive Care</h3>
                <p>
                  Dental Cleanings (Prophylaxis)<br />
                  Dental Exams &amp; X-rays<br />
                  Fluoride Treatments<br />
                  Dental Sealants<br />
                  Patient Education on Oral Hygiene
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-left" data-aos-delay={100}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-phone-fill" />
              </div>
              <div className="service-content">
                <h3>Restorative Procedures</h3>
                <p>
                  Dental Fillings<br />
                  Dental Crowns<br />
                  Dental Bridges<br />
                  Root Canal Treatment<br />
                  Tooth Extractions<br />
                  Inlays and Onlays
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-right" data-aos-delay={200}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-palette2" />
              </div>
              <div className="service-content">
                <h3>Cosmetic Dentistry</h3>
                <p>
                  Teeth Whitening<br />
                  Dental Veneers<br />
                  Cosmetic Bonding<br />
                  Tooth Reshaping or Contouring
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-left" data-aos-delay={200}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-bar-chart-line" />
              </div>
              <div className="service-content">
                <h3>Prosthodontics (Tooth Replacement)</h3>
                <p>
                  Dentures (Full or Partial)<br />
                  Dental Implants<br />
                  Implant-Supported Dentures or Bridges
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-right" data-aos-delay={300}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-cloud-check" />
              </div>
              <div className="service-content">
                <h3>Periodontal Care</h3>
                <p>
                  Scaling and Root Planing (Deep Cleaning)<br />
                  Periodontal Maintenance<br />
                  Gum Surgery
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-left" data-aos-delay={300}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-shield-lock" />
              </div>
              <div className="service-content">
                <h3>Orthodontics</h3>
                <p>
                  Traditional Braces<br />
                  Clear Aligners<br />
                  Retainers<br />
                  Space Maintainers
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
           <div className="col-md-6" data-aos="fade-right" data-aos-delay={300}>
            <div className="service-item">
              <div className="service-icon">
                <i className="bi bi-cloud-check" />
              </div>
              <div className="service-content">
                <h3>Pediatric Dentistry</h3>
                <p>
                  Child-Specific Cleanings and Exams<br />
                  Fluoride and Sealant Applications<br />
                  Pulpotomy (baby tooth root canal)<br />
                  Monitoring Tooth Development<br />
                  Behavior Management Techniques
                </p>
                {/* <a href="#" className="service-link">
                  <span>Learn More</span>
                  <i className="bi bi-arrow-right" />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
