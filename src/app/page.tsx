import Link from 'next/link';
import { SiGithub, SiLinkedin, SiX } from 'react-icons/si';
import { HiEnvelope } from 'react-icons/hi2';
import GitHubContributionGraph from '@/components/GitHubContributionGraph';
import DynamicZone from '@/components/system/DynamicZone';
import FeatureFlag from '@/components/system/FeatureFlag';
import { contentManager } from '@/lib/server/content-manager';

export default async function HomePage() {
  // Fetch content on server-side
  const heroContent = await contentManager.findById('home-hero');
  const techContent = await contentManager.findById('tech-showcase');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex-1 flex flex-col">
        {/* Dynamic Hero Section */}
        <div className="text-center mb-3 relative">
          <DynamicZone
            componentId="animated-text"
            props={{
              text: heroContent?.content?.title || "Robotics Engineer & Systems Developer",
              animation: "typewriter",
              className: "text-lg text-gray-700 dark:text-gray-300 mb-1",
            }}
            fallback={
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                Robotics Engineer & Portfolio
              </p>
            }
          />
          
          <DynamicZone
            componentId="animated-text"
            props={{
              text: heroContent?.content?.subtitle || "Building autonomous systems and intelligent machines",
              animation: "fadeIn",
              delay: 1500,
              className: "text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-3",
            }}
            fallback={
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-3">
                Professional portfolio showcasing robotics engineering expertise,
                project management experience, and technical skills in autonomous systems.
              </p>
            }
          />
          
          {/* Particle Background for Hero Section */}
          <FeatureFlag flag="particle_effects">
            <DynamicZone
              componentId="particle-background"
              props={{
                particleCount: 50,
                style: "floating",
                opacity: 0.3,
                interactive: true,
                className: "absolute inset-0 pointer-events-none",
              }}
            />
          </FeatureFlag>

          <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
            <DynamicZone
              componentId="magnetic-button"
              props={{
                children: (
                  <Link
                    href="/projects"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors block"
                  >
                    Explore Projects
                  </Link>
                ),
                strength: 0.3,
                distance: 80,
              }}
              fallback={
                <Link
                  href="/projects"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Explore Projects
                </Link>
              }
            />
            <DynamicZone
              componentId="magnetic-button"
              props={{
                children: (
                  <Link
                    href="/about"
                    className="border border-blue-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors block"
                  >
                    View Experience
                  </Link>
                ),
                strength: 0.2,
                distance: 70,
              }}
              fallback={
                <Link
                  href="/about"
                  className="border border-blue-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  View Experience
                </Link>
              }
            />
          </div>

          {/* Social Links - Compact */}
          <div className="flex justify-center gap-3 mb-3">
            <a
              href="https://github.com/Shivam-Bhardwaj"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              aria-label="GitHub"
            >
              <SiGithub className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
            </a>
            <a
              href="https://www.linkedin.com/in/shivambdj/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              aria-label="LinkedIn"
            >
              <SiLinkedin className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
            </a>
            <a
              href="https://x.com/LazyShivam"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              aria-label="Twitter/X"
            >
              <SiX className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
            </a>
            <a
              href="mailto:curious.antimony@gmail.com"
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
              aria-label="Email"
            >
              <HiEnvelope className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Main Content - Compact */}
        <div className="mb-3 flex-1">
          <GitHubContributionGraph />
        </div>

        {/* Expertise Cards - Compact Row */}
        <div className="mb-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 text-center mb-2">Core Expertise</h2>
          <div className="grid md:grid-cols-4 gap-2">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">R</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-xs">Robotics</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Autonomous systems & navigation</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">P</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-xs">Project Management</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Leading technical teams</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">A</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-xs">Architecture</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cloud-based solutions</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">I</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-xs">Innovation</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">AI & machine learning</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}