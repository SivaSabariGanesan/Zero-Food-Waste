import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Bell, User, LogOut, Home, Package, BarChart3, Users, Plus } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin, isRestaurant } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      fetchNotifications();
    }
  };
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/notifications?limit=5`, config);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
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
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead(notification._id);
    
    // Navigate based on notification type
    if (notification.relatedFood) {
      navigate(`/food/${notification.relatedFood._id || notification.relatedFood}`);
    } else {
      navigate('/dashboard');
    }
    
    // Close notifications panel
    setIsNotificationsOpen(false);
  };

  // Fetch unread count periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Set up interval to check for new notifications
      const interval = setInterval(() => {
        fetchNotifications();
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <nav className="bg-green-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Package className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">FoodShare</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/food-listings" className="text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium">
                    Food Listings
                  </Link>
                  {isRestaurant && (
                    <Link to="/food/create" className="text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium">
                      Donate Food
                    </Link>
                  )}
                </>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-white hover:text-green-100 px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                <button
                  onClick={toggleNotifications}
                  className="p-1 rounded-full text-white hover:text-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-600 focus:ring-white relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={toggleProfileMenu}
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-600 focus:ring-white"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user?.profileImage ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`${API_URL}${user.profileImage}`}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-green-300 flex items-center justify-center">
                          <span className="text-green-800 font-medium">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-green-100 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-white hover:bg-green-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Home
              </div>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:bg-green-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Dashboard
                  </div>
                </Link>
                <Link
                  to="/food-listings"
                  className="text-white hover:bg-green-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Food Listings
                  </div>
                </Link>
                {isRestaurant && (
                  <Link
                    to="/food/create"
                    className="text-white hover:bg-green-500 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Donate Food
                    </div>
                  </Link>
                )}
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-white hover:bg-green-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Admin
                </div>
              </Link>
            )}
          </div>
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-green-500">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {user?.profileImage ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`${API_URL}${user.profileImage}`}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-green-300 flex items-center justify-center">
                      <span className="text-green-800 font-medium">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name}</div>
                  <div className="text-sm font-medium text-green-100">{user?.email}</div>
                </div>
                <button
                  onClick={toggleNotifications}
                  className="ml-auto p-1 rounded-full text-white hover:text-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-600 focus:ring-white relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Your Profile
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-500"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign out
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-green-500">
              <div className="flex items-center justify-around">
                <Link
                  to="/login"
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {isNotificationsOpen && isAuthenticated && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 sm:right-12">
          <div className="py-2">
            <div className="px-4 py-2 text-sm text-gray-700 border-b flex justify-between items-center">
              <p className="font-medium">Notifications</p>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notificationsLoading ? (
                <div className="px-4 py-3 text-center">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                  <p className="text-sm text-gray-500 mt-1">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-3 text-center">
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`px-4 py-3 hover:bg-gray-100 border-b cursor-pointer ${!notification.read ? 'bg-green-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatNotificationTime(notification.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 text-xs text-center text-green-600 border-t">
              <Link to="/notifications" className="hover:underline" onClick={() => setIsNotificationsOpen(false)}>
                View all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;