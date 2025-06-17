import React from 'react'
import "./home.css"

const home = () => {
  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title">
        <div className="heading">
          <div className="container">
            <div className="row d-flex justify-content-center text-center">
              <div className="col-lg-8">
                <h1 className="heading-title">Starter Page</h1>
                <p className="mb-0">
                  Odio et unde deleniti. Deserunt numquam exercitationem. Officiis quo
                  odio sint voluptas consequatur ut a odio voluptatem. Sit dolorum
                  debitis veritatis natus dolores. Quasi ratione sint. Sit quaerat
                  ipsum dolorem.
                </p>
              </div>
            </div>
          </div>
        </div>
        <nav className="breadcrumbs">
          <div className="container">
            <ol>
              <li><a href="index.html">Home</a></li>
              <li className="current">Starter Page</li>
            </ol>
          </div>
        </nav>
      </div>{/* End Page Title */}
      {/* Starter Section Section */}
      <section id="starter-section" className="starter-section section">
        <div className="container" data-aos="fade-up">
          <p>Use this page as a starter for your own custom pages.</p>
        </div>
      </section>{/* /Starter Section Section */}
    </main>

  )
}

export default home
