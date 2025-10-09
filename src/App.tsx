import './App.css'
import Header from './components/header'
import Sidebar from './components/sidebar'
import MainContent from './components/main-content'
import { useState } from 'react'

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleDataChange = () => {
    // Increment key to trigger refresh in both sidebar and main content
    setRefreshKey(prev => prev + 1);
  };

  const handleListSelect = (listId: string) => {
    // Toggle: if clicking same item, deselect (show all)
    setSelectedListId(prev => prev === listId ? null : listId);
  };

  return (
    <>
    <div className='flex flex-col bg-background text-foreground h-screen'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar refreshKey={refreshKey} onListSelect={handleListSelect} />
        <MainContent refreshKey={refreshKey} selectedListId={selectedListId} onDataChange={handleDataChange} />
      </div>
    </div>
    </>
  )
}

export default App
