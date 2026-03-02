import { Routes, Route } from 'react-router-dom'
import Home from './views/Home/Home'
import Error from './views/Error/Error'
import Header from './components/layout/header/header'
import './App.css'
import Footer from './components/layout/footer/footer'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        {/*<Route path='/tester' element={<Tester />} />*/}
        {/*<Route path='/docs' element={<Documentation />} />*/}
        <Route path='*' element={<Error />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
