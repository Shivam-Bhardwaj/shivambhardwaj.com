import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperiment, getExperiments } from "@/lib/content";
import { markdownToHtml } from "@/lib/content";
import Link from "next/link";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const experiments = getExperiments();
  return experiments.map((exp) => ({
    slug: exp.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experiment = getExperiment(params.slug);
  
  if (!experiment) {
    return {
      title: "Experiment Not Found",
    };
  }

  return {
    title: experiment.title,
    description: experiment.description,
  };
}

export default async function ExperimentPage({ params }: Props) {
  const experiment = getExperiment(params.slug);

  if (!experiment) {
    notFound();
  }

  const contentHtml = await markdownToHtml(experiment.content);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/experiments"
          className="text-primary hover:underline mb-8 inline-block"
        >
          ← Back to Experiments
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold">{experiment.title}</h1>
              <span
                className={`px-3 py-1 rounded text-sm ${
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
            <p className="text-xl text-muted-foreground mb-4">
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
            <div className="flex gap-4">
              {experiment.github && (
                <a
                  href={experiment.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View on GitHub →
                </a>
              )}
              {experiment.demo && (
                <a
                  href={experiment.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Live Demo →
                </a>
              )}
            </div>
          </header>

          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>
    </div>
  );
}

