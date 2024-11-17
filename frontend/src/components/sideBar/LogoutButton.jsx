import { CiLogout } from "react-icons/ci";
import React from 'react'
import useLogout from "../../hooks/useLogout";


 

const LogoutButton = () => {
  const { loading, logout } = useLogout(); 
  return (
    <div className='mt-auto'>
       {!loading ? (
         <CiLogout  className="w-6 text-2xl mt-3 text-white cursor-pointer"
         onClick={logout}
       />
       ) : (
        <span className="loading loading-spinner"></span>
       )}
    </div>
  )
}

export default LogoutButton