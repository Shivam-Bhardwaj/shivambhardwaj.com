import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiments | Shivam Bhardwaj",
  description: "Experimental projects, prototypes, and proof-of-concepts",
};

interface Experiment {
  slug: string;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  tags: string[];
  github?: string;
  demo?: string;
}

const experiments: Experiment[] = [
  {
    slug: "docker-worktree-integration",
    title: "Docker + Worktrees Integration",
    description: "Automated Docker container management per Git worktree",
    status: "active",
    tags: ["Docker", "Git", "Automation"],
    github: "https://github.com/Shivam-Bhardwaj/dev-setup",
  },
  {
    slug: "visual-testing-headless",
    title: "Headless Visual Testing Pipeline",
    description: "Playwright-based visual regression testing in Docker containers",
    status: "completed",
    tags: ["Testing", "Docker", "Playwright"],
  },
  {
    slug: "github-actions-library",
    title: "Reusable GitHub Actions",
    description: "Collection of reusable workflows for CI/CD, issue automation, and deployments",
    status: "active",
    tags: ["GitHub Actions", "CI/CD", "Automation"],
  },
];

export default function ExperimentsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Experiments</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Experimental projects, prototypes, and proof-of-concepts. These are my playground for testing new ideas and technologies.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((experiment) => (
            <div
              key={experiment.slug}
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <Link href={`/experiments/${experiment.slug}`}>
                  <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                    {experiment.title}
                  </h2>
                </Link>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    experiment.status === "active"
                      ? "bg-green-500/20 text-green-500"
                      : experiment.status === "completed"
                      ? "bg-blue-500/20 text-blue-500"
                      : "bg-gray-500/20 text-gray-500"
                  }`}
                >
                  {experiment.status}
                </span>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                {experiment.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {experiment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                {experiment.github && (
                  <a
                    href={experiment.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    GitHub →
                  </a>
                )}
                {experiment.demo && (
                  <a
                    href={experiment.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Demo →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

