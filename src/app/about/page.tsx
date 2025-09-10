import { getExperience, getAbout } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';
import { SiGooglecloud, SiKubernetes, SiNodedotjs, SiTypescript, SiThreedotjs, SiNextdotjs, SiTailwindcss, SiDocker, SiCplusplus, SiPython, SiOpencv, SiTensorflow } from 'react-icons/si';
import ExperienceTimeline from '@/components/ExperienceTimeline';

const iconMap: Record<string, JSX.Element> = {
  GCP: <SiGooglecloud className="w-4 h-4" />,
  Kubernetes: <SiKubernetes className="w-4 h-4" />,
  'Node.js': <SiNodedotjs className="w-4 h-4" />,
  TypeScript: <SiTypescript className="w-4 h-4" />,
  'Three.js': <SiThreedotjs className="w-4 h-4" />,
  'Next.js': <SiNextdotjs className="w-4 h-4" />,
  'Tailwind CSS': <SiTailwindcss className="w-4 h-4" />,
  Docker: <SiDocker className="w-4 h-4" />,
  'C++': <SiCplusplus className="w-4 h-4" />,
  Python: <SiPython className="w-4 h-4" />,
  OpenCV: <SiOpencv className="w-4 h-4" />,
  TensorFlow: <SiTensorflow className="w-4 h-4" />,
};

export default function AboutPage() {
  const exp = getExperience();
  const about = getAbout();
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="space-y-4">
            <h1 className="heading-1">About</h1>
            {about && (
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{about.summary}</p>
            )}
          </header>

          {about && about.education && (
            <section className="space-y-6">
              <h2 className="heading-3">Education</h2>
              {about.education.map((edu, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{edu.institution}</h3>
                    <span className="text-sm text-primary-500 font-mono">{edu.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{edu.degree}</p>
                  <div className="flex flex-wrap gap-2">
                    {edu.focus.map((focus, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {about && about.skills && (
            <section className="space-y-6">
              <h2 className="heading-3">Technical Skills</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(about.skills).map(([category, skills]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-sm font-semibold capitalize text-gray-800 dark:text-gray-200">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-800/40 text-xs flex items-center gap-1">
                          {iconMap[skill]}
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {about && about.achievements && (
            <section className="space-y-6">
              <h2 className="heading-3">Achievements</h2>
              <ul className="space-y-2">
                {about.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ExperienceTimeline experiences={exp} />

          {about && about.languages && (
            <section className="space-y-6">
              <h2 className="heading-3">Languages</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {about.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}