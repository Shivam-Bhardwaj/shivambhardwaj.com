import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SbL Logs | Antimony Labs',
  description: 'Development logs, struggles, learnings, and insights from building Antimony Labs using LLMs and modern web technologies.',
  keywords: 'development logs, web development, LLMs, AI-assisted coding, Antimony Labs, struggles, learning',

  openGraph: {
    title: 'SbL Logs | Antimony Labs',
    description: 'Development logs, struggles, learnings, and insights from building Antimony Labs using LLMs and modern web technologies.',
    url: 'https://antimony-labs.vercel.app/sbl-logs',
    siteName: 'Antimony Labs',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SbL Logs | Antimony Labs',
    description: 'Development logs, struggles, learnings, and insights from building Antimony Labs using LLMs and modern web technologies.',
    creator: '@antimony_labs',
  },

  alternates: {
    canonical: 'https://antimony-labs.vercel.app/sbl-logs',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function SbLLogsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold mb-4">SbL Logs</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Behind-the-scenes development logs from Antimony Labs. Exploring the journey of building modern web applications with LLMs, the challenges faced, lessons learned, and insights on AI-assisted development.
            </p>
          </header>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">The Development Process</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                Building Antimony Labs has been an iterative process of experimentation and refinement. Starting with a vision to create a portfolio that showcases both technical expertise and creative problem-solving, we've leveraged modern web technologies like Next.js, TypeScript, and Tailwind CSS to build a responsive, performant site.
              </p>
              <p>
                The process involves continuous integration of new features, from GitHub contribution graphs to infrastructure monitoring dashboards, each requiring careful consideration of user experience, performance, and maintainability.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Struggles and Challenges</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Technical Hurdles</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Balancing performance with feature-rich components</li>
                  <li>• Managing complex state in React applications</li>
                  <li>• Optimizing for both desktop and mobile experiences</li>
                  <li>• Integrating third-party APIs securely</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Development Challenges</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Debugging AI-generated code inconsistencies</li>
                  <li>• Maintaining code quality across rapid iterations</li>
                  <li>• Keeping up with evolving best practices</li>
                  <li>• Balancing innovation with stability</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Learning Journey</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                Every project is a learning opportunity. Through Antimony Labs, we've deepened our understanding of:
              </p>
              <ul>
                <li><strong>AI-Assisted Development:</strong> How LLMs can accelerate prototyping but require human oversight for quality</li>
                <li><strong>Modern React Patterns:</strong> Server components, hooks optimization, and state management strategies</li>
                <li><strong>Performance Optimization:</strong> Bundle analysis, lazy loading, and caching strategies</li>
                <li><strong>DevOps Integration:</strong> CI/CD pipelines, monitoring, and deployment automation</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Web Dev with LLMs: What We've Learned</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">AI as a Collaborative Tool</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    LLMs excel at generating boilerplate code and suggesting patterns, but they shine brightest when used as a pair programmer rather than a replacement for human creativity.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Quality Assurance is Paramount</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Always review and test AI-generated code thoroughly. While LLMs can produce functional code quickly, they may introduce subtle bugs or suboptimal patterns.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Continuous Learning Required</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    The field of AI-assisted development is rapidly evolving. Staying updated with new models, tools, and best practices is crucial for maximizing productivity.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Human Oversight Essential</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    LLMs can handle routine tasks efficiently, but complex architectural decisions and creative problem-solving still require human expertise and experience.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Future Directions</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                As we continue developing Antimony Labs, we're excited to explore new frontiers in AI-assisted development. This includes integrating more advanced LLM capabilities, experimenting with AI-driven design systems, and sharing our findings with the broader developer community.
              </p>
              <p>
                The goal is not just to build better software, but to contribute to the evolution of how we approach software development in an AI-augmented world.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}