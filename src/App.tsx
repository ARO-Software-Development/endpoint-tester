import { Routes, Route } from 'react-router-dom'
import Home from './views/Home/Home'
import Documentation from './views/Docs/Docs'
import Tester from './views/Tester/Tester'
import Error from './views/Error/Error'
import Header from './components/layout/header/header'
import Footer from './components/layout/footer/footer'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-main">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tester' element={<Tester />} />
          <Route path='/docs' element={<Documentation />} />
          <Route path='*' element={<Error />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
