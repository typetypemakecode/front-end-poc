import { CircleCheckBig, Search, Bell, Settings } from 'lucide-react'

export default function Header() {

  return (
    <header className='flex flex-row justify-between bg-background text-foreground pl-4 pr-4 pt-3 pb-3 border-b border-gray-700'>
      <div className="flex items-center gap-3" >  
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-lime-500">
            <CircleCheckBig className="text-black" />
        </div>
        
        <h1 className='text-2xl font-semibold'>TodoApp</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className='p-2 rounded-md text-muted-foreground hover:bg-muted-background'>
          <Search className="w-6 h-6" />
        </button>
        <button className='p-2 rounded-md text-muted-foreground hover:bg-muted-background'>
          <Bell className="w-6 h-6" />
        </button>
        <button className='p-2 rounded-md text-muted-foreground hover:bg-muted-background'>
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}
