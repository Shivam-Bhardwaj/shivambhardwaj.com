import { BlogPost } from '@/lib/blog-data';

interface ArticleStructuredDataProps {
  post: BlogPost;
  url: string;
}

export function ArticleStructuredData({ post, url }: ArticleStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `https://antimony-labs.vercel.app/api/og?title=${encodeURIComponent(post.title)}`,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Antimony Labs',
      logo: {
        '@type': 'ImageObject',
        url: 'https://antimony-labs.vercel.app/favicon.ico',
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags.join(', '),
    articleSection: 'Technology',
    wordCount: post.content.trim().split(/\s+/).length,
    timeRequired: `PT${post.readTime.replace(' min read', '')}M`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  );
}

interface BlogStructuredDataProps {
  posts: BlogPost[];
  url: string;
}

export function BlogStructuredData({ posts, url }: BlogStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Antimony Labs Blog',
    description: 'Thoughts on technology, engineering, AI agents, and creative development solutions.',
    url: url,
    author: {
      '@type': 'Organization',
      name: 'Antimony Labs',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Antimony Labs',
      logo: {
        '@type': 'ImageObject',
        url: 'https://antimony-labs.vercel.app/favicon.ico',
      },
    },
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://antimony-labs.vercel.app/blog/${post.slug}`,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      keywords: post.tags.join(', '),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  );
}