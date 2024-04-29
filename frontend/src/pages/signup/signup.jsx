import React from 'react'
import GenderCheck from './genderCheck'

const Signup = () => {
  return (
    <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
        <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
            <h1 className='text-3xl font-semibold text-center text-gray-300'>
                Signup to
                <span className='text-blue-500'> BetaChat</span>
            </h1>

            <form action="">
            <div>
                <label className='label p-2' htmlFor="">
                    <span className='text-base label-text'>Full Name</span>
                    </label>
                    <input type="text" placeholder='Eddy Stephy' className='w-full input input-bordered h-10' />
                </div>
                <div>
                    <label className='label p-2' htmlFor="">
                        <span className='text-base label-text'>username</span>
                    </label>
                    <input type="text" placeholder='Enter username' className='w-full input input-bordered h-10' />
                </div>

                <div>
                    <label className='label'>
                        <span className='text-base label-text'>password</span>
                    </label>
                    <input type="password" placeholder='Enter password' className='w-full input input-bordered h-10 '/>
                </div>

                <div>
                    <label className='label'>
                        <span className='text-base label-text'>Confirm password</span>
                    </label>
                    <input type="password" placeholder='Confirm password' className='w-full input input-bordered h-10 '/>
                </div>
                {/*GENDER CHECK BOX*/}
                <GenderCheck/>
                <a href="a" className='text-sm hover:underline hover:text-blue-600 mt-2'>Already have an account? Login. </a>

                <div>
                    <button className='btn btn-block btn-sm mt-2'>Signup</button>
                </div>
                
            </form>
           
        </div>
    </div>
  )
}

export default Signup