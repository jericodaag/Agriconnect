import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNav } from '../navigation/index';
import { BiLogOutCircle } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../store/Reducers/authReducer';
import logo from '../assets/logo.png';

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const dispatch = useDispatch();
  const { role } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [allNav, setAllNav] = useState([]);

  useEffect(() => {
    const navs = getNav(role);
    setAllNav(navs);
  }, [role]);

  return (
    <>
      <div
        onClick={() => setShowSidebar(false)}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${
          showSidebar ? 'block' : 'hidden'
        }`}
      ></div>

      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col px-3 py-4 overflow-y-auto bg-gray-800">
          <div className="flex justify-center items-center mb-6">
            <Link to="/" className="flex items-center justify-center">
              <img src={logo} className="h-12 w-auto" alt="Agriconnect Logo" />
            </Link>
          </div>
          <ul className="space-y-2 font-medium flex-grow">
            {allNav.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg ${
                    pathname === item.path
                      ? 'text-white bg-indigo-600'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            <button
              onClick={() => dispatch(logout({ navigate, role }))}
              className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 w-full"
            >
              <BiLogOutCircle className="w-6 h-6" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;