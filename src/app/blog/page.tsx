import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Shivam Bhardwaj",
  description: "Thoughts on software engineering, robotics, and continuous learning",
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  readTime: string;
}

// This will be replaced with actual content loading
const posts: BlogPost[] = [
  {
    slug: "docker-first-development",
    title: "Docker-First Development: My Philosophy",
    excerpt: "Why I containerize everything and how it transformed my workflow",
    date: "2025-11-09",
    tags: ["Docker", "Development", "Philosophy"],
    readTime: "5 min",
  },
  {
    slug: "mastering-git-worktrees",
    title: "Mastering Git Worktrees: A Game Changer",
    excerpt: "How worktrees revolutionized my development workflow and why you should use them",
    date: "2025-11-08",
    tags: ["Git", "Workflow", "Tutorial"],
    readTime: "8 min",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Thoughts on software engineering, robotics, Docker, GitHub Actions, and continuous learning
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-border pb-8 last:border-0"
            >
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>•</span>
                <span>{post.readTime} read</span>
                <span>•</span>
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            More posts coming soon! Subscribe to stay updated.
          </p>
        </div>
      </div>
    </div>
  );
}

