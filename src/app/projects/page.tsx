import { getProjects } from '@/lib/portfolio';
import { SiDocker, SiKubernetes, SiAmazonec2, SiNodedotjs, SiThreedotjs, SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';

const techIconMap: Record<string, JSX.Element> = {
  Docker: <SiDocker className="w-4 h-4" />,
  Kubernetes: <SiKubernetes className="w-4 h-4" />,
  'AWS EKS': <SiAmazonec2 className="w-4 h-4" />,
  'Node.js': <SiNodedotjs className="w-4 h-4" />,
  'Three.js': <SiThreedotjs className="w-4 h-4" />,
  'Next.js': <SiNextdotjs className="w-4 h-4" />,
  'Tailwind CSS': <SiTailwindcss className="w-4 h-4" />,
  TypeScript: <SiTypescript className="w-4 h-4" />,
};

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <h1 className="heading-1 mb-4">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">Curated engineering and research work with a focus on robotics, cloud deployment, and interactive simulation.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map(p => (
              <div key={p.id} className="card p-6 flex flex-col gap-4 group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold leading-tight">{p.name}</h2>
                  {p.featured && <span className="text-xs rounded bg-secondary-600/10 text-secondary-700 dark:text-secondary-300 px-2 py-1 font-medium">Featured</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">{p.shortDescription}</p>
                <ul className="flex flex-wrap gap-2 text-xs">
                  {p.technologies.map(t => (
                    <li key={t.name} className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-800/40 flex items-center gap-1">
                      {techIconMap[t.name]}
                      <span>{t.name}</span>
                    </li>
                  ))}
                </ul>
                {p.highlights && (
                  <ul className="text-xs space-y-1 border-t pt-2">
                    {p.highlights.slice(0,3).map(h => <li key={h} className="text-gray-500 dark:text-gray-400">• {h}</li>)}
                  </ul>
                )}
                <div className="flex flex-wrap gap-3 pt-1">
                  {p.links.map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener" className="text-xs text-primary-600 dark:text-primary-300 hover:underline">
                      {l.label || l.type}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}