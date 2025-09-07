import type { PortfolioData } from '@/types/portfolio';

// NOTE: This file is a manually curated snapshot. Later automation can update it.
export const portfolioData: PortfolioData = {
  generatedAt: new Date().toISOString(),
  projects: [
    {
      id: 'hello-eks',
      slug: 'hello-eks',
      name: 'Hello EKS Microservice',
      shortDescription: 'Minimal Node.js service deployed to AWS EKS (Hello World).',
      description: 'Instructional microservice illustrating the full path from local Node.js service to container image (Docker), push to Amazon ECR, and deployment onto a managed EKS cluster with a LoadBalancer service for external access. Used as a teaching artifact for infrastructure automation and AI assistant collaboration workflows.',
      status: 'active',
      startDate: '2025-01-01',
      technologies: [
        { name: 'Node.js', category: 'language' },
        { name: 'Docker', category: 'tool' },
        { name: 'Kubernetes', category: 'infrastructure' },
        { name: 'AWS EKS', category: 'service' },
      ],
      tags: ['kubernetes', 'docker', 'cloud', 'aws', 'infrastructure-as-code'],
      links: [
        { type: 'repo', url: 'https://github.com/Shivam-Bhardwaj', label: 'GitHub Profile' },
      ],
      highlights: [
        'End‑to‑end container + cluster deployment reference',
        'Clear minimal manifests for rapid onboarding',
        'Shows standard dev → registry → cluster workflow',
      ],
      metrics: [
        { label: 'Replica Count', value: '1' },
        { label: 'Image Size', value: '~120MB' },
      ],
      featured: true,
      priority: 1,
    },
    {
      id: 'swarm-simulation',
      slug: 'swarm-simulation',
      name: 'Swarm Simulation Platform',
      shortDescription: 'Browser‑based visualization of flocking and swarm coordination algorithms.',
      description: 'Interactive WebGL/Three.js powered environment to explore emergent behavior in distributed agent systems (boids, formation control, simple PSO variants). Built to support rapid parameter tuning, performance profiling, and educational demos.',
      status: 'active',
      startDate: '2024-11-15',
      technologies: [
        { name: 'TypeScript', category: 'language' },
        { name: 'Next.js', category: 'framework' },
        { name: 'Three.js', category: 'library' },
        { name: 'Tailwind CSS', category: 'library' },
      ],
      tags: ['swarm', 'visualization', 'threejs', 'ai', 'simulation'],
      links: [
        { type: 'repo', url: 'https://github.com/Shivam-Bhardwaj', label: 'GitHub Profile' },
      ],
      highlights: [
        'Real‑time rendering of >1k agents',
        'Modular strategy plug‑in system',
        'GPU‑friendly update pipeline',
      ],
      metrics: [
        { label: 'Agents Sustained', value: '1000+' },
        { label: 'Frame Budget', value: '<16ms' },
      ],
      featured: true,
      priority: 2,
    },
  ],
  experience: [
    {
      id: 'antimony-labs-rd',
      organization: 'Antimony Labs',
      roles: [
        {
          title: 'Robotics & Autonomous Systems Engineer',
          startDate: '2024-06-01',
          achievements: [
            'Created modular kinematics + swarm experimentation toolkit enabling rapid algorithm trials',
            'Stood up unified observability stack: structured logs (GCP Logging), metrics (Cloud Monitoring), error reporting',
            'Optimized simulation loop to support 1000+ concurrent agents with smooth interaction',
            'Introduced infrastructure scripts for reproducible staging / production deploys',
          ],
          technologies: ['GCP', 'Kubernetes', 'TypeScript', 'Next.js', 'Three.js', 'Node.js', 'Docker']
        },
        {
          title: 'Platform & Delivery Engineer',
          startDate: '2025-01-10',
          achievements: [
            'Refactored portfolio into data‑driven content layer (projects & experience as typed modules)',
            'Implemented theme manager with system mode, color schemes, and accessibility toggles',
            'Added automated deployment hooks & environment metadata surfacing in UI footer',
            'Standardized component styling tokens for future design system expansion',
          ],
          technologies: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Vitest', 'Playwright']
        }
      ],
      summary: 'Internal lab work spanning robotics experimentation, cloud deployment, simulation performance, and UI platform foundation.',
      tags: ['robotics', 'autonomy', 'cloud', 'platform', 'simulation'],
      priority: 1,
    }
  ],
};

export default portfolioData;
