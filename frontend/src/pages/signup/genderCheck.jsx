import React from 'react'

const GenderCheck = () => {
  return (
    <div className='flex'>
        <div className='form-control'>
            <label className={'label gap-2 cursor-pointer'} htmlFor="">
                <span className='label-text'>Male</span>
                <input type="checkbox" className='checkbox border-slate-900' />
            </label>
        </div>
        <div className='form-control'>
            <label className={'label gap-2 cursor-pointer'} htmlFor="">
                <span className='label-text'>Male</span>
                <input type="checkbox" className='checkbox border-slate-900' />
            </label>
        </div>
    </div>
  )
}

export default GenderCheck