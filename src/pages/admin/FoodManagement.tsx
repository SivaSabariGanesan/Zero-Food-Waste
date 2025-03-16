import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, FOOD_CATEGORIES, FOOD_STATUS } from '../../config/constants';
import { 
  Package, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const FoodManagement: React.FC = () => {
  const { user } = useAuth();
  const [foodListings, setFoodListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Selected food for actions
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchFoodListings();
  }, [statusFilter, categoryFilter, pagination.page]);

  const fetchFoodListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          status: statusFilter,
          category: categoryFilter,
          search: searchTerm,
          page: pagination.page,
          limit: pagination.limit
        }
      };
      
      const response = await axios.get(`${API_URL}/api/food`, config);
      setFoodListings(response.data.food);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load food listings');
      console.error('Food listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchFoodListings();
  };

  const handleDeleteFood = async () => {
    if (!selectedFood) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`${API_URL}/api/food/${selectedFood._id}`, config);
      
      // Update the list
      setFoodListings(foodListings.filter(f => f._id !== selectedFood._id));
      
      // Show success message
      setSuccess(`Food listing "${selectedFood.title}" has been deleted`);
      
      // Reset selected food
      setSelectedFood(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete food listing');
      console.error('Food deletion error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelFood = async () => {
    if (!selectedFood) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/api/food/${selectedFood._id}/cancel`, {}, config);
      
      // Update the food in the list
      const updatedFoodListings = foodListings.map(food => {
        if (food._id === selectedFood._id) {
          return { ...food, status: FOOD_STATUS.CANCELLED };
        }
        return food;
      });
      
      setFoodListings(updatedFoodListings);
      
      // Show success message
      setSuccess(`Food listing "${selectedFood.title}" has been cancelled`);
      
      // Reset selected food
      setSelectedFood(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel food listing');
      console.error('Food cancellation error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Food Management</h1>
          <p className="text-gray-600">Manage food listings across the platform</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value={FOOD_STATUS.AVAILABLE}>Available</option>
              <option value={FOOD_STATUS.CLAIMED}>Claimed</option>
              <option value={FOOD_STATUS.COMPLETED}>Completed</option>
              <option value={FOOD_STATUS.EXPIRED}>Expired</option>
              <option value={FOOD_STATUS.CANCELLED}>Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {FOOD_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Food Listings */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : foodListings.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No food listings found</h3>
          <p className="mt-1 text-gray-500">
            There are no food listings matching your current filters.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {foodListings.map((food) => (
                  <tr key={food._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {food.images && food.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={`${API_URL}${food.images[0]}`}
                            alt={food.title}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{food.title}</div>
                          <div className="text-sm text-gray-500">{food.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {food.donor?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {food.donor?.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${food.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                        ${food.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${food.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${food.status === 'expired' ? 'bg-red-100 text-red-800' : ''}
                        ${food.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {food.status.charAt(0).toUpperCase() + food.status.slice(1)}
                      </span>
                      {food.claimedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          Claimed by: {food.claimedBy.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(food.expiryDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(food.pickupTimeStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(food.pickupTimeEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/food/${food._id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        View
                      </Link>
                      {food.status !== FOOD_STATUS.COMPLETED && (
                        <>
                          {food.status !== FOOD_STATUS.CANCELLED && (
                            <button
                              onClick={() => setSelectedFood({ ...food, action: 'cancel' })}
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedFood({ ...food, action: 'delete' })}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-md">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === pagination.page
                        ? 'z-10 bg-green-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedFood && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedFood.action === 'delete' ? 'Delete Food Listing' : 'Cancel Food Listing'}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {selectedFood.action === 'delete'
                    ? 'Are you sure you want to delete this food listing? This action cannot be undone.'
                    : 'Are you sure you want to cancel this food listing? This will mark it as cancelled and it will no longer be available for claiming.'}
                </p>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  {selectedFood.images && selectedFood.images.length > 0 ? (
                    <img
                      className="h-10 w-10 rounded-md object-cover"
                      src={`${API_URL}${selectedFood.images[0]}`}
                      alt={selectedFood.title}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{selectedFood.title}</div>
                    <div className="text-sm text-gray-500">{selectedFood.category}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedFood.pickupAddress}
                  </div>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Expires: {new Date(selectedFood.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setSelectedFood(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  selectedFood.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
                onClick={selectedFood.action === 'delete' ? handleDeleteFood : handleCancelFood}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : selectedFood.action === 'delete' ? (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Delete
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Cancel Listing
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodManagement;