'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiThreedotjs,
  SiFramer,
  SiNodedotjs,
  SiGooglecloud,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiVitest,
  SiEslint,
  SiVite,
  SiZod,
} from 'react-icons/si';
import { FaTheaterMasks } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface TechStackIconProps {
  name: string;
  version: string;
  category: string;
  description?: string;
}

// Map technology names to their icons
const iconMap: Record<string, IconType> = {
  'Next.js': SiNextdotjs,
  'React': SiReact,
  'TypeScript': SiTypescript,
  'Tailwind CSS': SiTailwindcss,
  'Three.js': SiThreedotjs,
  'React Three Fiber': SiThreedotjs,
  'Framer Motion': SiFramer,
  'Node.js': SiNodedotjs,
  'Google Cloud': SiGooglecloud,
  'GCP Logging': SiGooglecloud,
  'GCP Monitoring': SiGooglecloud,
  'Vitest': SiVitest,
  'Playwright': FaTheaterMasks,
  'ESLint': SiEslint,
  'Vite': SiVite,
  'Docker': SiDocker,
  'Kubernetes': SiKubernetes,
  'Terraform': SiTerraform,
  'Zod': SiZod,
};

// Category colors
const categoryColors: Record<string, string> = {
  frontend: 'text-blue-600 dark:text-blue-400',
  language: 'text-yellow-600 dark:text-yellow-400',
  styling: 'text-pink-600 dark:text-pink-400',
  '3d': 'text-purple-600 dark:text-purple-400',
  animation: 'text-green-600 dark:text-green-400',
  runtime: 'text-orange-600 dark:text-orange-400',
  cloud: 'text-sky-600 dark:text-sky-400',
  testing: 'text-red-600 dark:text-red-400',
  tools: 'text-gray-600 dark:text-gray-400',
  devops: 'text-indigo-600 dark:text-indigo-400',
  validation: 'text-teal-600 dark:text-teal-400',
};

export default function TechStackIcon({
  name,
  version,
  category,
  description,
}: TechStackIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[name] || SiReact; // Fallback to React icon
  const colorClass = categoryColors[category] || 'text-gray-600 dark:text-gray-400';

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon Container */}
      <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700">
        <Icon className={`w-8 h-8 ${colorClass} transition-all duration-300`} />
      </div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
          scale: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none z-50"
        style={{ visibility: isHovered ? 'visible' : 'hidden' }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 min-w-[160px]">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-gray-900"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {name}
            </div>
            <div className="text-xs font-mono text-primary-600 dark:text-primary-400">
              v{version}
            </div>
            {description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-[200px]">
                {description}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}