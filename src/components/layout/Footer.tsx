import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold">FoodShare</span>
            </div>
            <p className="text-green-200 text-sm mb-4">
              Connecting food donors with those in need to reduce food waste and fight hunger together.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-200 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-green-200 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-green-200 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-green-200 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-green-200 hover:text-white text-sm">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-green-200 hover:text-white text-sm">About Us</Link>
              </li>
              <li>
                <Link to="/food-listings" className="text-green-200 hover:text-white text-sm">Food Listings</Link>
              </li>
              <li>
                <Link to="/register" className="text-green-200 hover:text-white text-sm">Join Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-green-200 hover:text-white text-sm">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?role=restaurant" className="text-green-200 hover:text-white text-sm">Register as Restaurant</Link>
              </li>
              <li>
                <Link to="/register?role=ngo" className="text-green-200 hover:text-white text-sm">Register as NGO</Link>
              </li>
              <li>
                <Link to="/register?role=orphanage" className="text-green-200 hover:text-white text-sm">Register as Orphanage</Link>
              </li>
              <li>
                <Link to="/faq" className="text-green-200 hover:text-white text-sm">FAQ</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-green-200 hover:text-white text-sm">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-green-200 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Food Street, City, Country</span>
              </li>
              <li className="flex items-center text-green-200 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center text-green-200 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@foodshare.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-green-700 text-center text-green-200 text-sm">
          <p>&copy; {new Date().getFullYear()} FoodShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;