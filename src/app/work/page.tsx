import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Arena | Shivam Bhardwaj",
  description: "My personal workspace, active projects, and development dashboard",
};

interface WorkProject {
  slug: string;
  title: string;
  description: string;
  status: "in-progress" | "planning" | "on-hold";
  progress: number;
  tags: string[];
  lastUpdated: string;
}

const activeProjects: WorkProject[] = [
  {
    slug: "portfolio-transformation",
    title: "Portfolio Website Transformation",
    description: "Converting portfolio into fullstack learning platform",
    status: "in-progress",
    progress: 60,
    tags: ["Next.js", "Fullstack", "Portfolio"],
    lastUpdated: "2025-11-09",
  },
  {
    slug: "dev-environment-setup",
    title: "Ultimate Dev Environment",
    description: "Docker-first development setup with worktrees and automation",
    status: "in-progress",
    progress: 90,
    tags: ["Docker", "Automation", "DevOps"],
    lastUpdated: "2025-11-09",
  },
  {
    slug: "github-actions-library",
    title: "Reusable GitHub Actions",
    description: "Library of reusable workflows for common CI/CD patterns",
    status: "in-progress",
    progress: 40,
    tags: ["GitHub Actions", "CI/CD"],
    lastUpdated: "2025-11-08",
  },
];

export default function WorkArenaPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Work Arena</h1>
        <p className="text-xl text-muted-foreground mb-12">
          My personal workspace, active projects, and development dashboard. 
          This is where I track my work, experiments, and learning progress.
        </p>

        <div className="grid gap-6 mb-12">
          {activeProjects.map((project) => (
            <div
              key={project.slug}
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link href={`/work/${project.slug}`}>
                    <h2 className="text-2xl font-semibold mb-2 hover:text-primary transition-colors">
                      {project.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    project.status === "in-progress"
                      ? "bg-blue-500/20 text-blue-500"
                      : project.status === "planning"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-gray-500/20 text-gray-500"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(project.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-semibold">{activeProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Week's Commits</span>
                <span className="font-semibold">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours This Week</span>
                <span className="font-semibold">--</span>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p>Set up portfolio architecture</p>
                  <p className="text-muted-foreground text-xs">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p>Created Docker templates</p>
                  <p className="text-muted-foreground text-xs">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p>Implemented GitHub Actions workflows</p>
                  <p className="text-muted-foreground text-xs">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

