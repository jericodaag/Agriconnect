import React from 'react';
import { FaSearch, FaChevronDown } from 'react-icons/fa';

const Search = ({ setParPage, setSearchValue, searchValue }) => {
    return (
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-md shadow-sm'>
            <div className='relative w-full sm:w-48'>
                <select 
                    onChange={(e) => setParPage(parseInt(e.target.value))} 
                    className='w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring focus:ring-indigo-300 transition duration-200 ease-in-out'
                >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                </select>
                <FaChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none' />
            </div>
            <div className='relative w-full sm:w-64'>
                <input 
                    onChange={(e) => setSearchValue(e.target.value)} 
                    value={searchValue} 
                    className='w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-300 transition duration-200 ease-in-out' 
                    type="text" 
                    placeholder='Search products' 
                />
                <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
            </div>
        </div>
    );
};

export default Search;