import Link from "next/link";
import { Metadata } from "next";
import { getLearningResources } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learning Hub | Shivam Bhardwaj",
  description: "Learn software engineering, Docker, GitHub Actions, and modern development practices",
};

export default function LearningPage() {
  const resources = getLearningResources();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learning Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn software engineering, Docker, GitHub Actions, and modern development practices.
            From beginner to advanced, follow along with my journey and learn from real-world examples.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {resources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/learning/${resource.slug}`}
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors block"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    resource.type === "course"
                      ? "bg-purple-500/20 text-purple-500"
                      : resource.type === "tutorial"
                      ? "bg-blue-500/20 text-blue-500"
                      : resource.type === "guide"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  {resource.type}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    resource.difficulty === "beginner"
                      ? "bg-green-500/20 text-green-500"
                      : resource.difficulty === "intermediate"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {resource.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                {resource.title}
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                {resource.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {resource.duration}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="border-t border-border pt-12">
          <h2 className="text-2xl font-semibold mb-4">Learning Path</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Week 1-2: Docker Fundamentals</h3>
                <p className="text-muted-foreground text-sm">
                  Learn containerization basics, Dockerfiles, and Docker Compose
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Week 3-4: Git Worktrees & GitHub Actions</h3>
                <p className="text-muted-foreground text-sm">
                  Master parallel development and CI/CD automation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Week 5-6: Testing & Quality</h3>
                <p className="text-muted-foreground text-sm">
                  Visual testing, E2E testing, and quality assurance
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Week 7-8: Advanced Patterns</h3>
                <p className="text-muted-foreground text-sm">
                  Microservices, advanced Docker patterns, and production deployments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

