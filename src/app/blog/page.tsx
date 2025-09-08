import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';
import { BlogStructuredData } from '@/components/StructuredData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smoke in the net | Antimony Labs',
  description: 'Thoughts on technology, engineering, AI agents, and creative development solutions. Explore articles about modern web development, automation, and innovative tech approaches.',
  keywords: 'technology blog, web development, AI agents, automation, engineering, Next.js, React, DevOps',

  openGraph: {
    title: 'Smoke in the net | Antimony Labs',
    description: 'Thoughts on technology, engineering, AI agents, and creative development solutions.',
    url: 'https://antimony-labs.vercel.app/blog',
    siteName: 'Antimony Labs',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Smoke in the net | Antimony Labs',
    description: 'Thoughts on technology, engineering, AI agents, and creative development solutions.',
    creator: '@antimony_labs',
  },

  alternates: {
    canonical: 'https://antimony-labs.vercel.app/blog',
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

export default function BlogPage() {
  const siteUrl = 'https://antimony-labs.vercel.app';
  const blogUrl = `${siteUrl}/blog`;

  return (
    <>
      <BlogStructuredData posts={blogPosts} url={blogUrl} />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Smoke in the net</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            Thoughts on technology, engineering, and creative development solutions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="p-6 h-full flex flex-col">
                    {/* Header with date and read time */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric' 
                          })}
                        </time>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-3 line-clamp-2 flex-grow-0">
                      {post.title}
                    </h2>
                    
                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Read more CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:underline flex items-center gap-1">
                        Read article
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
    </>
  );
}