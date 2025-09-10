export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  category: 'robotics' | 'ai' | 'web' | 'infrastructure' | 'research';
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'antimony-labs',
    name: 'Antimony Labs Portfolio',
    description: 'Professional portfolio showcasing robotics engineering expertise, autonomous systems, and technical project management experience.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js'],
    liveUrl: 'https://antimony-labs.com',
    githubUrl: 'https://github.com/Shivam-Bhardwaj/antimony-labs',
    featured: true,
    category: 'web'
  },
  {
    id: 'autonomous-nav',
    name: 'Autonomous Navigation System',
    description: 'Advanced autonomous navigation system for robotics applications using computer vision and machine learning algorithms.',
    technologies: ['Python', 'OpenCV', 'TensorFlow', 'ROS'],
    githubUrl: 'https://github.com/Shivam-Bhardwaj/autonomous-nav',
    featured: true,
    category: 'robotics'
  },
  {
    id: 'swarm-intelligence',
    name: 'Swarm Intelligence Framework',
    description: 'Distributed swarm intelligence algorithms for multi-robot coordination and collaborative task execution.',
    technologies: ['C++', 'Python', 'ROS', 'Gazebo'],
    githubUrl: 'https://github.com/Shivam-Bhardwaj/swarm-intelligence',
    featured: true,
    category: 'robotics'
  },
  {
    id: 'ml-pipeline',
    name: 'Machine Learning Pipeline',
    description: 'Scalable ML pipeline for robotics data processing, featuring automated model training and deployment.',
    technologies: ['Python', 'scikit-learn', 'Docker', 'Kubernetes'],
    githubUrl: 'https://github.com/Shivam-Bhardwaj/ml-pipeline',
    featured: false,
    category: 'ai'
  },
  {
    id: 'cloud-infrastructure',
    name: 'Cloud Robotics Infrastructure',
    description: 'Cloud-native infrastructure for distributed robotics systems with real-time data processing and monitoring.',
    technologies: ['Terraform', 'Docker', 'Kubernetes', 'Google Cloud'],
    githubUrl: 'https://github.com/Shivam-Bhardwaj/cloud-infrastructure',
    featured: false,
    category: 'infrastructure'
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision Toolkit',
    description: 'Comprehensive toolkit for computer vision tasks in robotics, including object detection and tracking.',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'CUDA'],
    githubUrl: 'https://github.com/Shivam-Bhardwaj/computer-vision',
    featured: false,
    category: 'ai'
  }
];

export const getFeaturedProjects = (): PortfolioProject[] => {
  return portfolioProjects.filter(project => project.featured);
};

export const getProjectsByCategory = (category: PortfolioProject['category']): PortfolioProject[] => {
  return portfolioProjects.filter(project => project.category === category);
};

export const getAllProjects = (): PortfolioProject[] => {
  return portfolioProjects;
};