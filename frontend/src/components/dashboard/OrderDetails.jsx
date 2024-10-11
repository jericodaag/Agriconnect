import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { get_order_details } from '../../store/reducers/orderReducer';

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { myOrder } = useSelector(state => state.order);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(get_order_details(orderId));
    setTimeout(() => setIsLoaded(true), 300);
  }, [orderId, dispatch]);

  const StatusBadge = ({ status }) => {
    const color = status === 'paid' || status === 'delivered' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
    return (
      <span className={`${color} text-xs font-medium px-2 py-1 rounded-full`}>
        {status}
      </span>
    );
  };

  const Icon = ({ name }) => {
    const icons = {
      order: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      calendar: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      summary: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      shipping: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      ),
      contact: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
    };
    return icons[name] || null;
  };

  return (
    <div className={`bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="order" />
            <h1 className="text-2xl font-semibold text-gray-800">Order #{myOrder._id}</h1>
          </div>
          <div className="flex items-center space-x-2 mt-2 text-gray-500">
            <Icon name="calendar" />
            <p className="text-sm">{myOrder.date}</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6 md:col-span-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h2>
              <div className="space-y-4">
                {myOrder.products?.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <img className="w-16 h-16 object-cover rounded" src={p.images[0]} alt={p.name} />
                    <div className="flex-grow">
                      <Link to={`/product/${p._id}`} className="text-gray-800 hover:text-blue-600 transition-colors">{p.name}</Link>
                      <p className="text-sm text-gray-500">Quantity: {p.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 font-semibold">₱{p.price - Math.floor((p.price * p.discount) / 100)}</p>
                      {p.discount > 0 && (
                        <p className="text-xs text-gray-500">
                          <span className="line-through">${p.price}</span>
                          <span className="ml-1 text-green-600">-{p.discount}%</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="summary" />
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Price</span>
                  <span className="text-xl font-semibold text-gray-800">${myOrder.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Payment Status</span>
                  <StatusBadge status={myOrder.payment_status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Status</span>
                  <StatusBadge status={myOrder.delivery_status} />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="shipping" />
                <h2 className="text-lg font-semibold text-gray-800">Shipping Information</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">{myOrder.shippingInfo?.name}</p>
                <p className="text-gray-600">{myOrder.shippingInfo?.address}</p>
                <p className="text-gray-600">{myOrder.shippingInfo?.city}, {myOrder.shippingInfo?.province}</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="contact" />
                <h2 className="text-lg font-semibold text-gray-800">Contact</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">{userInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;