import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
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
      <Toaster 
        richColors 
        position="top-center" 
        theme="dark"
        toastOptions={{
          style: {
            background: '#131414',
            color: '#e3e3e3',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
          className: 'daro-toast',
        }}
      />
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
