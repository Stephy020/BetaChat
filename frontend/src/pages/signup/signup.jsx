import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import GenderCheck from './genderCheck'
import useSignup from '../../hooks/useSignup'



const Signup = () => {
    const [inputs, setInputs] = useState({
        fullName:"",
        username:'',
        password:'',
        confirmPassword:'',
        gender:'',
    });

    const {loading, signup} =useSignup();

    const handleCheckBoxChange = (gender) => {
        setInputs({...inputs, gender})
    }
    const handleSubmit = async (e)=>{

        e.preventDefault();
        console.log(inputs);
        await signup(inputs);

    }

  return (
    <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
        <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
            <h1 className='text-3xl font-semibold text-center text-gray-300'>
                Signup to
                <span className='text-blue-500'> BetaChat</span>
            </h1>

            <form onSubmit={handleSubmit}>
            <div>
                <label className='label p-2' htmlFor="">
                    <span className='text-base label-text'>Full Name</span>
                    </label>
                    <input type="text" placeholder='Eddy Stephy' className='w-full input input-bordered h-10' 
                    value={inputs.fullName} 
                    onChange={(e) => setInputs({...inputs, fullName: e.target.value})}
                    />
                </div>
                <div>
                    <label className='label p-2' htmlFor="">
                        <span className='text-base label-text'>username</span>
                    </label>
                    <input type="text" placeholder='Enter username' className='w-full input input-bordered h-10'
                      value={inputs.username} 
                      onChange={(e) => setInputs({...inputs, username: e.target.value})}
                    />
                </div>

                <div>
                    <label className='label'>
                        <span className='text-base label-text'>password</span>
                    </label>
                    <input type="password" placeholder='Enter password' className='w-full input input-bordered h-10 '
                        value={inputs.password} 
                        onChange={(e) => setInputs({...inputs, password: e.target.value})}
                    />
                </div>

                <div>
                    <label className='label'>
                        <span className='text-base label-text'>Confirm password</span>
                    </label>
                    <input type="password" placeholder='Confirm password' className='w-full input input-bordered h-10 '
                        value={inputs.confirmPassword} 
                        onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
                    />
                </div>
                {/*GENDER CHECK BOX*/}
                <GenderCheck onCheckBoxChange={handleCheckBoxChange} selectedGender={inputs.gender} />
                <Link to="/login" className='text-sm hover:underline hover:text-blue-600 mt-2'>Already have an account? Login. </Link>

                <div>
                    <button className='btn btn-block btn-sm mt-2'
                    disabled={loading}
                    >
                    {!loading ? (
                        "Signup"
                    ) : (
                        <span className='loading loading-spinner' ></span>
                    )}
                    </button>
                </div>
                
            </form>
           
        </div>
    </div>
  )
}

export default Signup