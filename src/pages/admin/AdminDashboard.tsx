import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/constants';
import { 
  BarChart3, 
  Users, 
  Package, 
  ClipboardList, 
  AlertCircle, 
  ArrowRight, 
  User, 
  Calendar 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/admin/dashboard`, config);
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <p className="text-2xl font-semibold text-gray-800">{stats?.users?.total || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pending Verification</span>
              <span className="font-medium text-yellow-600">{stats?.users?.pendingVerifications || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Food Listings</p>
              <p className="text-2xl font-semibold text-gray-800">{stats?.food?.total || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Available</span>
              <span className="font-medium text-green-600">{stats?.food?.available || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Claimed Food</p>
              <p className="text-2xl font-semibold text-gray-800">{stats?.food?.claimed || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium text-blue-600">{stats?.food?.completed || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">User Roles</p>
              <p className="text-2xl font-semibold text-gray-800">{Object.keys(stats?.users?.byRole || {}).length}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Restaurants</span>
              <span className="font-medium text-purple-600">{stats?.users?.byRole?.restaurant || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/verify-users"
          className="bg-white rounded-lg shadow-md p-6 hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-800">User Verification</p>
                <p className="text-sm text-gray-500">Verify pending user accounts</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
        
        <Link
          to="/admin/food-management"
          className="bg-white rounded-lg shadow-md p-6 hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-800">Food Management</p>
                <p className="text-sm text-gray-500">Manage food listings</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
        
        <Link
          to="/admin/reports"
          className="bg-white rounded-lg shadow-md p-6 hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-800">Reports</p>
                <p className="text-sm text-gray-500">View system reports and analytics</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentActivity.map((activity: any) => (
                  <tr key={activity._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500">{activity.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {activity.donor?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {activity.donor?.role || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${activity.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                        ${activity.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${activity.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${activity.status === 'expired' ? 'bg-red-100 text-red-800' : ''}
                        ${activity.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/food/${activity._id}`} className="text-green-600 hover:text-green-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity found</p>
        )}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h2>
        
        {stats?.recentUsers && stats.recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentUsers.map((user: any) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${user.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${user.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/users/${user._id}`} className="text-green-600 hover:text-green-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent users found</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;