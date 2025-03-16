import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Users, Clock, Award, BarChart3 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-green-600">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
            alt="Food donation"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Reduce Food Waste, <br />
            Feed Those in Need
          </h1>
          <p className="mt-6 text-xl text-green-100 max-w-3xl">
            FoodShare connects restaurants with surplus food to NGOs and orphanages, 
            creating a sustainable solution to reduce food waste and fight hunger.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
            >
              Join Our Network
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/food-listings"
              className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-500"
            >
              View Food Listings
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform makes food donation and distribution simple and efficient.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Utensils className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Restaurants List Food</h3>
                <p className="mt-2 text-base text-gray-500">
                  Restaurants with surplus food can easily list available items, including type, quantity, and pickup details.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">NGOs Claim Food</h3>
                <p className="mt-2 text-base text-gray-500">
                  Verified NGOs and orphanages can browse listings and claim food that meets their needs.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Real-Time Updates</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get instant notifications and track the status of donations in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Making a Difference Together
            </h2>
            <p className="mt-3 text-xl text-green-100">
              Our community is growing and making an impact every day.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-green-500 rounded-lg shadow-lg p-6">
              <p className="text-5xl font-extrabold text-white">5,000+</p>
              <p className="mt-2 text-lg font-medium text-green-100">Meals Donated</p>
            </div>
            <div className="bg-green-500 rounded-lg shadow-lg p-6">
              <p className="text-5xl font-extrabold text-white">100+</p>
              <p className="mt-2 text-lg font-medium text-green-100">Restaurant Partners</p>
            </div>
            <div className="bg-green-500 rounded-lg shadow-lg p-6">
              <p className="text-5xl font-extrabold text-white">50+</p>
              <p className="mt-2 text-lg font-medium text-green-100">NGO Partners</p>
            </div>
            <div className="bg-green-500 rounded-lg shadow-lg p-6">
              <p className="text-5xl font-extrabold text-white">2,000+</p>
              <p className="mt-2 text-lg font-medium text-green-100">People Fed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Benefits of Joining
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform offers advantages for all participants in the food donation ecosystem.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Utensils className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">For Restaurants</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Reduce food waste and disposal costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Enhance corporate social responsibility</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Potential tax benefits for donations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Simple and efficient donation process</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">For NGOs & Orphanages</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Access to regular food donations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Reduce food procurement costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Real-time notifications for new donations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Transparent and reliable donation system</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Award className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">For Society</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Reduction in food waste and environmental impact</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Support for vulnerable communities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Promotion of sustainable food practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Building stronger community connections</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block text-green-600">Join our platform today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;