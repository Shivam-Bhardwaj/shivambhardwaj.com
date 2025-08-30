# 🚀 Getting Started Guide

Welcome to Shivam Bhardwaj's Interactive Robotics Portfolio! This guide will help you navigate and make the most of the platform's features.

## 🎯 What Makes This Portfolio Special

This isn't just a static showcase—it's a **production-grade demonstration** of robotics systems I've deployed at companies like Applied Materials, Meta, Saildrone, and Tesla. Every algorithm and simulation represents real-world solutions with proven industrial applications.

## 🗺️ Site Navigation

### Main Sections

| Section | Description | Best For |
|---------|-------------|----------|
| **🏠 Home** | Interactive background with autonomous robots | First-time visitors |
| **🤖 Projects** | Detailed case studies from real companies | Industry professionals |
| **⚗️ Swarm Simulations** | Multi-agent coordination demos | Students & researchers |
| **🧮 Calculators** | Professional robotics tools | Engineers & students |
| **📚 Documentation** | Comprehensive guides (you're here!) | Developers & learners |

### Interactive Features

#### 1. **Dynamic Background Animation**
- Watch autonomous robots navigate in real-time
- Observe obstacle avoidance and path planning
- Notice emergent swarm behaviors

#### 2. **Live Simulations**
- **Swarm Robotics** (`/swarm`): Advanced flocking behaviors and formation control
- **Smart Avoidance** (`/robot-test`): Sensor fusion and dynamic obstacle detection  
- **Multi-Agent Systems** (`/swarm-test`): Coordination and consensus algorithms

#### 3. **Professional Calculators**
Access industry-grade tools for:
- **Kinematics**: Forward/inverse kinematics solver
- **PID Tuning**: Real-time controller optimization
- **Trajectory Planning**: Path generation with constraints
- **Sensor Fusion**: Multi-sensor integration visualization
- **Transforms**: 3D coordinate frame calculations

## 🎮 Using Interactive Simulations

### Swarm Robotics Demo
1. **Navigate** to `/swarm` from the main menu
2. **Observe** the flocking behaviors: separation, alignment, cohesion
3. **Interact** with the simulation by clicking to add waypoints
4. **Adjust** parameters using the control panel

### Smart Avoidance Robots  
1. **Visit** `/robot-test` for sensor fusion demonstrations
2. **Watch** robots detect and avoid dynamic obstacles
3. **Notice** the sensor visualization (LiDAR, ultrasonic, cameras)
4. **Experiment** with different obstacle configurations

### GTA-Style Autonomous Driving
1. **Experience** game-inspired autonomous behaviors
2. **Observe** traffic navigation and pursuit algorithms
3. **See** physics-based movement and collision avoidance

## 🧮 Professional Calculator Tools

### Kinematics Calculator
```typescript
// Example: Forward kinematics for 6-DOF arm
const jointAngles = [0, 45, 90, 0, -45, 0]; // degrees
const endEffectorPose = forwardKinematics(jointAngles);
console.log(endEffectorPose); // {x, y, z, roll, pitch, yaw}
```

### PID Controller Tuner
- **Adjust** Kp, Ki, Kd parameters in real-time
- **Visualize** system response and stability
- **Export** optimized parameters for production use

### Trajectory Planner
- **Define** start and goal positions
- **Set** velocity and acceleration constraints  
- **Generate** smooth, executable trajectories
- **Visualize** path in 2D/3D space

## 📱 Mobile Experience

The portfolio is fully responsive and optimized for mobile devices:

- **Touch Controls**: Tap and drag interactions on simulations
- **Responsive Design**: Adapts to all screen sizes  
- **Performance**: Optimized for smooth animations on mobile
- **Accessibility**: Screen reader compatible

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + T` | Toggle theme (dark/light) |
| `Ctrl + K` | Open search dialog |
| `Alt + H` | Navigate to home |
| `Alt + D` | Open documentation |
| `ESC` | Close modals/dialogs |
| `Space` | Pause/resume simulations |

## 🎓 Learning Path Recommendations

### For **Students & Beginners**
1. Start with the [Interactive Home](/) to see robots in action
2. Try the [Swarm Demo](/swarm) to understand multi-agent systems
3. Use the [Kinematics Calculator](/calculators) for hands-on learning
4. Read the [Algorithm Explanations](robotics/algorithms.md)

### For **Engineers & Professionals**  
1. Review [Project Case Studies](/projects) for production insights
2. Explore [Advanced Simulations](/robot-test) for sensor fusion
3. Study the [Architecture Guide](architecture/components.md)
4. Examine [Performance Metrics](deployment/performance.md)

### For **Researchers & Academics**
1. Read [Published Papers](reference/publications.md) for theoretical background
2. Analyze [Algorithm Implementations](robotics/algorithms.md) for research insights
3. Review [Testing Methodologies](testing/strategy.md) for validation approaches
4. Connect for potential [Collaboration Opportunities](/#contact)

## 🔧 Technical Requirements

### For Optimal Experience
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Enabled for interactive features
- **WebGL**: Required for 3D simulations and graphics
- **Screen Resolution**: 1024x768 minimum (1920x1080 recommended)

### Performance Tips
- **Close** other resource-intensive tabs
- **Use** hardware acceleration if available
- **Update** to the latest browser version
- **Enable** GPU acceleration for best performance

## 📞 Getting Help

### Documentation Sections
- **🏗️ Architecture**: Understanding the system design
- **🔧 Development**: Setting up for contribution
- **🧪 Testing**: Quality assurance approaches  
- **🚀 Deployment**: Production deployment guides

### Community Support
- **💬 GitHub Issues**: Report bugs or request features
- **📧 Direct Contact**: Professional inquiries and collaboration
- **💼 LinkedIn**: Connect for professional networking
- **🎓 Educational**: Speaking and mentoring opportunities

## 🚀 Next Steps

Ready to dive deeper? Choose your path:

<div class="grid cards" markdown>

-   :material-robot-excited: **Explore Simulations**
    
    Experience advanced robotics through interactive demos
    
    [:octicons-arrow-right-24: View Simulations](robotics/algorithms.md)

-   :material-calculator-variant: **Use Professional Tools**
    
    Access industry-grade calculators and utilities
    
    [:octicons-arrow-right-24: Open Calculators](robotics/calculators.md)

-   :material-account-tie: **View Project Portfolio**
    
    See real-world case studies and achievements
    
    [:octicons-arrow-right-24: Browse Projects](/projects)

-   :material-code-braces: **Contribute to Development**
    
    Join the development and improvement process
    
    [:octicons-arrow-right-24: Development Guide](development/setup.md)

</div>

---

!!! tip "Pro Tip"
    For the best experience, start with the interactive home page to get familiar with the navigation and visual style, then explore the simulations to see the algorithms in action!