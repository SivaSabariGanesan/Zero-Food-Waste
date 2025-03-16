import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, FOOD_CATEGORIES } from '../config/constants';
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Upload, 
  Save, 
  ArrowLeft 
} from 'lucide-react';

const CreateFood: React.FC = () => {
  const { user, isRestaurant } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: 1,
    quantityUnit: 'servings',
    expiryDate: '',
    pickupAddress: '',
    pickupInstructions: '',
    pickupTimeStart: '',
    pickupTimeEnd: '',
    pickupLocation: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    },
    images: [] as File[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    // Redirect if not a restaurant
    if (!isRestaurant) {
      navigate('/dashboard');
    }
    
    // Pre-fill address if user has one
    if (user?.address) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: user.address
      }));
    }
    
    // Set default expiry date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Set default pickup times (9 AM to 5 PM today)
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(today);
    endTime.setHours(17, 0, 0, 0);
    
    setFormData(prev => ({
      ...prev,
      expiryDate: tomorrowStr,
      pickupTimeStart: startTime.toISOString().slice(0, 16),
      pickupTimeEnd: endTime.toISOString().slice(0, 16)
    }));
  }, [user, isRestaurant, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...selectedFiles]
      }));
      
      // Generate previews
      const newPreviews: string[] = [];
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImagePreview(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('quantity', formData.quantity.toString());
      formDataToSend.append('quantityUnit', formData.quantityUnit);
      formDataToSend.append('expiryDate', formData.expiryDate);
      formDataToSend.append('pickupAddress', formData.pickupAddress);
      formDataToSend.append('pickupInstructions', formData.pickupInstructions);
      formDataToSend.append('pickupTimeStart', formData.pickupTimeStart);
      formDataToSend.append('pickupTimeEnd', formData.pickupTimeEnd);
      
      // Add coordinates (for now just dummy values, in a real app you'd use geocoding)
      formDataToSend.append('pickupLocation[type]', 'Point');
      formDataToSend.append('pickupLocation[coordinates][0]', '0');
      formDataToSend.append('pickupLocation[coordinates][1]', '0');
      
      // Add images
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };
      
      // Send POST request to create food listing
      const response = await axios.post(`${API_URL}/api/food`, formDataToSend, config);
      
      // Redirect to the new food listing
      navigate(`/food/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create food listing');
      console.error('Create food error:', err);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Donate Food</h1>
          <p className="text-gray-600">Share your surplus food with those in need</p>
        </div>

        {error && (
          <div className="px-6 py-4">
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
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Food Details */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Food Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Food Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., Fresh Sandwiches, Leftover Catering Food"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the food, including any allergens or dietary information"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    {FOOD_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date*
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="quantityUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit*
                  </label>
                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    required
                    className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="servings">Servings</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="items">Items</option>
                    <option value="liters">Liters</option>
                    <option value="boxes">Boxes</option>
                    <option value="packages">Packages</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pickup Details */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pickup Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Address*
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="pickupAddress"
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      required
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Full address where the food can be picked up"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="pickupTimeStart" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Start Time*
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="pickupTimeStart"
                      name="pickupTimeStart"
                      value={formData.pickupTimeStart}
                      onChange={handleChange}
                      required
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="pickupTimeEnd" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup End Time*
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="pickupTimeEnd"
                      name="pickupTimeEnd"
                      value={formData.pickupTimeEnd}
                      onChange={handleChange}
                      required
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="pickupInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Instructions
                  </label>
                  <textarea
                    id="pickupInstructions"
                    name="pickupInstructions"
                    rows={2}
                    value={formData.pickupInstructions}
                    onChange={handleChange}
                    className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any special instructions for pickup (e.g., 'Ask for manager', 'Use back entrance')"
                  />
                </div>
              </div>
            </div>

            {/* Food Images */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Food Images</h2>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFood;