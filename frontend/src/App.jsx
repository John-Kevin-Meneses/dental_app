import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Header from './components/homepage/header/header'
import Home from './components/homepage/home/home'
import Footer from './components/homepage/footer/footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Header/>
        <Home/>
        <Footer/>
      </div>
    </>
  )
}

export default App
