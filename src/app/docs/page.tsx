'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Code, 
  Cpu, 
  Calculator, 
  Rocket, 
  FileText,
  ChevronRight,
  Search,
  Github,
  ExternalLink,
  Terminal,
  Zap,
  Bot,
  Brain
} from 'lucide-react'
const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    description: 'Quick start guide for exploring the portfolio',
    items: [
      { title: 'Introduction', href: '#introduction' },
      { title: 'Navigation', href: '#navigation' },
      { title: 'Interactive Features', href: '#features' },
      { title: 'Keyboard Shortcuts', href: '#shortcuts' }
    ]
  },
  {
    id: 'simulations',
    title: 'Interactive Simulations',
    icon: Bot,
    description: 'Learn how to use the robotics simulations',
    items: [
      { title: 'Swarm Robotics', href: '#swarm' },
      { title: 'Smart Avoidance', href: '#avoidance' },
      { title: 'GTA-Style Robots', href: '#gta' },
      { title: 'Swarm Defender Game', href: '#defender' }
    ]
  },
  {
    id: 'algorithms',
    title: 'Robotics Algorithms',
    icon: Brain,
    description: 'Detailed explanations of implemented algorithms',
    items: [
      { title: 'SLAM (Localization & Mapping)', href: '#slam' },
      { title: 'Path Planning (A*, D*, RRT)', href: '#pathplanning' },
      { title: 'Sensor Fusion (Kalman Filters)', href: '#sensorfusion' },
      { title: 'Control Systems (PID, MPC)', href: '#control' },
      { title: 'Swarm Intelligence', href: '#swarm-intelligence' }
    ]
  },
  {
    id: 'calculators',
    title: 'Tools & Calculators',
    icon: Calculator,
    description: 'How to use the interactive robotics tools',
    items: [
      { title: 'Kinematics Calculator', href: '#kinematics' },
      { title: 'PID Tuner', href: '#pid' },
      { title: 'Trajectory Planner', href: '#trajectory' },
      { title: 'Transform Calculator', href: '#transform' }
    ]
  },
  {
    id: 'development',
    title: 'Development Guide',
    icon: Code,
    description: 'For developers and contributors',
    items: [
      { title: 'Project Setup', href: '#setup' },
      { title: 'Architecture Overview', href: '#architecture' },
      { title: 'API Reference', href: '#api' },
      { title: 'Testing Guide', href: '#testing' },
      { title: 'Contributing', href: '#contributing' }
    ]
  },
  {
    id: 'scripts',
    title: 'Scripts & Commands',
    icon: Terminal,
    description: 'Available scripts and CLI commands',
    items: [
      { title: 'Development Commands', href: '#dev-commands' },
      { title: 'Testing Commands', href: '#test-commands' },
      { title: 'Deployment Scripts', href: '#deploy-scripts' },
      { title: 'Utility Scripts', href: '#utility-scripts' }
    ]
  }
]
const algorithmDetails = {
  slam: {
    title: 'SLAM - Simultaneous Localization and Mapping',
    description: 'SLAM allows robots to build a map of their environment while simultaneously tracking their location within it.',
    features: [
      'Real-time map construction',
      'Particle filter for localization',
      'Loop closure detection',
      'Occupancy grid mapping'
    ],
    code: `// SLAM Implementation Example
class SLAM {
  constructor() {
    this.map = new OccupancyGrid();
    this.particles = new ParticleFilter();
    this.pose = { x: 0, y: 0, theta: 0 };
  }
  update(sensorData, odometry) {
    // Update particle filter
    this.particles.predict(odometry);
    this.particles.update(sensorData, this.map);
    // Update map
    this.map.update(sensorData, this.pose);
    // Estimate pose
    this.pose = this.particles.getBestEstimate();
  }
}`
  },
  pathplanning: {
    title: 'Path Planning Algorithms',
    description: 'Various algorithms for finding optimal paths through environments with obstacles.',
    features: [
      'A* - Optimal pathfinding with heuristics',
      'D* Lite - Dynamic replanning',
      'RRT - Rapidly-exploring Random Trees',
      'PRM - Probabilistic Roadmaps'
    ],
    code: `// A* Pathfinding Example
function AStar(start, goal, grid) {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map([[start, 0]]);
  const fScore = new Map([[start, heuristic(start, goal)]]);
  while (openSet.length > 0) {
    const current = getLowestFScore(openSet, fScore);
    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }
    openSet.splice(openSet.indexOf(current), 1);
    for (const neighbor of getNeighbors(current, grid)) {
      const tentativeGScore = gScore.get(current) + 1;
      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return null; // No path found
}`
  },
  sensorfusion: {
    title: 'Sensor Fusion with Kalman Filters',
    description: 'Combining data from multiple sensors to get more accurate state estimates.',
    features: [
      'Extended Kalman Filter (EKF)',
      'Unscented Kalman Filter (UKF)',
      'Particle Filter',
      'Complementary Filter'
    ],
    code: `// Kalman Filter Example
class KalmanFilter {
  constructor() {
    this.x = Matrix.zeros(4, 1); // State [x, y, vx, vy]
    this.P = Matrix.eye(4); // Covariance
    this.F = Matrix.eye(4); // State transition
    this.H = Matrix.eye(2, 4); // Measurement matrix
    this.R = Matrix.eye(2).multiply(0.1); // Measurement noise
    this.Q = Matrix.eye(4).multiply(0.01); // Process noise
  }
  predict(dt) {
    // Update state transition matrix
    this.F[0][2] = dt;
    this.F[1][3] = dt;
    // Predict state
    this.x = this.F.multiply(this.x);
    this.P = this.F.multiply(this.P).multiply(this.F.transpose()).add(this.Q);
  }
  update(measurement) {
    const y = measurement.subtract(this.H.multiply(this.x));
    const S = this.H.multiply(this.P).multiply(this.H.transpose()).add(this.R);
    const K = this.P.multiply(this.H.transpose()).multiply(S.inverse());
    this.x = this.x.add(K.multiply(y));
    this.P = Matrix.eye(4).subtract(K.multiply(this.H)).multiply(this.P);
  }
}`
  },
  control: {
    title: 'Control Systems',
    description: 'Controllers for precise robot motion and behavior.',
    features: [
      'PID Controller - Proportional-Integral-Derivative',
      'MPC - Model Predictive Control',
      'LQR - Linear Quadratic Regulator',
      'Adaptive Control'
    ],
    code: `// PID Controller Example
class PIDController {
  constructor(kp, ki, kd) {
    this.kp = kp; // Proportional gain
    this.ki = ki; // Integral gain
    this.kd = kd; // Derivative gain
    this.integral = 0;
    this.previousError = 0;
  }
  update(setpoint, measurement, dt) {
    const error = setpoint - measurement;
    // Proportional term
    const P = this.kp * error;
    // Integral term
    this.integral += error * dt;
    const I = this.ki * this.integral;
    // Derivative term
    const derivative = (error - this.previousError) / dt;
    const D = this.kd * derivative;
    this.previousError = error;
    return P + I + D;
  }
  reset() {
    this.integral = 0;
    this.previousError = 0;
  }
}`
  },
  'swarm-intelligence': {
    title: 'Swarm Intelligence & Multi-Agent Systems',
    description: 'Advanced algorithms for coordinating multiple robots with emergent collective behaviors.',
    features: [
      'Flocking Behaviors - Separation, alignment, and cohesion',
      'Consensus Algorithms - Distributed agreement protocols',
      'Formation Control - Maintaining robot formations',
      'Pheromone-based Communication - Ant colony optimization',
      'Swarm Defense Strategies - Cooperative protection behaviors'
    ],
    code: `// Swarm Flocking Implementation
class FlockingBehavior {
  constructor(separationRadius = 30, alignmentRadius = 60, cohesionRadius = 80) {
    this.separationRadius = separationRadius;
    this.alignmentRadius = alignmentRadius;
    this.cohesionRadius = cohesionRadius;
    this.separationWeight = 2.0;
    this.alignmentWeight = 1.0;
    this.cohesionWeight = 1.0;
  }
  computeFlockingForce(agent, neighbors) {
    const separation = this.computeSeparation(agent, neighbors);
    const alignment = this.computeAlignment(agent, neighbors);
    const cohesion = this.computeCohesion(agent, neighbors);
    return separation.multiply(this.separationWeight)
      .add(alignment.multiply(this.alignmentWeight))
      .add(cohesion.multiply(this.cohesionWeight));
  }
  computeSeparation(agent, neighbors) {
    let force = Vector2.zero();
    let count = 0;
    for (const neighbor of neighbors) {
      const distance = agent.position.distanceTo(neighbor.position);
      if (distance < this.separationRadius && distance > 0) {
        const direction = agent.position.subtract(neighbor.position).normalize();
        force = force.add(direction.multiply(1 / distance));
        count++;
      }
    }
    return count > 0 ? force.multiply(1 / count) : Vector2.zero();
  }
}`
  }
}
export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState('getting-started')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<keyof typeof algorithmDetails | null>(null)
  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-600 bg-clip-text text-transparent">
                Documentation
              </h1>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-2">
              {documentationSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    selectedSection === section.id
                      ? 'bg-gradient-to-r from-cyan-600/20 to-fuchsia-600/20 border border-cyan-400/50 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-left flex-1">{section.title}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    selectedSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>
              ))}
            </div>
          </div>
          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section Header */}
            {filteredSections
              .filter(section => section.id === selectedSection)
              .map(section => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-600 to-fuchsia-600 rounded-xl">
                      <section.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                      <p className="text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  {/* Section Items */}
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {section.items.map(item => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white group-hover:text-cyan-400 transition-colors">
                            {item.title}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            {/* Quick Start Guide */}
            {selectedSection === 'getting-started' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6"> Welcome to My Interactive Robotics Portfolio</h3>
                  <div className="mb-6">
                    <p className="text-gray-300 text-lg leading-relaxed">
                      This isn&apos;t just a static portfolio—it&apos;s a fully interactive demonstration of production-grade robotics systems. 
                      Every simulation, algorithm, and tool represents real-world solutions I&apos;ve deployed in industrial environments at 
                      companies like Applied Materials, Meta, Saildrone, and Tesla.
                    </p>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-4"> Quick Start Guide</h4>
                  <ol className="space-y-4 text-gray-300">
                    <li className="flex gap-3">
                      <span className="text-cyan-400 font-bold">1.</span>
                      <div>
                        <strong className="text-white">Explore the Interactive Home:</strong> 
                        <p className="mt-1 text-sm">Start with the dynamic background featuring autonomous robots. Watch them navigate, avoid obstacles, and demonstrate swarm behaviors in real-time.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-cyan-400 font-bold">2.</span>
                      <div>
                        <strong className="text-white">Experience Live Simulations:</strong>
                        <p className="mt-1 text-sm">
                          • <strong>/swarm</strong> - Advanced swarm robotics with flocking behaviors<br />
                          • <strong>/robot-test</strong> - Smart avoidance robots with sensor fusion<br />
                          • <strong>/swarm-test</strong> - Multi-agent coordination demos
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-cyan-400 font-bold">3.</span>
                      <div>
                        <strong className="text-white">Use Professional Calculators:</strong>
                        <p className="mt-1 text-sm">Access industry-grade tools: Kinematics solver, PID tuner, trajectory planner, sensor fusion visualizer, and 3D transform calculator.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-cyan-400 font-bold">4.</span>
                      <div>
                        <strong className="text-white">Discover Real Projects:</strong>
                        <p className="mt-1 text-sm">Browse detailed case studies from my work at Fortune 500 companies, with technical deep-dives and production metrics.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-cyan-400 font-bold">5.</span>
                      <div>
                        <strong className="text-white">Learn from Algorithms:</strong>
                        <p className="mt-1 text-sm">Explore interactive explanations of SLAM, path planning, sensor fusion, and control systems with working code examples.</p>
                      </div>
                    </li>
                  </ol>
                </div>
                <div className="bg-gradient-to-r from-cyan-600/10 to-fuchsia-600/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-400/30">
                  <h3 className="text-xl font-bold text-white mb-4">️ About the Architecture</h3>
                  <p className="text-gray-300 mb-4">
                    This portfolio is built with enterprise-grade practices I use in production robotics systems:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-gray-300">Next.js 15 with App Router</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-gray-300">TypeScript strict mode</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-gray-300">70%+ test coverage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-gray-300">Real-time WebGL graphics</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-fuchsia-400 rounded-full"></span>
                        <span className="text-gray-300">Custom robotics algorithms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-fuchsia-400 rounded-full"></span>
                        <span className="text-gray-300">Accessible design (WCAG 2.1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-fuchsia-400 rounded-full"></span>
                        <span className="text-gray-300">Performance optimized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-fuchsia-400 rounded-full"></span>
                        <span className="text-gray-300">AI-powered development</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-600/10 to-fuchsia-600/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Keyboard Shortcuts
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Toggle Theme</span>
                        <code className="px-2 py-1 bg-black/30 rounded text-cyan-400 text-sm">Ctrl + T</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Search</span>
                        <code className="px-2 py-1 bg-black/30 rounded text-cyan-400 text-sm">Ctrl + K</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Home</span>
                        <code className="px-2 py-1 bg-black/30 rounded text-cyan-400 text-sm">Alt + H</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Documentation</span>
                        <code className="px-2 py-1 bg-black/30 rounded text-cyan-400 text-sm">Alt + D</code>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Algorithms Section */}
            {selectedSection === 'algorithms' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(algorithmDetails).map(([key, algo]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedAlgorithm(key as keyof typeof algorithmDetails)}
                      className="p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-cyan-400/50 transition-all text-left"
                    >
                      <h4 className="text-lg font-bold text-white mb-2">{algo.title}</h4>
                      <p className="text-gray-400 text-sm">{algo.description}</p>
                    </button>
                  ))}
                </div>
                {selectedAlgorithm && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {algorithmDetails[selectedAlgorithm].title}
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {algorithmDetails[selectedAlgorithm].description}
                    </p>
                    <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                    <ul className="space-y-2 mb-6">
                      {algorithmDetails[selectedAlgorithm].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-cyan-400 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <h4 className="text-lg font-semibold text-white mb-3">Implementation Example</h4>
                    <div className="relative">
                      <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-gray-300">
                          {algorithmDetails[selectedAlgorithm].code}
                        </code>
                      </pre>
                      <button
                        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        onClick={() => navigator.clipboard?.writeText(algorithmDetails[selectedAlgorithm].code)}
                      >
                        <FileText className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {/* Development Guide */}
            {selectedSection === 'development' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Setup Instructions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Prerequisites</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Node.js 18+ and npm 9+</li>
                        <li>• Git for version control</li>
                        <li>• VS Code or preferred IDE</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Installation</h4>
                      <div className="bg-black/50 rounded-lg p-4">
                        <code className="text-sm text-cyan-400">
                          git clone https://github.com/shivam-bhardwaj/robotics-portfolio.git<br />
                          cd robotics-portfolio<br />
                          npm install<br />
                          npm run dev
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-600/10 to-fuchsia-600/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Github className="w-6 h-6" />
                    Contributing Guidelines
                  </h3>
                  <ol className="space-y-3 text-gray-300">
                    <li>1. Fork the repository</li>
                    <li>2. Create a feature branch: <code className="text-cyan-400">git checkout -b feature/amazing-feature</code></li>
                    <li>3. Commit changes: <code className="text-cyan-400">git commit -m &apos;feat: add amazing feature&apos;</code></li>
                    <li>4. Push to branch: <code className="text-cyan-400">git push origin feature/amazing-feature</code></li>
                    <li>5. Open a Pull Request</li>
                  </ol>
                </div>
              </motion.div>
            )}
            {/* Scripts Section */}
            {selectedSection === 'scripts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Available Commands</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Development</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run dev</code>
                          <span className="text-xs text-gray-400">Start development server</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run build</code>
                          <span className="text-xs text-gray-400">Build for production</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run start</code>
                          <span className="text-xs text-gray-400">Start production server</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Testing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run test</code>
                          <span className="text-xs text-gray-400">Run all tests</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run test:coverage</code>
                          <span className="text-xs text-gray-400">Generate coverage report</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run test:e2e</code>
                          <span className="text-xs text-gray-400">Run E2E tests</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Quality & Security</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run lint</code>
                          <span className="text-xs text-gray-400">Run ESLint</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run type-check</code>
                          <span className="text-xs text-gray-400">TypeScript checking</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run security:audit</code>
                          <span className="text-xs text-gray-400">Security audit</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run validate:pre-push</code>
                          <span className="text-xs text-gray-400">Complete pre-push validation</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">AI-Powered Development</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run claude</code>
                          <span className="text-xs text-gray-400">Interactive AI assistant</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run agent</code>
                          <span className="text-xs text-gray-400">Automated code quality agent</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run agent:quality</code>
                          <span className="text-xs text-gray-400">Code quality analysis</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run fix:validation</code>
                          <span className="text-xs text-gray-400">Auto-fix validation issues</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Deployment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run deploy</code>
                          <span className="text-xs text-gray-400">Deploy to Firebase</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run deploy:patch</code>
                          <span className="text-xs text-gray-400">Deploy with version bump</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                          <code className="text-sm text-gray-300">npm run push:safe</code>
                          <span className="text-xs text-gray-400">Validate then push to git</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Footer Links */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
              <Link
                href="https://github.com/shivam-bhardwaj/robotics-portfolio"
                target="_blank"
                className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all"
              >
                <Github className="w-5 h-5 text-cyan-400" />
                <span className="text-white">View on GitHub</span>
              </Link>
              <Link
                href="/projects"
                className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all"
              >
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-white">View Projects</span>
              </Link>
              <Link
                href="/swarm"
                className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all"
              >
                <Bot className="w-5 h-5 text-cyan-400" />
                <span className="text-white">Try Simulations</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
