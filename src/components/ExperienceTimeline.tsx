'use client';

import { Experience, ExperienceRole } from '@/types/portfolio';
import { SiGooglecloud, SiKubernetes, SiNodedotjs, SiTypescript, SiThreedotjs, SiNextdotjs, SiTailwindcss, SiDocker, SiCplusplus, SiPython, SiOpencv, SiTensorflow, SiReact, SiVercel, SiGithubactions, SiArduino, SiRos, SiLinux } from 'react-icons/si';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaCalendarAlt, FaBuilding } from 'react-icons/fa';

const iconMap: Record<string, JSX.Element> = {
  'GCP': <SiGooglecloud className="w-4 h-4" />,
  'Kubernetes': <SiKubernetes className="w-4 h-4" />,
  'Node.js': <SiNodedotjs className="w-4 h-4" />,
  'TypeScript': <SiTypescript className="w-4 h-4" />,
  'Three.js': <SiThreedotjs className="w-4 h-4" />,
  'Next.js': <SiNextdotjs className="w-4 h-4" />,
  'Tailwind CSS': <SiTailwindcss className="w-4 h-4" />,
  'Docker': <SiDocker className="w-4 h-4" />,
  'C++': <SiCplusplus className="w-4 h-4" />,
  'Python': <SiPython className="w-4 h-4" />,
  'OpenCV': <SiOpencv className="w-4 h-4" />,
  'TensorFlow': <SiTensorflow className="w-4 h-4" />,
  'React': <SiReact className="w-4 h-4" />,
  'Vercel': <SiVercel className="w-4 h-4" />,
  'GitHub Actions': <SiGithubactions className="w-4 h-4" />,
  'Arduino': <SiArduino className="w-4 h-4" />,
  'ROS': <SiRos className="w-4 h-4" />,
  'Gazebo': <div className="w-4 h-4 bg-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">G</div>,
  'Linux': <SiLinux className="w-4 h-4" />,
  'MATLAB': <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">M</div>,
  'CUDA': <div className="w-4 h-4 bg-green-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">CU</div>,
  'Vitest': <div className="w-4 h-4 bg-yellow-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">V</div>,
  'Playwright': <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">PW</div>,
};

interface ExperienceTimelineProps {
  experiences: Experience[];
}

function formatDateRange(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const startFormatted = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  if (!endDate) {
    return `${startFormatted} - Present`;
  }
  
  const end = new Date(endDate);
  const endFormatted = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${startFormatted} - ${endFormatted}`;
}

function calculateDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearsText = `${years} year${years !== 1 ? 's' : ''}`;
    if (remainingMonths === 0) {
      return yearsText;
    }
    return `${yearsText}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {experience.organization}
            </h3>
            {experience.industry && (
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                <FaBuilding className="w-3 h-3" />
                {experience.industry}
              </p>
            )}
          </div>
          <div className="text-right">
            {experience.location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {experience.location}
              </p>
            )}
            {experience.website && (
              <a 
                href={experience.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-end gap-1 mt-1 transition-colors"
              >
                <FaExternalLinkAlt className="w-3 h-3" />
                Visit
              </a>
            )}
          </div>
        </div>
        {experience.summary && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
            {experience.summary}
          </p>
        )}
      </div>

      {/* Roles */}
      <div className="px-6 py-4 space-y-6">
        {experience.roles.map((role, roleIndex) => (
          <div key={`${role.title}-${role.startDate}`} className="relative">
            {/* Timeline connector */}
            {roleIndex < experience.roles.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-gradient-to-b from-blue-400 to-blue-200 dark:from-blue-500 dark:to-blue-700"></div>
            )}
            
            {/* Timeline dot */}
            <div className="absolute left-2 top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
            
            <div className="ml-8">
              {/* Role Header */}
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {role.title}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3" />
                    {formatDateRange(role.startDate, role.endDate)}
                  </p>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    {calculateDuration(role.startDate, role.endDate)}
                  </span>
                </div>
              </div>

              {/* Role Description */}
              {role.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {role.description}
                </p>
              )}

              {/* Achievements */}
              {role.achievements && role.achievements.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Achievements:</h5>
                  <ul className="space-y-1">
                    {role.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span className="leading-relaxed">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {role.technologies && role.technologies.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Technologies:</h5>
                  <div className="flex flex-wrap gap-2">
                    {role.technologies.map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs flex items-center gap-1 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                      >
                        {iconMap[tech]}
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {role.metrics && role.metrics.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Metrics:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {role.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{metric.value}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {experience.tags && experience.tags.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-2">
            {experience.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const sortedExperiences = [...experiences].sort((a, b) => (a.priority || 999) - (b.priority || 999));

  return (
    <section className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Professional Experience
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A comprehensive timeline of my professional journey in robotics, autonomous systems, and software engineering.
        </p>
      </div>

      <div className="space-y-8">
        {sortedExperiences.map((experience, index) => (
          <div key={experience.id} className="relative">
            {/* Timeline connector between companies */}
            {index < sortedExperiences.length - 1 && (
              <div className="absolute left-1/2 -bottom-4 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600 transform -translate-x-0.5 z-0"></div>
            )}
            
            <ExperienceCard experience={experience} />
          </div>
        ))}
      </div>
    </section>
  );
}