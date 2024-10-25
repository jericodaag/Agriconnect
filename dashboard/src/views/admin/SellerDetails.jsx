import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get_seller, seller_status_update, messageClear, verify_seller_id, reject_seller_id } from '../../store/Reducers/sellerReducer';
import { toast } from 'react-hot-toast';
import { User, MapPin, ShoppingBag, Check, X, Download, FileCheck } from 'lucide-react';
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

  const handleVerifyId = () => {
    dispatch(verify_seller_id(sellerId)).then(() => {
      toast.success('ID verification successful');
      dispatch(get_seller(sellerId));
    });
  };

  const handleRejectId = () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      dispatch(reject_seller_id({ sellerId, reason })).then(() => {
        toast.success('ID rejected');
        dispatch(get_seller(sellerId));
      });
    }
  };

  const handleDownloadImage = async (imageUrl, type) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${seller.name}-${type}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  if (!seller) return <div>Loading...</div>;

  const getVerificationStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information Card */}
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
                  <div className="relative group">
                    <img 
                      src={seller.image} 
                      alt={seller.name} 
                      className="w-64 h-64 object-cover rounded-lg border-2 border-gray-300 shadow-md" 
                    />
                    <button
                      onClick={() => handleDownloadImage(seller.image, 'profile')}
                      className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
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

        {/* Address Information Card */}
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

        {/* ID Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2" /> ID Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seller.identityVerification && (
                <>
                  <div className="space-y-2">
                    <p><strong>ID Type:</strong> {seller.identityVerification.idType}</p>
                    <p><strong>ID Number:</strong> {seller.identityVerification.idNumber}</p>
                    <p><strong>Verification Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        getVerificationStatusColor(seller.identityVerification.verificationStatus)
                      }`}>
                        {seller.identityVerification.verificationStatus}
                      </span>
                    </p>
                  </div>

                  {seller.identityVerification.idImage && (
                    <div className="relative group">
                      <img 
                        src={seller.identityVerification.idImage}
                        alt="ID Document"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                      />
                      <button
                        onClick={() => handleDownloadImage(seller.identityVerification.idImage, 'id')}
                        className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  )}

                  {/* Show renewal history if available */}
                  {seller.identityVerification.renewalHistory && 
                  seller.identityVerification.renewalHistory.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Renewal Information</h3>
                      <p><strong>Reason for renewal:</strong> {
                        seller.identityVerification.renewalHistory[
                          seller.identityVerification.renewalHistory.length - 1
                        ].reason
                      }</p>
                      <p><strong>Renewal Date:</strong> {
                        new Date(
                          seller.identityVerification.renewalHistory[
                            seller.identityVerification.renewalHistory.length - 1
                          ].renewalDate
                        ).toLocaleDateString()
                      }</p>
                    </div>
                  )}

                  {seller.identityVerification.rejectionReason && (
                    <Alert className="bg-red-50 text-red-800">
                      <AlertDescription>
                        <strong>Rejection Reason:</strong> {seller.identityVerification.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Show verification buttons for both initial pending and renewal pending */}
                  {(seller.identityVerification.verificationStatus === 'pending' || 
                    seller.identityVerification.verificationStatus === 'pending_renewal') && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerifyId}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 flex items-center justify-center"
                      >
                        <Check className="mr-2 h-4 w-4" /> 
                        {seller.identityVerification.verificationStatus === 'pending_renewal' 
                          ? 'Approve Renewal' 
                          : 'Verify ID'}
                      </button>
                      <button
                        onClick={handleRejectId}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 flex items-center justify-center"
                      >
                        <X className="mr-2 h-4 w-4" /> 
                        {seller.identityVerification.verificationStatus === 'pending_renewal' 
                          ? 'Reject Renewal' 
                          : 'Reject ID'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Update Card */}
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