import { SearchIcon } from 'lucide-react'
import React from 'react'
import { Input } from './ui/input'

const SearchComponent = () => {
  return (
    <div className='flex flex-1 w-2/3 h-10 border border-slate-200 rounded-md items-center px-4 py-1' >
      <SearchIcon size={15} />
      <Input type='text' placeholder='Search in drive' className='border-none outline-none focus-visible:ring-transparent h-full shadow-none ' />
    </div>
  )
}

export default SearchComponent