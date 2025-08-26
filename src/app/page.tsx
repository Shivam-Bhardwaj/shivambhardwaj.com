"use client";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import Link from "next/link";
import { useState, useEffect } from "react";

const skills = {
  "Robotics": ["ROS/ROS2", "SLAM", "Computer Vision", "Motion Planning", "Control Systems"],
  "Software": ["Python", "C++", "TypeScript", "Docker/K8s", "Cloud (AWS/GCP)"],
  "Hardware": ["Embedded Systems", "PCB Design", "CAD/SolidWorks", "Sensor Integration"],
  "Management": ["Agile/Scrum", "Technical Leadership", "Cost Optimization", "Risk Assessment"]
};

const experience = [
  { company: "Applied Materials", role: "Sr. Robotics Engineer", year: "2023-Present" },
  { company: "Meta Reality Labs", role: "Robotics Engineer", year: "2022-2023" },
  { company: "Saildrone", role: "Systems Engineer", year: "2021-2022" },
  { company: "Tesla", role: "Software Engineer", year: "2020-2021" }
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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
      <div className="min-h-screen py-20 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{siteConfig.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Senior Robotics Engineer</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 max-w-md mx-auto">
            Turning prototypes into production systems for Meta, Tesla, and Applied Materials.
          </p>
        </div>

        {/* Skills */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map(skill => (
                  <span key={skill} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Experience */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Experience</h2>
          {experience.map((job, i) => (
            <div key={i} className="mb-3 text-sm">
              <div className="font-semibold">{job.company}</div>
              <div className="text-gray-600 dark:text-gray-400">{job.role} • {job.year}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-bold mb-4">Contact</h2>
          <div className="space-y-2 text-sm">
            <a href={`mailto:${siteConfig.email}`} className="block text-blue-600 dark:text-blue-400">
              {siteConfig.email}
            </a>
            <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" 
               className="block text-blue-600 dark:text-blue-400">
              LinkedIn
            </a>
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" 
               className="block text-blue-600 dark:text-blue-400">
              GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout - No Scroll, Everything on One Screen
  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Left Panel - Main Info */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {siteConfig.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Senior Robotics Engineer
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
            Turning prototypes into production systems. Specializing in autonomous systems, 
            perception, and hardware-software integration for companies like Meta, Tesla, and Applied Materials.
          </p>
          
          <div className="flex gap-4 mb-12">
            <Link href="/projects">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                View Projects
              </button>
            </Link>
            <Link href="/learning">
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium">
                Learning & Blog
              </button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {siteConfig.email}
            </a>
            
            <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Skills & Experience */}
      <div className="w-1/2 bg-gray-50 dark:bg-gray-900/50 p-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Skills Section - Simplified */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Technical Skills</h2>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">{category}</h3>
                  <div className="space-y-1">
                    {items.map(skill => (
                      <div key={skill} className="text-sm text-gray-700 dark:text-gray-300">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Experience</h2>
            <div className="space-y-4">
              {experience.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="border-l-2 border-blue-600 pl-4"
                >
                  <h3 className="font-semibold">{job.company}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.role} • {job.year}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}