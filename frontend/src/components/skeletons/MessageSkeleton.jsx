import React from 'react'

const MessageSkeleton = () => {
    return (

    <div className="space-y-2 p-4">
      {/* Incoming message skeleton */}
      <div className="flex items-end justify-start">
        <div className="flex items-end space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex flex-col space-y-1">
            <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Outgoing message skeleton */}
      <div className="flex items-end justify-end">
        <div className="flex items-end space-x-2 flex-row-reverse">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex flex-col justify-end space-y-1">
            <div className="w-32 h-6 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-300 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    );
};


export default MessageSkeleton
