import './App.css'
import Header from './components/header'
import Sidebar from './components/sidebar'
import MainContent from './components/main-content'
import { ErrorBoundary, FeatureErrorBoundary } from './components/error-boundary'
import { ToastProvider } from './lib/toast'
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
    <ErrorBoundary>
      <div className='flex flex-col bg-background text-foreground h-screen'>
        <Header />
        <div className='flex flex-1 overflow-hidden'>
          <FeatureErrorBoundary featureName="sidebar">
            <Sidebar refreshKey={refreshKey} onListSelect={handleListSelect} />
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="main content">
            <main role="main" aria-label="Task content" className="flex-1 overflow-hidden">
              <MainContent refreshKey={refreshKey} selectedListId={selectedListId} onDataChange={handleDataChange} />
            </main>
          </FeatureErrorBoundary>
        </div>
      </div>
      <ToastProvider />
    </ErrorBoundary>
  )
}

export default App
