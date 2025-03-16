import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/constants';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Package,
  User,
  Calendar
} from 'lucide-react';

const Notifications: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Filters
  const [readFilter, setReadFilter] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, pagination.page, readFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          read: readFilter,
          page: pagination.page,
          limit: pagination.limit
        }
      };
      
      const response = await axios.get(`${API_URL}/api/notifications`, config);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
      console.error('Notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, config);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
      
      setSuccess('Notification marked as read');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark notification as read');
      console.error('Mark as read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, config);
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      
      setSuccess('All notifications marked as read');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark all notifications as read');
      console.error('Mark all as read error:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`${API_URL}/api/notifications/${id}`, config);
      
      // Update local state
      setNotifications(notifications.filter(notification => notification._id !== id));
      
      setSuccess('Notification deleted');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete notification');
      console.error('Delete notification error:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatNotificationDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">View and manage your notifications</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Mark All as Read
          </button>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <label htmlFor="readFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="readFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={readFilter}
              onChange={(e) => {
                setReadFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="">All Notifications</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">
              {pagination.total} notification{pagination.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications found</h3>
          <p className="mt-1 text-gray-500">
            You don't have any notifications{readFilter ? (readFilter === 'true' ? ' marked as read' : ' that are unread') : ''}.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification._id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-green-50' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <div className="flex-grow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {notification.type.includes('food') ? (
                          <Package className="h-6 w-6 text-green-500" />
                        ) : (
                          <Bell className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        
                        {notification.relatedUser && notification.relatedUser.name && (
                          <div className="flex items-center mt-2">
                            <div className="flex-shrink-0">
                              {notification.relatedUser.profileImage ? (
                                <img
                                  className="h-5 w-5 rounded-full"
                                  src={`${API_URL}${notification.relatedUser.profileImage}`}
                                  alt={notification.relatedUser.name}
                                />
                              ) : (
                                <User className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <p className="ml-1 text-xs text-gray-500">{notification.relatedUser.name}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-400">
                            {formatNotificationDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {notification.relatedFood && (
                      <div className="mt-3 ml-9">
                        <Link
                          to={`/food/${notification.relatedFood._id || notification.relatedFood}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          View Food Details
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex mt-3 sm:mt-0 sm:ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
    </div>
  );
};

export default Notifications;