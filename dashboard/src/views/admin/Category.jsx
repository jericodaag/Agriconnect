import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaImage, FaPlus } from 'react-icons/fa';
import { IoMdCloseCircle } from "react-icons/io";
import { PropagateLoader } from 'react-spinners';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { categoryAdd, messageClear, get_category, updateCategory, deleteCategory } from '../../store/Reducers/categoryReducer';

const Category = () => {
  const dispatch = useDispatch();
  const { loader, successMessage, errorMessage, categorys } = useSelector(state => state.category);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [parPage, setParPage] = useState(5);
  const [imageShow, setImage] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [state, setState] = useState({ name: '', image: '' });
  const [showModal, setShowModal] = useState(false);

  const imageHandle = (e) => {
    let files = e.target.files;
    if (files.length > 0) {
      setImage(URL.createObjectURL(files[0]));
      setState({ ...state, image: files[0] });
    }
  };

  const addOrUpdateCategory = (e) => {
    e.preventDefault();
    if (isEdit) {
      dispatch(updateCategory({ id: editId, ...state }));
    } else {
      dispatch(categoryAdd(state));
    }
    setShowModal(false);
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setState({ name: '', image: '' });
      setImage('');
      setIsEdit(false);
      setEditId(null);
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  useEffect(() => {
    const obj = {
      parPage: parseInt(parPage),
      page: parseInt(currentPage),
      searchValue
    };
    dispatch(get_category(obj));
  }, [searchValue, currentPage, parPage]);

  const handleEdit = (category) => {
    setState({ name: category.name, image: category.image });
    setImage(category.image);
    setEditId(category._id);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Category Management</h2>
        
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {setShowModal(true); setIsEdit(false); setState({ name: '', image: '' }); setImage('');}}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            <FaPlus className="inline mr-2" />
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Image</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categorys.map((category, index) => (
                <tr key={category._id} className="border-b">
                  <td className="py-2 px-4">
                    <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded-full" />
                  </td>
                  <td className="py-2 px-4">{category.name}</td>
                  <td className="py-2 px-4">
                    <button onClick={() => handleEdit(category)} className="text-blue-500 mr-2">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(category._id)} className="text-red-500">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination component would go here */}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">{isEdit ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={addOrUpdateCategory} className="space-y-4">
              <input
                type="text"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                placeholder="Category Name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div 
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer"
                onClick={() => document.getElementById('image-upload').click()}
              >
                {imageShow ? (
                  <img src={imageShow} alt="Category" className="mx-auto max-h-40 object-contain" />
                ) : (
                  <div className="text-gray-500">
                    <FaImage className="mx-auto text-3xl mb-2" />
                    <p>Click to upload image</p>
                  </div>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                onChange={imageHandle}
                className="hidden"
              />
              <button
                type="submit"
                disabled={loader}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                {loader ? <PropagateLoader color='#ffffff' size={8} /> : (isEdit ? 'Update Category' : 'Add Category')}
              </button>
            </form>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Category;