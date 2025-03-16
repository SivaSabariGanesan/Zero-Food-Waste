import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, FOOD_STATUS } from '../config/constants';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ArrowLeft,
  Mail
} from 'lucide-react';

const FoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isRestaurant, isNGO, isOrphanage } = useAuth();
  
  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/food/${id}`, config);
        setFood(response.data);
        
        // Set the first image as active if available
        if (response.data.images && response.data.images.length > 0) {
          setActiveImage(`${API_URL}${response.data.images[0]}`);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load food details');
        console.error('Food details error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoodDetails();
  }, [id, navigate]);

  const handleBookFood = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/food/${id}/book`, {}, config);
      
      // Update the food state
      setFood(response.data);
      
      setActionSuccess('Food booked successfully! An NGO will claim it for delivery to your orphanage.');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to book food');
      console.error('Book food error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimFood = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/food/${id}/claim`, {}, config);
      
      // Update the food state
      setFood(response.data);
      
      setActionSuccess(food.bookedBy 
        ? 'Food claimed successfully! Please coordinate with the orphanage for delivery.' 
        : 'Food claimed successfully! Please coordinate with the donor for pickup.');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to claim food');
      console.error('Claim food error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteFoodPickup = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/food/${id}/complete`, {}, config);
      
      // Update the food state
      setFood(response.data);
      
      setActionSuccess('Food pickup marked as completed!');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to complete food pickup');
      console.error('Complete food pickup error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClaim = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/food/${id}/cancel-claim`, {}, config);
      
      // Update the food state
      setFood(response.data);
      
      setActionSuccess('Claim cancelled successfully.');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel claim');
      console.error('Cancel claim error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/food/${id}/cancel-booking`, {}, config);
      
      // Update the food state
      setFood(response.data);
      
      setActionSuccess('Booking cancelled successfully.');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel booking');
      console.error('Cancel booking error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelListing = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/food/${id}/cancel`, {}, config);
      
      // Update the food state
      setFood(response.data);
      
      setActionSuccess('Food listing cancelled successfully.');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel food listing');
      console.error('Cancel food listing error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this food listing? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      setActionError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`${API_URL}/api/food/${id}`, config);
      
      setActionSuccess('Food listing deleted successfully.');
      
      // Redirect to food listings after a short delay
      setTimeout(() => {
        navigate('/food-listings');
      }, 2000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete food listing');
      console.error('Delete food listing error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Food listing not found</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwner = food.donor._id === user?._id;
  const isBooker = food.bookedBy && food.bookedBy._id === user?._id;
  const isClaimer = food.claimedBy && food.claimedBy._id === user?._id;
  const canBook = isOrphanage && food.status === FOOD_STATUS.AVAILABLE;
  const canClaim = isNGO && (food.status === FOOD_STATUS.AVAILABLE || food.status === FOOD_STATUS.BOOKED);
  const canComplete = (isOwner || isClaimer) && food.status === FOOD_STATUS.CLAIMED;
  const canCancelClaim = isClaimer && food.status === FOOD_STATUS.CLAIMED;
  const canCancelBooking = isBooker && food.status === FOOD_STATUS.BOOKED;
  const canCancelListing = isOwner && (food.status === FOOD_STATUS.AVAILABLE || food.status === FOOD_STATUS.BOOKED || food.status === FOOD_STATUS.CLAIMED);
  const canDelete = isOwner && food.status !== FOOD_STATUS.CLAIMED && food.status !== FOOD_STATUS.COMPLETED;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{actionSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{actionError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Food Images */}
          <div className="md:w-1/2 p-6">
            <div className="mb-4 h-64 bg-gray-100 rounded-lg overflow-hidden">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={food.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {food.images && food.images.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto">
                {food.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      activeImage === `${API_URL}${image}` ? 'border-green-500' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(`${API_URL}${image}`)}
                  >
                    <img
                      src={`${API_URL}${image}`}
                      alt={`${food.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Food Details */}
          <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-800">{food.title}</h1>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${food.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                ${food.status === 'booked' ? 'bg-purple-100 text-purple-800' : ''}
                ${food.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${food.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                ${food.status === 'expired' ? 'bg-red-100 text-red-800' : ''}
                ${food.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {food.status.charAt(0).toUpperCase() + food.status.slice(1)}
              </span>
            </div>
            
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                {food.category}
              </span>
            </div>
            
            <p className="mt-4 text-gray-600">{food.description}</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">
                  {food.quantity} {food.quantityUnit}
                </span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">
                  Expires on: {new Date(food.expiryDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-700">{food.pickupAddress}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">
                  Pickup time: {new Date(food.pickupTimeStart).toLocaleTimeString()} - {new Date(food.pickupTimeEnd).toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            {food.pickupInstructions && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700">Pickup Instructions:</h3>
                <p className="mt-1 text-gray-600">{food.pickupInstructions}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {canBook && (
                <button
                  onClick={handleBookFood}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Book Food
                    </>
                  )}
                </button>
              )}
              
              {canClaim && (
                <button
                  onClick={handleClaimFood}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Claim Food
                    </>
                  )}
                </button>
              )}
              
              {canComplete && (
                <button
                  onClick={handleCompleteFoodPickup}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Completed
                    </>
                  )}
                </button>
              )}
               {canCancelClaim && (
                <button
                  onClick={handleCancelClaim}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      Cancel Claim
                    </>
                  )}
                </button>
              )}
              
              {canCancelBooking && (
                <button
                  onClick={handleCancelBooking}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      Cancel Booking
                    </>
                  )}
                </button>
              )}
              
              {canCancelListing && (
                <button
                  onClick={handleCancelListing}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      Cancel Listing
                    </>
                  )}
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDeleteListing}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      Delete Listing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Donor Information */}
        <div className="border-t border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Donor Information</h2>
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center mb-4 md:mb-0 md:mr-8">
              {food.donor.profileImage ? (
                <img
                  src={`${API_URL}${food.donor.profileImage}`}
                  alt={food.donor.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-500" />
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">{food.donor.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{food.donor.role}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{food.donor.phone}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{food.donor.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booker Information (if booked) */}
        {food.bookedBy && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Booked By (Orphanage)</h2>
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                {food.bookedBy.profileImage ? (
                  <img
                    src={`${API_URL}${food.bookedBy.profileImage}`}
                    alt={food.bookedBy.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-purple-500" />
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{food.bookedBy.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{food.bookedBy.role}</p>
                </div>
              </div>
              
              {(isOwner || isClaimer || isBooker) && (
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{food.bookedBy.phone}</span>
                  </div>
                  
                  <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{food.bookedBy.address}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{food.bookedBy.email}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Booked on: {new Date(food.bookedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Claimer Information (if claimed) */}
        {food.claimedBy && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Claimed By (NGO)</h2>
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                {food.claimedBy.profileImage ? (
                  <img
                    src={`${API_URL}${food.claimedBy.profileImage}`}
                    alt={food.claimedBy.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-yellow-500" />
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{food.claimedBy.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{food.claimedBy.role}</p>
                </div>
              </div>
              
              {(isOwner || isClaimer || isBooker) && (
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{food.claimedBy.phone}</span>
                  </div>
                  
                  <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{food.claimedBy.address}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{food.claimedBy.email}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Claimed on: {new Date(food.claimedAt).toLocaleString()}
              </p>
              
              {food.status === FOOD_STATUS.COMPLETED && food.completedAt && (
                <p className="text-sm text-gray-500">
                  Completed on: {new Date(food.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDetail;