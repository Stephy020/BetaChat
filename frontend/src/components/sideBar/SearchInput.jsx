import React, { useState } from 'react'
import useConversation from '../../zustand/useConversation';
import useGetConversation from '../../hooks/useGetConversation';
import { toast } from 'react-hot-toast';

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { conversations } = useGetConversation();

  const handleChange = (e) => {
    setSearch(e.target.value);

    if (e.target.value === "") {
      setSelectedConversation(null); // Clear selection when search input is cleared
    } else {
      const filteredConversation = conversations.find(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase())
      );

      if (filteredConversation) {
        setSelectedConversation(filteredConversation);
        
      } else {
        setSelectedConversation(null);
        toast.error("User no found"); // Clear or handle no match scenario
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch("");
    
    // Optionally focus on the selected conversation or handle the case where no conversation matches
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="input input-bordered flex items-center gap-2">
        <input type="text" className="grow" placeholder="Search"
          value={search}
          onChange={handleChange}
        />
        <button type='submit'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
        </button>
  
      </label>
    </form>
  )
}

export default SearchInput