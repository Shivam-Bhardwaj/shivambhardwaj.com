import { getExperience } from '@/lib/portfolio';
import { SiGooglecloud, SiKubernetes, SiNodedotjs, SiTypescript, SiThreedotjs, SiNextdotjs, SiTailwindcss, SiDocker } from 'react-icons/si';

const iconMap: Record<string, JSX.Element> = {
  GCP: <SiGooglecloud className="w-4 h-4" />,
  Kubernetes: <SiKubernetes className="w-4 h-4" />,
  'Node.js': <SiNodedotjs className="w-4 h-4" />,
  TypeScript: <SiTypescript className="w-4 h-4" />,
  'Three.js': <SiThreedotjs className="w-4 h-4" />,
  'Next.js': <SiNextdotjs className="w-4 h-4" />,
  'Tailwind CSS': <SiTailwindcss className="w-4 h-4" />,
  Docker: <SiDocker className="w-4 h-4" />,
};

export default function AboutPage() {
  const exp = getExperience();
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="space-y-4">
            <h1 className="heading-1">About</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">Engineering autonomous systems & cloud deployment workflows while building a modular simulation and portfolio platform.</p>
          </header>
          <section className="space-y-8">
            <h2 className="heading-3">Experience</h2>
            <div className="space-y-6">
              {exp.map(org => (
                <div key={org.id} className="space-y-4">
                  <h3 className="text-xl font-semibold">{org.organization}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{org.summary}</p>
                  <div className="space-y-6">
                    {org.roles.map(role => (
                      <div key={role.title + role.startDate} className="relative pl-4 border-l border-primary-200 dark:border-primary-700">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{role.title}</span>
                          <span className="text-xs text-primary-500 font-mono">{role.startDate}{role.endDate ? ' → ' + role.endDate : ' → Present'}</span>
                        </div>
                        {role.achievements && (
                          <ul className="text-xs space-y-1 mb-2">
                            {role.achievements.slice(0,4).map(a => <li key={a} className="text-gray-600 dark:text-gray-400">• {a}</li>)}
                          </ul>
                        )}
                        {role.technologies && (
                          <ul className="flex flex-wrap gap-2">
                            {role.technologies.map(t => (
                              <li key={t} className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-800/40 text-xs flex items-center gap-1">
                                {iconMap[t]}
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}