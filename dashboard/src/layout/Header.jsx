import React from 'react';
import { FaList, FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Header = ({ showSidebar, setShowSidebar }) => {
  const { userInfo } = useSelector(state => state.auth);

  return (
    <header className='fixed top-0 left-0 w-full bg-white shadow-sm z-40'>
      <div className='ml-0 lg:ml-64 h-16 px-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className='lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none'
          >
            <FaList className='text-gray-600' />
          </button>
          <div className='hidden md:flex items-center ml-4 relative'>
            <FaSearch className='absolute left-3 text-gray-400' />
            <input
              className='pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300'
              type="text"
              placeholder='Search...'
            />
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex items-center gap-3'>
            {userInfo && (
              <>
                <div className='text-right hidden sm:block'>
                  <h2 className='text-sm font-semibold text-gray-700'>{userInfo.name}</h2>
                  <span className='text-xs text-gray-500'>{userInfo.role}</span>
                </div>
                <img
                  className='w-10 h-10 rounded-full border-2 border-green-200'
                  src={userInfo.role === 'admin' ? "http://localhost:3001/images/admin.jpg" : userInfo.image}
                  alt={userInfo.name}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;