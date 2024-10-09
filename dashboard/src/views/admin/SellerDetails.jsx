import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get_seller, seller_status_update, messageClear } from '../../store/Reducers/sellerReducer';
import { toast } from 'react-hot-toast';
import { User, MapPin, ShoppingBag, Mail, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";

const SellerDetails = () => {
  const dispatch = useDispatch();
  const { seller, successMessage } = useSelector(state => state.seller);
  const { sellerId } = useParams();
  const [status, setStatus] = useState('');

  useEffect(() => {
    dispatch(get_seller(sellerId));
  }, [sellerId, dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (seller) {
      setStatus(seller.status);
    }
  }, [seller]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(seller_status_update({ sellerId, status }));
  };

  if (!seller) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                {seller.image ? (
                  <img 
                    src={seller.image} 
                    alt={seller.name} 
                    className="w-64 h-64 object-cover rounded-lg border-2 border-gray-300 shadow-md" 
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-gray-300 shadow-md">
                    <User size={64} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p><strong>Name:</strong> {seller.name}</p>
                <p><strong>Email:</strong> {seller.email}</p>
                <p><strong>Role:</strong> {seller.role}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    seller.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {seller.status}
                  </span>
                </p>
                <p><strong>Payment Status:</strong> {seller.payment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2" /> Address Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Shop Name:</strong> {seller.shopInfo?.shopName}</p>
              <p><strong>Division:</strong> {seller.shopInfo?.division}</p>
              <p><strong>District:</strong> {seller.shopInfo?.district}</p>
              <p><strong>Sub-district:</strong> {seller.shopInfo?.sub_district}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2" /> Update Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Seller Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">--Select Status--</option>
                  <option value="active">Active</option>
                  <option value="deactive">Deactive</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
              >
                Update Status
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {successMessage && (
        <Alert className="mt-6">
          <Check className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SellerDetails;