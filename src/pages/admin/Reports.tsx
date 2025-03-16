import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/constants';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Package, 
  Clock, 
  AlertCircle, 
  Download 
} from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('user-growth');

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          reportType: activeTab
        }
      };
      
      const response = await axios.get(`${API_URL}/api/admin/reports`, config);
      setReports(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports');
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const renderUserGrowthReport = () => {
    if (!reports?.userGrowth) return null;
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly User Growth</h3>
          <p className="text-sm text-gray-500">
            New user registrations over the past year, broken down by role.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NGOs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orphanages
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.userGrowth.map((month: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getMonthName(month.month)} {month.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.byRole.restaurant || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.byRole.ngo || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.byRole.orphanage || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">User Distribution by Role</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2">Chart visualization would appear here</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Growth Trend</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2">Chart visualization would appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFoodDistributionReport = () => {
    if (!reports?.foodDistribution) return null;
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Food Distribution Analysis</h3>
          <p className="text-sm text-gray-500">
            Analysis of food listings by category and status.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Distribution by Category</h3>
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claimed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.foodDistribution.byCategory.map((category: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {category.total}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {category.byStatus.available || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {category.byStatus.claimed || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Distribution by Status</h3>
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.foodDistribution.byStatus.map((status: any, index: number) => {
                    const totalFood = reports.foodDistribution.byStatus.reduce(
                      (sum: number, item: any) => sum + item.total, 0
                    );
                    const percentage = totalFood > 0 ? ((status.total / totalFood) * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {status.status}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {status.total}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Category Distribution Visualization</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChart className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2">Chart visualization would appear here</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActivitySummaryReport = () => {
    if (!reports?.activitySummary) return null;
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Summary</h3>
          <p className="text-sm text-gray-500">
            Summary of donation, claim, and completion activities over the past 6 months.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-md font-medium text-gray-900 mb-4">Monthly Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claimed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.activitySummary.monthlyActivity.map((month: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getMonthName(month.month)} {month.year}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {month.donations}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {month.claimed}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {month.completed}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {month.claimRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {month.completionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Activity Trend</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2">Chart visualization would appear here</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Claim Time Metrics</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Average Time to Claim</p>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-xl font-semibold text-gray-800">
                    {reports.activitySummary.claimTimeMetrics.avgTimeToClaim.toFixed(1)} hours
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Minimum Time</p>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-800">
                      {reports.activitySummary.claimTimeMetrics.minTimeToClaim.toFixed(1)} hours
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Maximum Time</p>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-800">
                      {reports.activitySummary.claimTimeMetrics.maxTimeToClaim.toFixed(1)} hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserEngagementReport = () => {
    if (!reports?.userEngagement) return null;
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Engagement</h3>
          <p className="text-sm text-gray-500">
            Analysis of user engagement metrics, including top donors and claimers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Top Donors</h3>
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donations
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claimed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.userEngagement.topDonors.map((donor: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{donor.name}</div>
                            <div className="text-xs text-gray-500">{donor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {donor.donations}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {donor.claimed}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {donor.claimRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Top Claimers</h3>
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claimed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.userEngagement.topClaimers.map((claimer: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{claimer.name}</div>
                            <div className="text-xs text-gray-500">{claimer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                         {claimer.role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {claimer.claimed}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {claimer.completed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Engagement Metrics Visualization</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2">Chart visualization would appear here</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600">View detailed reports and analytics about the platform</p>
        </div>
        
        <button
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
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

      {/* Report Tabs */}
      <div className="bg-white shadow-md rounded-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'user-growth'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('user-growth')}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Growth
              </div>
            </button>
            
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'food-distribution'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('food-distribution')}
            >
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Food Distribution
              </div>
            </button>
            
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'activity-summary'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('activity-summary')}
            >
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Activity Summary
              </div>
            </button>
            
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'user-engagement'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('user-engagement')}
            >
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                User Engagement
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {activeTab === 'user-growth' && renderUserGrowthReport()}
          {activeTab === 'food-distribution' && renderFoodDistributionReport()}
          {activeTab === 'activity-summary' && renderActivitySummaryReport()}
          {activeTab === 'user-engagement' && renderUserEngagementReport()}
        </div>
      )}
    </div>
  );
};

export default Reports;