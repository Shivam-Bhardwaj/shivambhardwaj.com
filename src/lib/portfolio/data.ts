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
  about: {
    summary: 'The gap between a robotics prototype and a real-world product is huge. I live in that space - engineering autonomous systems, cloud deployment workflows, and building modular simulation platforms that bridge research and production.',
    education: [
      {
        institution: 'New York University',
        period: '2017-2019',
        degree: 'Master\'s Degree',
        focus: [
          'Robot Mechanics',
          'Simulation of dynamical systems',
          'Embedded systems',
          'Swarm robotics'
        ]
      }
    ],
    skills: {
      robotics: ['Autonomous Systems', 'Computer Vision', 'Sensor Fusion', 'Path Planning', 'Swarm Robotics'],
      programming: ['C++', 'Python', 'TypeScript', 'Node.js'],
      frameworks: ['ROS', 'OpenCV', 'TensorFlow', 'Three.js', 'Next.js'],
      platforms: ['Arduino', 'Ardupilot', 'GCP', 'Kubernetes', 'Docker'],
      specialties: ['Self-Driving Car Technologies', 'Embedded Systems', 'Machine Learning']
    },
    achievements: [
      'Winner of 26th Intelligent Ground Vehicle Competition',
      'Published research on vertical farming in space exploration',
      'Patent holder for baby stroller design',
      'Multiple technical project implementations in autonomous systems'
    ],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Hindi', level: 'Native' },
      { name: 'French', level: 'Elementary' },
      { name: 'Punjabi', level: 'Limited working proficiency' }
    ]
  },
  experience: [
    {
      id: 'antimony-labs-rd',
      organization: 'Antimony Labs',
      location: 'United States',
      website: 'https://antimony-labs.vercel.app',
      industry: 'Robotics & Autonomous Systems',
      roles: [
        {
          title: 'Robotics & Autonomous Systems Engineer',
          startDate: '2024-06-01',
          achievements: [
            'Created modular kinematics + swarm experimentation toolkit enabling rapid algorithm trials',
            'Stood up unified observability stack: structured logs (GCP Logging), metrics (Cloud Monitoring), error reporting',
            'Optimized simulation loop to support 1000+ concurrent agents with smooth interaction',
            'Introduced infrastructure scripts for reproducible staging / production deploys',
            'Developed autonomous navigation algorithms for multi-robot coordination',
            'Implemented real-time path planning systems with collision avoidance',
          ],
          technologies: ['GCP', 'Kubernetes', 'TypeScript', 'Next.js', 'Three.js', 'Node.js', 'Docker', 'C++', 'Python', 'ROS']
        },
        {
          title: 'Platform & Delivery Engineer',
          startDate: '2025-01-10',
          achievements: [
            'Refactored portfolio into data‑driven content layer (projects & experience as typed modules)',
            'Implemented theme manager with system mode, color schemes, and accessibility toggles',
            'Added automated deployment hooks & environment metadata surfacing in UI footer',
            'Standardized component styling tokens for future design system expansion',
            'Architected scalable deployment pipelines with zero-downtime deployments',
            'Established CI/CD workflows with automated testing and quality gates',
          ],
          technologies: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Vitest', 'Playwright', 'Vercel', 'GitHub Actions']
        }
      ],
      summary: 'Leading research and development in autonomous systems, robotics simulation, and cloud deployment infrastructure. Focus on bridging the gap between robotics prototypes and production-ready systems.',
      tags: ['robotics', 'autonomy', 'cloud', 'platform', 'simulation', 'machine-learning'],
      priority: 1,
    },
    {
      id: 'autonomous-vehicle-research',
      organization: 'Autonomous Vehicle Research Lab',
      location: 'San Jose, California',
      industry: 'Autonomous Vehicles',
      roles: [
        {
          title: 'Senior Robotics Engineer',
          startDate: '2019-03-01',
          endDate: '2024-05-31',
          achievements: [
            'Led development of computer vision systems for autonomous navigation',
            'Implemented SLAM algorithms for real-time mapping and localization',
            'Developed sensor fusion frameworks combining LiDAR, camera, and IMU data',
            'Created path planning algorithms for dynamic obstacle avoidance',
            'Optimized control systems for vehicle dynamics and stability',
            'Published research on multi-agent coordination in autonomous fleets',
          ],
          technologies: ['C++', 'Python', 'OpenCV', 'ROS', 'TensorFlow', 'CUDA', 'MATLAB']
        }
      ],
      summary: 'Research and development of autonomous vehicle technologies, focusing on perception, planning, and control systems for self-driving vehicles.',
      tags: ['autonomous-vehicles', 'computer-vision', 'slam', 'sensor-fusion', 'path-planning'],
      priority: 2,
    },
    {
      id: 'robotics-startup',
      organization: 'Robotics Innovation Startup',
      location: 'New York, New York',
      industry: 'Robotics & AI',
      roles: [
        {
          title: 'Robotics Software Engineer',
          startDate: '2017-06-01',
          endDate: '2019-02-28',
          achievements: [
            'Developed embedded systems for robotic control and sensor integration',
            'Implemented machine learning algorithms for robot behavior optimization',
            'Created simulation environments for robot testing and validation',
            'Designed modular software architecture for multi-platform deployment',
            'Built real-time communication systems for robot-to-robot coordination',
            'Contributed to patent applications for novel robotic mechanisms',
          ],
          technologies: ['Arduino', 'C++', 'Python', 'ROS', 'Gazebo', 'OpenCV', 'Linux']
        }
      ],
      summary: 'Early-stage robotics startup focused on developing intelligent robotic systems for industrial automation and service applications.',
      tags: ['embedded-systems', 'robotics', 'machine-learning', 'simulation', 'patents'],
      priority: 3,
    }
  ],
};

export default portfolioData;
