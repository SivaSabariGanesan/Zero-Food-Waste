import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FOOD_STATUS, API_URL } from '../config/constants';
import { 
  BarChart3, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  MapPin, 
  Calendar, 
  User, 
  ArrowRight,
  PieChart,
  TrendingUp,
  Users
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isRestaurant, isNGO, isOrphanage } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    claimedDonations: 0,
    completedDonations: 0
  });
  const [recentFood, setRecentFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleStats, setRoleStats] = useState<any>(null);
  const [loadingRoleStats, setLoadingRoleStats] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Get food listings based on user role
        const foodResponse = await axios.get(`${API_URL}/api/food`, config);
        
        // Process data for dashboard stats
        const foodData = foodResponse.data.food;
        
        // Calculate stats
        const totalDonations = isRestaurant 
          ? foodData.length 
          : foodData.filter((food: any) => food.status === FOOD_STATUS.AVAILABLE).length;
        
        const activeDonations = foodData.filter(
          (food: any) => food.status === FOOD_STATUS.AVAILABLE
        ).length;
        
        const claimedDonations = foodData.filter(
          (food: any) => food.status === FOOD_STATUS.CLAIMED
        ).length;
        
        const completedDonations = foodData.filter(
          (food: any) => food.status === FOOD_STATUS.COMPLETED
        ).length;
        
        setStats({
          totalDonations,
          activeDonations,
          claimedDonations,
          completedDonations
        });
        
        // Set recent food listings (limited to 5)
        setRecentFood(foodData.slice(0, 5));
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();

    // Fetch role-specific statistics
    const fetchRoleStats = async () => {
      try {
        setLoadingRoleStats(true);
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        let endpoint = '';
        
        if (isRestaurant) {
          endpoint = '/api/food/donation-stats';
        } else if (isNGO) {
          endpoint = '/api/food/delivery-stats';
        } else if (isOrphanage) {
          endpoint = '/api/food/booking-stats';
        } else {
          return; // No stats for admin (they have their own admin dashboard)
        }
        
        const response = await axios.get(`${API_URL}${endpoint}`, config);
        setRoleStats(response.data);
      } catch (err: any) {
        console.error('Role stats error:', err);
        // Don't set error state to avoid disrupting the main dashboard
      } finally {
        setLoadingRoleStats(false);
      }
    };
    
    fetchRoleStats();
    
    // Listen for socket events
    if (socket) {
      if (isRestaurant) {
        socket.on('food-claimed', (data) => {
          // Refresh data when one of your food items is claimed
          fetchDashboardData();
          fetchRoleStats();
        });
      } else if (isNGO || isOrphanage) {
        socket.on('food-listed', (data) => {
          // Refresh data when new food is listed
          fetchDashboardData();
        });
        
        socket.on('food-booked', (data) => {
          // Refresh data when food is booked (for NGOs)
          if (isNGO) {
            fetchDashboardData();
            fetchRoleStats();
          }
        });
        
        socket.on('food-claimed', (data) => {
          // Refresh data when food is claimed (for orphanages)
          if (isOrphanage) {
            fetchDashboardData();
            fetchRoleStats();
          }
        });
      }
      
      // Clean up event listeners
      return () => {
        socket.off('food-claimed');
        socket.off('food-listed');
        socket.off('food-booked');
      };
    }
  }, [socket, isRestaurant, isNGO, isOrphanage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const renderRoleSpecificStats = () => {
    if (!roleStats || loadingRoleStats) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {isRestaurant ? 'Donation Statistics' : isNGO ? 'Delivery Statistics' : 'Booking Statistics'}
          </h2>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      );
    }

    if (isRestaurant) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Donation Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Status Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(roleStats.statusCounts || {}).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Top Orphanages</h3>
              {roleStats.bookingsByOrphanage && roleStats.bookingsByOrphanage.length > 0 ? (
                <div className="space-y-2">
                  {roleStats.bookingsByOrphanage.slice(0, 5).map((item: any) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.count} bookings</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No orphanages have booked your food yet.</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/food/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Donate More Food
            </Link>
          </div>
        </div>
      );
    }
    
    if (isNGO) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Delivery Status</h3>
              <div className="space-y-2">
                {Object.entries(roleStats.statusCounts || {}).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Top Orphanages Served</h3>
              {roleStats.deliveriesByOrphanage && roleStats.deliveriesByOrphanage.length > 0 ? (
                <div className="space-y-2">
                  {roleStats.deliveriesByOrphanage.slice(0, 5).map((item: any) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.count} deliveries</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No completed deliveries to orphanages yet.</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/food-listings"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Package className="h-5 w-5 mr-2" />
              Find Food to Deliver
            </Link>
          </div>
        </div>
      );
    }
    
    if (isOrphanage) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Booking Status</h3>
              <div className="space-y-2">
                {Object.entries(roleStats.statusCounts || {}).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Top NGO Partners</h3>
              {roleStats.deliveriesByNGO && roleStats.deliveriesByNGO.length > 0 ? (
                <div className="space-y-2">
                  {roleStats.deliveriesByNGO.slice(0, 5).map((item: any) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.count} deliveries</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No completed deliveries from NGOs yet.</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/food-listings"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Package className="h-5 w-5 mr-2" />
              Find Food to Book
            </Link>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">
                {isRestaurant ? 'Total Donations' : 'Available Food'}
              </p>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalDonations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.activeDonations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Claimed</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.claimedDonations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.completedDonations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Statistics */}
      {renderRoleSpecificStats()}

      {/* Recent Food Listings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isRestaurant ? 'Your Recent Donations' : 'Recent Food Listings'}
          </h2>
          <Link
            to="/food-listings"
            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {recentFood.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">
              {isRestaurant 
                ? "You haven't donated any food yet." 
                : "No food listings available at the moment."}
            </p>
            {isRestaurant && (
              <Link
                to="/food/create"
                className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Donate Food
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentFood.map((food) => (
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
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {food.pickupAddress.substring(0, 20)}
                        {food.pickupAddress.length > 20 ? '...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(food.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${food.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                        ${food.status === 'booked' ? 'bg-purple-100 text-purple-800' : ''}
                        ${food.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${food.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${food.status === 'expired' ? 'bg-red-100 text-red-800' : ''}
                        ${food.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {food.status.charAt(0).toUpperCase() + food.status.slice(1)}
                      </span>
                      {food.bookedBy && food.status === 'booked' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Booked by: {food.bookedBy.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/food/${food._id}`} className="text-green-600 hover:text-green-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h2>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-4 md:mb-0 flex justify-center">
            {user?.profileImage ? (
              <img
                src={`${API_URL}${user.profileImage}`}
                alt={user.name}
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-16 w-16 text-green-500" />
              </div>
            )}
          </div>
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-md font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-md font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-md font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-md font-medium">{user?.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-md font-medium">{user?.address}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;