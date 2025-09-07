'use client';

import { useState } from 'react';
import { getFeaturedProjects } from '@/lib/portfolio/projects';
import { FiExternalLink, FiGithub, FiChevronRight } from 'react-icons/fi';

interface ProjectsShowcaseProps {
  maxProjects?: number;
}

const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({
  maxProjects = 6
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const projects = getFeaturedProjects().slice(0, maxProjects);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'robotics', label: 'Robotics' },
    { id: 'ai', label: 'AI/ML' },
    { id: 'web', label: 'Web' },
    { id: 'infrastructure', label: 'Infrastructure' }
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'robotics': return 'bg-blue-100 text-blue-800';
      case 'ai': return 'bg-purple-100 text-purple-800';
      case 'web': return 'bg-green-100 text-green-800';
      case 'infrastructure': return 'bg-orange-100 text-orange-800';
      case 'research': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Featured Projects</h2>
        <a
          href="/projects"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          View All
          <FiChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-lg">{project.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
                {project.category}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 4).map(tech => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{project.technologies.length - 4} more
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <FiGithub className="w-4 h-4" />
                  Code
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No projects found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsShowcase;