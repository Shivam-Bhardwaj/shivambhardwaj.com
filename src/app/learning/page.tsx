"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Learning() {
  const blogPosts = [
    {
      title: "Building Autonomous Navigation Systems",
      excerpt: "Exploring SLAM algorithms and sensor fusion techniques for robust robot navigation in dynamic environments.",
      date: "Coming Soon",
      readTime: "8 min read",
      tags: ["SLAM", "Robotics", "Navigation"]
    },
    {
      title: "From Prototype to Production: Robotics Hardware",
      excerpt: "Lessons learned scaling robotics hardware from proof-of-concept to manufacturing at scale.",
      date: "Coming Soon", 
      readTime: "12 min read",
      tags: ["Hardware", "Manufacturing", "Scaling"]
    },
    {
      title: "Computer Vision for Robotics Applications",
      excerpt: "Practical approaches to implementing robust perception systems in real-world robotics applications.",
      date: "Coming Soon",
      readTime: "10 min read", 
      tags: ["Computer Vision", "Perception", "Machine Learning"]
    }
  ];

  const learningResources = [
    {
      category: "Robotics Fundamentals",
      resources: [
        "Modern Robotics: Mechanics, Planning, and Control",
        "Probabilistic Robotics by Sebastian Thrun",
        "Introduction to Autonomous Mobile Robots"
      ]
    },
    {
      category: "Control Systems",
      resources: [
        "Feedback Control of Dynamic Systems",
        "Nonlinear Control Systems Design",
        "Model Predictive Control"
      ]
    },
    {
      category: "Computer Vision",
      resources: [
        "Multiple View Geometry in Computer Vision",
        "Computer Vision: Algorithms and Applications",
        "Deep Learning for Computer Vision"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Learning & Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Sharing insights from building robotics systems at scale. Exploring the intersection of 
          hardware, software, and the challenges of bringing autonomous systems to production.
        </p>
      </motion.div>

      {/* Blog Posts Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* Learning Resources Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-8">Learning Resources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {learningResources.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                {category.category}
              </h3>
              <ul className="space-y-2">
                {category.resources.map((resource, resourceIndex) => (
                  <li 
                    key={resourceIndex}
                    className="text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Newsletter Signup */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-center text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Get notified when I publish new articles about robotics, autonomous systems, and engineering insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Subscribe
          </button>
        </div>
        <p className="text-xs text-blue-100 mt-4">
          No spam, unsubscribe at any time. Content coming soon!
        </p>
      </motion.section>
    </div>
  );
}