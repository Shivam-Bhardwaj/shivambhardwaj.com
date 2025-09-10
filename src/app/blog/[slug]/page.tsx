import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/blog-data';
import { BlogManager } from '@/lib/blog-utils';
import { ArticleStructuredData } from '@/components/StructuredData';
import { SocialShareButtons, BlogPostSocialButtons } from '@/components/SocialShareButtons';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = 'https://antimony-labs.vercel.app';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Antimony Labs`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags.join(', '),
    
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'Antimony Labs',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@antimony_labs',
    },

    alternates: {
      canonical: postUrl,
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
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const blogManager = new BlogManager(blogPosts);
  const relatedPosts = blogManager.getRelatedPosts(post, 3);
  const siteUrl = 'https://antimony-labs.vercel.app';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <>
      <ArticleStructuredData post={post} url={postUrl} />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back to blog link */}
          <Link 
            href="/blog" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {/* Post header */}
          <header className="mb-12">
            {/* Hero section with gradient background */}
            <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {post.title}
                </h1>
                <p className="text-primary-100 text-lg md:text-xl max-w-3xl">
                  {post.excerpt}
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>
            
            {/* Meta information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Published</div>
                      <time dateTime={post.date} className="text-sm">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </time>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Reading time</div>
                      <div className="text-sm">{post.readTime}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Author</div>
                      <div className="text-sm">{post.author}</div>
                    </div>
                  </div>
                </div>
                
                {/* Social share buttons */}
                <SocialShareButtons post={post} />
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800 hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-800/30 dark:hover:to-primary-700/30 transition-all cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {/* Post content */}
          <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white first:mt-0 pb-4 border-b border-gray-200 dark:border-gray-700">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white first:mt-0 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-bold mt-10 mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-0.5 h-6 bg-primary-400 rounded-full"></div>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none mb-6 space-y-3 text-gray-700 dark:text-gray-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-6 space-y-3 text-gray-700 dark:text-gray-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>{children}</div>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 pl-6 py-4 my-8 rounded-r-lg">
                      <div className="italic text-gray-700 dark:text-gray-300 text-lg">
                        {children}
                      </div>
                    </blockquote>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-sm font-mono border border-primary-200 dark:border-primary-700">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <div className="my-8">
                      <div className="bg-gray-800 dark:bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-6 rounded-b-lg overflow-x-auto border border-gray-700 dark:border-gray-600">
                        {children}
                      </pre>
                    </div>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline decoration-primary-300 dark:decoration-primary-600 hover:decoration-primary-500 transition-colors font-medium"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  hr: () => (
                    <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700 w-24 mx-auto rounded-full" />
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => <em className="italic text-primary-700 dark:text-primary-300">{children}</em>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.slug}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 overflow-hidden"
                  >
                    <Link href={`/blog/${relatedPost.slug}`} className="block h-full">
                      <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <time dateTime={relatedPost.date}>
                            {new Date(relatedPost.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric' 
                            })}
                          </time>
                          <span>•</span>
                          <span>{relatedPost.readTime}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 flex-grow mb-4">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {relatedPost.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {relatedPost.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                              +{relatedPost.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Post footer */}
          <footer className="mt-16 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Navigation */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/blog" 
                    className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to all posts
                  </Link>
                  
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>
                </div>
                
                {/* Social Share */}
                <BlogPostSocialButtons post={post} />
              </div>
              
              {/* Author info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {post.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{post.author}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Published on {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </main>
    </>
  );
}