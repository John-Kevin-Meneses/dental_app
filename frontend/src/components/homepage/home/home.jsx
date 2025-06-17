import React from 'react'
import "./home.css"
import "./contents/main_page"
import Main from './contents/main_page'
import Services from './contents/services'
import 'aos/dist/aos.css';

const home = () => {
  return (
    <main className="main">
    <div className="page-title">
      <div className="heading">
        <div className="container">
          <div className="row d-flex justify-content-center text-center">
            <Main/>
            <Services/>
          </div>
        </div>
      </div>
    </div>   
  </main>

  )
}

export default home
