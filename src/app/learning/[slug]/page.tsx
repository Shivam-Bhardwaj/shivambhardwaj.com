import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLearningResource, getLearningResources } from "@/lib/content";
import { markdownToHtml } from "@/lib/content";
import Link from "next/link";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const resources = getLearningResources();
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resource = getLearningResource(params.slug);
  
  if (!resource) {
    return {
      title: "Resource Not Found",
    };
  }

  return {
    title: resource.title,
    description: resource.description,
  };
}

export default async function LearningPage({ params }: Props) {
  const resource = getLearningResource(params.slug);

  if (!resource) {
    notFound();
  }

  const contentHtml = await markdownToHtml(resource.content);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/learning"
          className="text-primary hover:underline mb-8 inline-block"
        >
          ← Back to Learning Hub
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold">{resource.title}</h1>
              <div className="flex gap-2">
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
            </div>
            <p className="text-xl text-muted-foreground mb-4">
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
              <span className="text-sm text-muted-foreground">
                Duration: {resource.duration}
              </span>
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

