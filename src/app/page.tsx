'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Users, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <FileText className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">NotesApp</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Multi-Tenant Notes
            <span className="text-blue-600"> SaaS Platform</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Secure, scalable note-taking solution for teams. Built with Next.js, 
            featuring tenant isolation, role-based access, and subscription management.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg">
              View Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need for secure, scalable note management
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Users className="h-8 w-8 text-blue-600" />,
              title: "Multi-Tenancy",
              description: "Strict tenant isolation with shared schema approach for optimal performance"
            },
            {
              icon: <Shield className="h-8 w-8 text-green-600" />,
              title: "Role-Based Access",
              description: "Admin and Member roles with granular permissions and JWT authentication"
            },
            {
              icon: <Zap className="h-8 w-8 text-purple-600" />,
              title: "Subscription Plans",
              description: "Free (3 notes) and Pro (unlimited) plans with seamless upgrade flow"
            },
            {
              icon: <FileText className="h-8 w-8 text-orange-600" />,
              title: "CRUD Operations",
              description: "Complete note management with create, read, update, and delete operations"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Test Accounts Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">
            Test the Platform
          </h2>
          <p className="text-gray-300 text-center mb-8">
            Use these predefined accounts to explore the multi-tenant functionality
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Acme Corporation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>admin@acme.test (Admin)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>user@acme.test (Member)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Globex Inc</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>admin@globex.test (Admin)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>user@globex.test (Member)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">Default password for all accounts: <code className="bg-gray-800 px-2 py-1 rounded">password</code></p>
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              Try Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 NotesApp. Built with Next.js, TypeScript, and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
