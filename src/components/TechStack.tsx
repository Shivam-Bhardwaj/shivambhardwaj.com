'use client';

import { useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, SiThreedotjs, SiVitest, SiEslint } from 'react-icons/si';

const iconMap: { [key: string]: IconType } = {
  'Next.js': SiNextdotjs,
  'React': SiReact,
  'Tailwind CSS': SiTailwindcss,
  'TypeScript': SiTypescript,
  'Three.js': SiThreedotjs,
  'Vitest': SiVitest,
  'ESLint': SiEslint,
};

type TechVersions = {
  [key: string]: string;
};

const TechStack = () => {
  const [versions, setVersions] = useState<TechVersions>({});

  useEffect(() => {
    fetch('/api/tech-versions')
      .then((res) => res.json())
      .then((data) => setVersions(data));
  }, []);

  return (
    <div className="flex justify-center items-center space-x-4">
      {Object.entries(versions).map(([tech, version]) => {
        const Icon = iconMap[tech];
        return (
          <div key={tech} className="group relative">
            {Icon && <Icon className="h-8 w-8 text-gray-400 group-hover:text-gray-900" />}
            <div className="absolute bottom-full mb-2 hidden group-hover:block">
              <div className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                {tech}: {version}
              </div>
              <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800 mx-auto"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechStack;