import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Hub | Shivam Bhardwaj",
  description: "Learn software engineering, Docker, GitHub Actions, and modern development practices",
};

interface LearningResource {
  slug: string;
  title: string;
  description: string;
  type: "tutorial" | "guide" | "course" | "article";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  tags: string[];
}

const resources: LearningResource[] = [
  {
    slug: "docker-basics",
    title: "Docker Basics: From Zero to Hero",
    description: "Complete guide to containerization, Dockerfiles, and Docker Compose",
    type: "course",
    difficulty: "beginner",
    duration: "2 hours",
    tags: ["Docker", "Containers", "DevOps"],
  },
  {
    slug: "git-worktrees-mastery",
    title: "Git Worktrees: Master Parallel Development",
    description: "Learn how to work on multiple branches simultaneously without context switching",
    type: "tutorial",
    difficulty: "intermediate",
    duration: "30 min",
    tags: ["Git", "Workflow", "Version Control"],
  },
  {
    slug: "github-actions-ci-cd",
    title: "Building CI/CD with GitHub Actions",
    description: "Create professional CI/CD pipelines with automated testing and deployment",
    type: "guide",
    difficulty: "intermediate",
    duration: "1 hour",
    tags: ["GitHub Actions", "CI/CD", "Automation"],
  },
  {
    slug: "visual-testing-playwright",
    title: "Visual Regression Testing with Playwright",
    description: "Set up visual testing in headless environments using Docker and Playwright",
    type: "tutorial",
    difficulty: "advanced",
    duration: "45 min",
    tags: ["Testing", "Playwright", "Docker"],
  },
];

export default function LearningPage() {
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

