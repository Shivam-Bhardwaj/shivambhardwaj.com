import TechStack from '@/components/TechStack';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase">System Status</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-mono">
              <li><span className="text-gray-500 dark:text-gray-500">Environment:</span> {process.env.NODE_ENV}</li>
              <li><span className="text-gray-500 dark:text-gray-500">Platform:</span> Google Cloud</li>
              <li><span className="text-gray-500 dark:text-gray-500">Version:</span> 1.0.0</li>
              <li><span className="text-gray-500 dark:text-gray-500">Status:</span> <span className="text-emerald-600 dark:text-emerald-400">Active</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase">Technology Stack</h4>
            <div className="pt-2">
              <TechStack />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase">Links</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li><Link href="/blog" className="hover:text-gray-900 dark:hover:text-gray-200">Blog</Link></li>
              <li><Link href="/projects" className="hover:text-gray-900 dark:hover:text-gray-200">Projects</Link></li>
              <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-gray-200">About</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-gray-200">Contact</Link></li>
              <li><a href="https://github.com/Shivam-Bhardwaj" target="_blank" rel="noopener" className="hover:text-gray-900 dark:hover:text-gray-200">GitHub</a></li>
              <li><a href="https://www.linkedin.com/in/shivambdj/" target="_blank" rel="noopener" className="hover:text-gray-900 dark:hover:text-gray-200">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-xs flex flex-col md:flex-row gap-4 items-center justify-between text-gray-500 dark:text-gray-500">
          <p>© {year} Antimony Labs. All rights reserved.</p>
          <p className="font-mono">Powered by Next.js • Deployed on Google Cloud</p>
        </div>
      </div>
    </footer>
  );
}
