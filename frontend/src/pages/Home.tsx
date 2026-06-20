import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, QrCode, CreditCard, Shield, Users, Zap } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home: React.FC = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR-Based Entry',
      description: 'Secure, daily unique QR codes for seamless event entry',
    },
    {
      icon: CreditCard,
      title: 'Easy Payments',
      description: 'Integrated Razorpay for secure and fast transactions',
    },
    {
      icon: Calendar,
      title: '70+ Events',
      description: 'Sports, cultural, technical, and academic events',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Google OAuth authentication and encrypted data',
    },
    {
      icon: Users,
      title: 'Multi-Event Participation',
      description: 'Register for multiple events with single profile',
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Automated emails with QR codes and receipts',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Cerebrexia
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Your Premier Event Management Platform
            </p>
            <p className="text-lg mb-10 max-w-2xl mx-auto text-indigo-50">
              Seamless registration, secure QR-based entry, and transparent payment
              processing for 70+ exciting events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button size="lg" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', padding: '12px 32px' }}>
                  Browse Events
                </Button>
              </Link>
              <Link to="/my-registrations">
                <Button size="lg" style={{ backgroundColor: '#f59e0b', color: 'white', fontWeight: 'bold', padding: '12px 32px', border: '3px solid white' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Cerebrexia?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of event management with our cutting-edge platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <feature.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">70+</div>
              <div className="text-gray-600">Events</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">5000+</div>
              <div className="text-gray-600">Participants</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-gray-600">Secure</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of participants and experience seamless event management
          </p>
          <Link to="/events">
            <Button size="lg" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', padding: '12px 32px' }}>
              Explore Events Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

// Made with Bob
