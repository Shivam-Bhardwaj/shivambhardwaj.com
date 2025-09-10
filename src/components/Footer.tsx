import TechStack from '@/components/TechStack';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-2 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="grid gap-4 md:grid-cols-3 mb-3">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase">System Status</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Environment:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Infrastructure:</span>
                <span>Google Cloud Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Services:</span>
                <span>Cloud Run • Cloud CDN • Cloud SQL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400">• Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase">Technology Stack</h4>
            <div className="pt-1">
              <TechStack />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase">Links</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
              <Link href="/blog" className="hover:text-gray-900 dark:hover:text-gray-200">Smoke in the net</Link>
              <Link href="/projects" className="hover:text-gray-900 dark:hover:text-gray-200">Projects</Link>
              <Link href="/about" className="hover:text-gray-900 dark:hover:text-gray-200">About</Link>
              <Link href="/contact" className="hover:text-gray-900 dark:hover:text-gray-200">Contact</Link>
              <a href="https://github.com/Shivam-Bhardwaj" target="_blank" rel="noopener" className="hover:text-gray-900 dark:hover:text-gray-200">GitHub</a>
              <a href="https://www.linkedin.com/in/shivambdj/" target="_blank" rel="noopener" className="hover:text-gray-900 dark:hover:text-gray-200">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-2 text-xs flex flex-col md:flex-row gap-1 items-center justify-between text-gray-500 dark:text-gray-500">
          <p>© {year} Shivam Bhardwaj • SbL • Antimony Labs • ShivamBhardwaj Labs. All rights reserved.</p>
          <p className="font-mono text-[10px]">Powered by Next.js + Deployed on Google Cloud</p>
        </div>
      </div>
    </footer>
  );
}
