import React, { useState } from 'react'
import useConversation from '../../zustand/useConversation'
import Conversations from './Conversations'
import LogoutButton from './LogoutButton'
import SearchInput from './SearchInput'
import { IoSettingsSharp } from "react-icons/io5";
import ProfileSettings from '../profile/ProfileSettings'

const SideBar = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`sidebar__container border-r border-slate-500 p-4 flex  flex-col overflow-auto
    ${selectedConversation ? "hidden md:flex" : ""} w-full md:w-auto
    `}>
      <SearchInput />
      <div className='divider px-3'></div>
      <Conversations />

      <div className='mt-auto flex justify-between items-center px-2'>
        <LogoutButton />
        <IoSettingsSharp
          className='w-6 h-6 text-white cursor-pointer hover:text-sky-500 transition-colors'
          onClick={() => setShowSettings(true)}
        />
      </div>

      {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default SideBar