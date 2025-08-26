"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const projects = [
  {
    title: "Autonomous Navigation System",
    company: "Applied Materials",
    year: "2023",
    description: "Developed SLAM-based navigation for semiconductor manufacturing robots with 99.9% reliability.",
    tech: ["ROS2", "C++", "Python", "SLAM", "Computer Vision"],
    achievements: ["Reduced downtime by 40%", "Improved throughput by 25%", "Zero safety incidents"],
    category: "robotics"
  },
  {
    title: "AR/VR Perception Pipeline", 
    company: "Meta Reality Labs",
    year: "2022",
    description: "Built real-time 3D reconstruction and hand tracking system for Quest Pro headset.",
    tech: ["C++", "CUDA", "OpenCV", "Deep Learning", "Sensor Fusion"],
    achievements: ["30ms latency", "95% tracking accuracy", "Shipped to 1M+ users"],
    category: "perception"
  },
  {
    title: "Ocean Drone Autonomy",
    company: "Saildrone",
    year: "2021",
    description: "Autonomous navigation and obstacle avoidance for unmanned surface vehicles.",
    tech: ["Python", "ROS", "GPS/INS", "Maritime Protocols"],
    achievements: ["10,000+ autonomous hours", "Zero collisions", "COLREGS compliant"],
    category: "robotics"
  },
  {
    title: "Autopilot Sensor Calibration",
    company: "Tesla",
    year: "2020",
    description: "Automated calibration system for multi-camera and radar sensor suite.",
    tech: ["Python", "C++", "TensorFlow", "Sensor Fusion"],
    achievements: ["10x faster calibration", "Sub-pixel accuracy", "Production deployment"],
    category: "perception"
  },
  {
    title: "Swarm Robotics Platform",
    company: "Personal Project",
    year: "2023",
    description: "Decentralized multi-robot coordination system with emergent behaviors.",
    tech: ["TypeScript", "WebGL", "Physics Engine", "Graph Theory"],
    achievements: ["100+ robots simulated", "Real-time coordination", "Open source"],
    category: "research",
    links: {
      github: "https://github.com",
      demo: "/swarm"
    }
  },
  {
    title: "Medical Device Controller",
    company: "Confidential",
    year: "2022",
    description: "FDA-compliant control system for surgical robotics platform.",
    tech: ["C++", "Real-time OS", "IEC 62304", "Safety Critical"],
    achievements: ["FDA 510(k) cleared", "< 1ms latency", "ISO 13485 certified"],
    category: "medical"
  }
];

const categories = [
  { id: "all", name: "All Projects", color: "bg-gray-600" },
  { id: "robotics", name: "Robotics", color: "bg-blue-600" },
  { id: "perception", name: "Perception", color: "bg-purple-600" },
  { id: "medical", name: "Medical", color: "bg-green-600" },
  { id: "research", name: "Research", color: "bg-orange-600" }
];

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          A selection of robotics, perception, and autonomous systems projects from my work at 
          leading tech companies and research initiatives.
        </p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === cat.id
                ? `${cat.color} text-white`
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{project.title}</h3>
              <span className="text-sm text-gray-500">{project.year}</span>
            </div>
            
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{project.company}</p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
              {project.description}
            </p>
            
            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map(tech => (
                <span key={tech} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {tech}
                </span>
              ))}
            </div>
            
            {/* Achievements */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">KEY ACHIEVEMENTS</h4>
              <ul className="space-y-1">
                {project.achievements.map(achievement => (
                  <li key={achievement} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Links */}
            {project.links && (
              <div className="flex gap-3">
                {project.links.github && (
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    GitHub →
                  </a>
                )}
                {project.links.demo && (
                  <Link href={project.links.demo} 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Demo →
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}