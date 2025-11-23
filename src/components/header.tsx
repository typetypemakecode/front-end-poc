import { CircleCheckBig, Search, Bell, Settings } from 'lucide-react'

export default function Header() {

  return (
    <header className='flex flex-row justify-between bg-background text-foreground pl-4 pr-4 pt-3 pb-3 border-b border-gray-700'>
      <div className="flex items-center gap-3" >
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-lime-500" aria-hidden="true">
            <CircleCheckBig className="text-black" />
        </div>

        <h1 className='text-2xl font-semibold'>TodoApp</h1>
      </div>
      <nav className="flex items-center gap-3" aria-label="Main navigation">
        <button
          className='p-2 rounded-md text-muted-foreground hover:bg-muted-background'
          aria-label="Search tasks"
          type="button"
        >
          <Search className="w-6 h-6" aria-hidden="true" />
        </button>
        <button
          className='p-2 rounded-md text-muted-foreground hover:bg-muted-background'
          aria-label="View notifications"
          type="button"
        >
          <Bell className="w-6 h-6" aria-hidden="true" />
        </button>
        <button
          className='p-2 rounded-md text-muted-foreground hover:bg-muted-background'
          aria-label="Open settings"
          type="button"
        >
          <Settings className="w-6 h-6" aria-hidden="true" />
        </button>
      </nav>
    </header>
  )
}
