# UI Components Examples

## Button Components

### Basic Usage

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" size="medium">
  Save Changes
</Button>

// Secondary button with icon
<Button variant="secondary" leftIcon={<SaveIcon />}>
  Save Draft
</Button>

// Loading button
<Button loading disabled>
  Processing...
</Button>

// Outline button with custom click handler
<Button 
  variant="outline" 
  onClick={() => handleAction()}
  aria-label="Perform custom action"
>
  Custom Action
</Button>
```

### Button Variants Demo

```tsx
const ButtonVariantsDemo: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      
      <div className="flex gap-4">
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </div>
      
      <div className="flex gap-4">
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button leftIcon={<PlusIcon />}>With Icon</Button>
      </div>
    </div>
  );
};
```

## Card Components

### Basic Card

```tsx
import { Card, Button } from '@/components/ui';

<Card 
  title="Project Showcase"
  subtitle="Interactive robotics demonstration"
  image="/images/robot-project.jpg"
  hoverable
  actions={
    <div className="flex gap-2">
      <Button size="small" variant="outline">View Details</Button>
      <Button size="small">Launch Demo</Button>
    </div>
  }
>
  <p>
    This project demonstrates advanced robotics control systems
    with real-time physics simulation and interactive 3D visualization.
  </p>
</Card>
```

### Card Grid Layout

```tsx
const ProjectGrid: React.FC = () => {
  const projects = [
    {
      id: '1',
      title: 'Robot Arm Control',
      description: '6-DOF manipulator with inverse kinematics',
      image: '/images/robot-arm.jpg',
      tags: ['robotics', 'control-systems', '3d'],
      demo: '/projects/robot-arm'
    },
    {
      id: '2', 
      title: 'Autonomous Navigation',
      description: 'SLAM-based mobile robot navigation',
      image: '/images/mobile-robot.jpg',
      tags: ['navigation', 'slam', 'autonomous'],
      demo: '/projects/navigation'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <Card
          key={project.id}
          title={project.title}
          subtitle={project.description}
          image={project.image}
          hoverable
          onClick={() => navigate(project.demo)}
          actions={
            <div className="flex flex-wrap gap-1">
              {project.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          }
        >
          <Button variant="primary" className="w-full mt-4">
            View Project
          </Button>
        </Card>
      ))}
    </div>
  );
};
```

## Modal Components

### Basic Modal

```tsx
import { Modal, Button } from '@/components/ui';

const SettingsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Settings
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Application Settings"
        size="medium"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Theme Preference
            </label>
            <select className="w-full p-2 border rounded">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
```

### Confirmation Modal

```tsx
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
    >
      <div className="text-center space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Usage
const DeleteProjectButton: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleDelete = async () => {
    await deleteProject(projectId);
    setShowConfirm(false);
    // Handle post-deletion logic
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowConfirm(true)}
      >
        Delete Project
      </Button>
      
      <ConfirmationModal
        isOpen={showConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
```

## Navigation Components

### Primary Navigation

```tsx
import { Navigation } from '@/components/ui';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navigation
        brand={{ name: 'Antimony Labs', logo: '/logo.svg' }}
        items={[
          { label: 'Home', href: '/', active: true },
          { label: 'Projects', href: '/projects' },
          { label: 'About', href: '/about' },
          { label: 'Infrastructure', href: '/infrastructure' },
          { label: 'Blog', href: '/blog' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="small" variant="outline">
              Contact
            </Button>
          </div>
        }
      />
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
```

### Breadcrumb Navigation

```tsx
import { Breadcrumb } from '@/components/ui';

const ProjectDetailPage: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project.name, href: `/projects/${project.id}`, active: true }
        ]}
      />
      
      <div className="mt-4">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600 mt-2">{project.description}</p>
        
        {/* Project content */}
      </div>
    </div>
  );
};
```

## Form Components

### Contact Form Example

```tsx
import { Input, TextArea, Button, FormGroup } from '@/components/ui';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      await submitContactForm(formData);
      // Show success message
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup
        label="Name"
        error={errors.name}
        required
      >
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your name"
          error={!!errors.name}
        />
      </FormGroup>
      
      <FormGroup
        label="Email"
        error={errors.email}
        required
      >
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your.email@example.com"
          error={!!errors.email}
        />
      </FormGroup>
      
      <FormGroup label="Subject">
        <Input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Subject (optional)"
        />
      </FormGroup>
      
      <FormGroup
        label="Message"
        error={errors.message}
        required
      >
        <TextArea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Your message..."
          rows={6}
          error={!!errors.message}
        />
      </FormGroup>
      
      <Button
        type="submit"
        loading={submitting}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};
```

## Data Display Components

### Metrics Dashboard

```tsx
import { MetricsCard, Chart } from '@/components/ui';

const MetricsDashboard: React.FC = () => {
  const metrics = useSystemMetrics();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Response Time"
          value={`${metrics.responseTime}ms`}
          trend={metrics.responseTimeTrend}
          icon={<ClockIcon />}
          color="blue"
        />
        
        <MetricsCard
          title="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          trend={metrics.errorRateTrend}
          icon={<AlertIcon />}
          color={metrics.errorRate > 0.05 ? 'red' : 'green'}
        />
        
        <MetricsCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          trend={metrics.activeUsersTrend}
          icon={<UsersIcon />}
          color="green"
        />
        
        <MetricsCard
          title="CPU Usage"
          value={`${(metrics.cpuUsage * 100).toFixed(1)}%`}
          trend={metrics.cpuUsageTrend}
          icon={<CpuIcon />}
          color={metrics.cpuUsage > 0.8 ? 'red' : 'blue'}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="line"
          title="Response Time Trend"
          data={metrics.responseTimeHistory}
          xAxis="timestamp"
          yAxis="responseTime"
          color="blue"
        />
        
        <Chart
          type="area"
          title="Traffic Volume"
          data={metrics.trafficHistory}
          xAxis="timestamp"
          yAxis="requests"
          color="green"
        />
      </div>
    </div>
  );
};
```

## Loading States and Skeletons

### Skeleton Components

```tsx
import { Skeleton, Card, Button } from '@/components/ui';

const ProjectSkeleton: React.FC = () => {
  return (
    <Card>
      <div className="space-y-4">
        <Skeleton height={200} className="rounded" />
        <div className="space-y-2">
          <Skeleton height={24} width="60%" />
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="40%" />
        </div>
        <div className="flex gap-2">
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={100} />
        </div>
      </div>
    </Card>
  );
};

const ProjectGrid: React.FC = () => {
  const { data: projects, loading } = useProjects();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

### Progressive Loading

```tsx
const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      {loading && (
        <Skeleton 
          height="100%" 
          width="100%" 
          className="absolute inset-0" 
        />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
```

This comprehensive set of UI component examples demonstrates real-world usage patterns, best practices, and integration strategies for the Antimony Labs component library.