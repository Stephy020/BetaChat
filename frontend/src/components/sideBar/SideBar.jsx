import React from 'react'
import useConversation from '../../zustand/useConversation'
import Conversations from './Conversations'
import LogoutButton from './LogoutButton'
import SearchInput from './SearchInput'

const SideBar = () => {
  const {selectedConversation, setSelectedConversation}= useConversation();

  return (
    <div className={`sidebar__container border-r border-slate-500 p-4 flex  flex-col overflow-auto
    ${selectedConversation ? "sidebar-active ":""}
    `}>
        <SearchInput/>
        <div className='divider px-3'></div>
        <Conversations/>

        <LogoutButton/>
    </div>
  )
}

export default SideBar