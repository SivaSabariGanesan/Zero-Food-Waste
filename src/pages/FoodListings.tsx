import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, FOOD_CATEGORIES, FOOD_STATUS } from '../config/constants';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  User
} from 'lucide-react';

const FoodListings: React.FC = () => {
  const { isRestaurant } = useAuth();
  const [foodListings, setFoodListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('available');
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFoodListings();
  }, [selectedCategory, selectedStatus, pagination.page]);

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
          category: selectedCategory,
          status: selectedStatus,
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('available');
    setPagination(prev => ({ ...prev, page: 1 }));
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
          <h1 className="text-2xl font-bold text-gray-800">Food Listings</h1>
          <p className="text-gray-600">
            {isRestaurant 
              ? 'Manage your food donations' 
              : 'Browse available food donations'}
          </p>
        </div>
        
        {isRestaurant && (
          <Link
            to="/food/create"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Donate Food
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
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
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {FOOD_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="claimed">Claimed</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="">All Statuses</option>
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : foodListings.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No food listings found</h3>
          <p className="mt-1 text-gray-500">
            {isRestaurant 
              ? "You haven't created any food listings yet." 
              : "No food listings match your search criteria."}
          </p>
          {isRestaurant && (
            <div className="mt-6">
              <Link
                to="/food/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Donate Food
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Food Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {foodListings.map((food) => (
              <div key={food._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  {food.images && food.images.length > 0 ? (
                    <img
                      src={`${API_URL}${food.images[0]}`}
                      alt={food.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
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
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{food.title}</h3>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {food.category}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {food.quantity} {food.quantityUnit}
                    </div>
                  </div>
                  
                  <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                    {food.description}
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {food.pickupAddress.substring(0, 30)}
                      {food.pickupAddress.length > 30 ? '...' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Expires: {new Date(food.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      {food.donor.profileImage ? (
                        <img
                          className="h-6 w-6 rounded-full"
                          src={`${API_URL}${food.donor.profileImage}`}
                          alt={food.donor.name}
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">
                            {food.donor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="ml-2 text-xs text-gray-500">{food.donor.name}</span>
                    </div>
                    <Link
                      to={`/food/${food._id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      View Details
                    </Link>
                  </div>
                  
                  {/* Show booker information for booked items */}
                  {food.status === 'booked' && food.bookedBy && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {food.bookedBy.profileImage ? (
                            <img
                              className="h-6 w-6 rounded-full"
                              src={`${API_URL}${food.bookedBy.profileImage}`}
                              alt={food.bookedBy.name}
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="h-3 w-3 text-purple-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-gray-500">
                            Booked by: <span className="font-medium">{food.bookedBy.name}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
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
        </>
      )}
    </div>
  );
};

export default FoodListings;