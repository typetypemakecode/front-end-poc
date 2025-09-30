import './App.css'
import Header from './components/header'
import Sidebar from './components/sidebar'

function App() {
  return (
    <>
    <div className='flex flex-col bg-background text-foreground h-screen'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
      </div>
      
    </div>
    </>
  )
}

export default App
