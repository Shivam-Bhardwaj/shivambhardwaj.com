'use client';

import Link from 'next/link';
import { SiGithub, SiLinkedin, SiX } from 'react-icons/si';
import { HiEnvelope } from 'react-icons/hi2';
import GitHubContributionGraph from '@/components/GitHubContributionGraph';
import ProjectsShowcase from '@/components/ProjectsShowcase';

export default function HomePage() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Antimony Labs
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Robotics Engineer & Portfolio
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Professional portfolio showcasing robotics engineering expertise, 
            project management experience, and technical skills in autonomous systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link 
              href="/projects" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Projects
            </Link>
            <Link 
              href="/about" 
              className="border border-blue-600 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View Experience
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            <a
              href="https://github.com/Shivam-Bhardwaj"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="GitHub"
            >
              <SiGithub className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/shivambdj/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="LinkedIn"
            >
              <SiLinkedin className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/LazyShivam"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="Twitter/X"
            >
              <SiX className="w-6 h-6" />
            </a>
            <a
              href="mailto:curious.antimony@gmail.com"
              className="p-3 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Email"
            >
              <HiEnvelope className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* GitHub Contribution Graph */}
          <div className="lg:col-span-2">
            <GitHubContributionGraph />
          </div>

          {/* Projects Showcase */}
          <div>
            <ProjectsShowcase maxProjects={6} />
          </div>
        </div>

        {/* Expertise Cards - Compact Row */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Core Expertise</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">R</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Robotics</h3>
              <p className="text-sm text-gray-600">Autonomous systems & navigation</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">P</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Project Management</h3>
              <p className="text-sm text-gray-600">Leading technical teams</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">A</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Architecture</h3>
              <p className="text-sm text-gray-600">Cloud-based solutions</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-orange-600">I</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Innovation</h3>
              <p className="text-sm text-gray-600">AI & machine learning</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}