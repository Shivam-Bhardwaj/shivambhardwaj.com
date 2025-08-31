"use client";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

const companies = [
  { name: "Applied Materials", logo: "/logos/amat.svg" },
  { name: "Meta", logo: "/logos/meta.svg" },
  { name: "Saildrone", logo: "/logos/saildrone.svg" },
  { name: "Tesla", logo: "/logos/tesla.svg" }
];

// Add your hero images here - they should be placed in public/hero-images/
const heroImages = [
  { src: "/hero-images/robotics-lab.jpg", alt: "Robotics Lab", fallback: true },
  { src: "/hero-images/autonomous-system.jpg", alt: "Autonomous System", fallback: true },
  { src: "/hero-images/medical-device.jpg", alt: "Medical Device", fallback: true },
  { src: "/hero-images/production-line.jpg", alt: "Production Line", fallback: true }
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile Layout - Scrollable
  if (isMobile) {
    return (
      <div className="min-h-screen py-16 px-4">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {siteConfig.name}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-3">
            Senior Robotics Engineer
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
            Turning prototypes into production systems.
            Specializing in autonomous systems and hardware-software integration.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-3 mb-12"
        >
          <Link href="/projects" className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors">
            View Projects
          </Link>
          <Link href="/contact" className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-center transition-colors">
            Get In Touch
          </Link>
        </motion.div>

        {/* Companies */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-6">Trusted by</p>
          <div className="grid grid-cols-2 gap-4">
            {companies.map(company => (
              <div key={company.name} className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {company.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Skills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {['Robotics', 'Autonomous Systems', 'Computer Vision', 'Project Management'].map(skill => (
            <div key={skill} className="text-xs text-center py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-md">
              {skill}
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Desktop Layout - Minimalistic
  return (
    <div className="w-full max-w-4xl mx-auto px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {siteConfig.name}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4">
          Senior Robotics Engineer
        </p>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto">
          Turning prototypes into production systems. Specializing in autonomous systems, 
          perception, and hardware-software integration.
        </p>
        
        {/* Hero Images Gallery */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {heroImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group"
              >
                {image.fallback ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">{image.alt}</p>
                      <p className="text-xs mt-1 opacity-60">Drop image in hero-images/</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Companies */}
        <div className="mb-12">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 md:mb-8">Trusted by</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 items-center">
            {companies.map(company => (
              <div key={company.name} className="text-base md:text-lg font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                {company.name}
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}