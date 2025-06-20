import React from 'react'
import "./home.css"
import "./contents/main_page"
import Main from './contents/main_page'
import Services from './contents/services'
import Contacts from './contents/contacts'
import Header from '../header/header'
import Footer from '../footer/footer'
import 'aos/dist/aos.css';

const home = () => {
  return (
    <>
    <Header/>  
      <main className="main">
        <div className="page-title">
          <div className="heading">
            <div className="container">
              <div className="row d-flex justify-content-center text-center">
                <Main/>
                <Services/>
                <Contacts/>
              </div>
            </div>
          </div>
        </div>   
      </main>
    <Footer/>
    </>
  )
}

export default home
