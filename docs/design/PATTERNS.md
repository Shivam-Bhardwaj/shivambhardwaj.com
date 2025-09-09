# UI Design Patterns

## Layout Patterns

### Container Pattern

The Container pattern provides consistent content width and centering across different screen sizes, ensuring optimal reading experiences and visual balance.

```tsx
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  padding = true,
  className = '',
  children
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',    // 672px
    md: 'max-w-4xl',    // 896px  
    lg: 'max-w-6xl',    // 1152px
    xl: 'max-w-7xl',    // 1280px
    full: 'max-w-none'
  };
  
  return (
    <div className={`
      mx-auto 
      ${sizeClasses[size]} 
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

// Usage Examples
const HomePage = () => (
  <Container size="xl">
    <main className="space-y-16">
      <HeroSection />
      <ProjectShowcase />
      <TechStack />
    </main>
  </Container>
);

const BlogPost = () => (
  <Container size="md" className="prose prose-lg">
    <article>
      <header className="mb-8">
        <h1>Advanced Robotics Control Systems</h1>
        <p className="text-gray-600">Technical deep-dive into modern control theory</p>
      </header>
      <PostContent />
    </article>
  </Container>
);
```

### Grid System Pattern

Flexible grid system based on CSS Grid with responsive breakpoints and automatic spacing.

```tsx
interface GridProps {
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

const Grid: React.FC<GridProps> = ({
  cols = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className = '',
  children
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6', 
    lg: 'gap-8',
    xl: 'gap-12'
  };
  
  const colsClass = typeof cols === 'number' 
    ? `grid-cols-${cols}` 
    : Object.entries(cols)
        .map(([breakpoint, count]) => 
          breakpoint === 'sm' ? `grid-cols-${count}` : `${breakpoint}:grid-cols-${count}`
        ).join(' ');
  
  return (
    <div className={`grid ${colsClass} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Usage Examples
const ProjectsGrid = () => (
  <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="lg">
    {projects.map(project => (
      <ProjectCard key={project.id} {...project} />
    ))}
  </Grid>
);

const MetricsDashboard = () => (
  <Grid cols={{ sm: 2, lg: 4 }} gap="md">
    <MetricCard title="Response Time" value="245ms" trend="down" />
    <MetricCard title="Error Rate" value="0.02%" trend="stable" />
    <MetricCard title="CPU Usage" value="68%" trend="up" />
    <MetricCard title="Memory" value="4.2GB" trend="stable" />
  </Grid>
);
```

### Stack Pattern

Vertical or horizontal stacking with consistent spacing and alignment options.

```tsx
interface StackProps {
  direction?: 'vertical' | 'horizontal';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  spacing = 'md',
  align,
  justify,
  wrap = false,
  className = '',
  children
}) => {
  const spacingClasses = {
    xs: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8'
  };
  
  const alignClasses = {
    start: direction === 'vertical' ? 'items-start' : 'justify-start',
    center: direction === 'vertical' ? 'items-center' : 'justify-center',
    end: direction === 'vertical' ? 'items-end' : 'justify-end',
    stretch: direction === 'vertical' ? 'items-stretch' : 'justify-stretch'
  };
  
  const justifyClasses = {
    start: direction === 'vertical' ? 'justify-start' : 'items-start',
    center: direction === 'vertical' ? 'justify-center' : 'items-center',
    end: direction === 'vertical' ? 'justify-end' : 'items-end',
    between: direction === 'vertical' ? 'justify-between' : 'items-between',
    around: direction === 'vertical' ? 'justify-around' : 'items-around',
    evenly: direction === 'vertical' ? 'justify-evenly' : 'items-evenly'
  };
  
  return (
    <div className={`
      flex
      ${direction === 'vertical' ? 'flex-col' : 'flex-row'}
      ${spacingClasses[spacing]}
      ${align ? alignClasses[align] : ''}
      ${justify ? justifyClasses[justify] : ''}
      ${wrap ? 'flex-wrap' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Usage Examples
const ButtonGroup = () => (
  <Stack direction="horizontal" spacing="sm" align="center">
    <Button variant="primary">Save</Button>
    <Button variant="outline">Cancel</Button>
    <Button variant="ghost">Reset</Button>
  </Stack>
);

const FeatureList = () => (
  <Stack direction="vertical" spacing="lg">
    {features.map(feature => (
      <FeatureCard key={feature.id} {...feature} />
    ))}
  </Stack>
);
```

## Navigation Patterns

### Primary Navigation Pattern

Main site navigation with responsive behavior and accessibility features.

```tsx
interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  external?: boolean;
  children?: NavigationItem[];
}

interface NavigationProps {
  brand: { name: string; logo?: string; href?: string };
  items: NavigationItem[];
  actions?: React.ReactNode;
  sticky?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  brand,
  items,
  actions,
  sticky = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className={`
      bg-white border-b border-gray-200 
      ${sticky ? 'sticky top-0 z-50' : ''}
    `}>
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link href={brand.href || '/'} className="flex items-center space-x-2">
              {brand.logo && (
                <img src={brand.logo} alt={brand.name} className="h-8 w-auto" />
              )}
              <span className="font-bold text-xl">{brand.name}</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map(item => (
              <NavigationLink key={item.href} {...item} />
            ))}
          </div>
          
          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {actions}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          items={items}
          actions={actions}
          onClose={() => setMobileMenuOpen(false)}
        />
      </Container>
    </nav>
  );
};
```

### Breadcrumb Pattern

Hierarchical navigation showing user's current location.

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRightIcon className="h-4 w-4 text-gray-400" />,
  className = ''
}) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">{separator}</span>}
            
            {item.href && !item.active ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={item.active ? 'text-gray-900 font-medium' : ''}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Usage Example
const ProjectDetailPage = ({ project }) => (
  <Container>
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: project.category, href: `/projects?category=${project.category}` },
        { label: project.name, active: true }
      ]}
    />
    <ProjectContent project={project} />
  </Container>
);
```

### Tab Navigation Pattern

Horizontal tab interface for content organization.

```tsx
interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };
  
  const activeItem = items.find(item => item.id === activeTab);
  
  return (
    <div className="w-full">
      {/* Tab List */}
      <div className={`
        flex border-b border-gray-200
        ${variant === 'pills' ? 'bg-gray-100 rounded-lg p-1' : ''}
      `}>
        {items.map(item => (
          <TabButton
            key={item.id}
            item={item}
            isActive={item.id === activeTab}
            onClick={() => handleTabChange(item.id)}
            variant={variant}
            size={size}
          />
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="py-6">
        {activeItem?.content}
      </div>
    </div>
  );
};

// Usage Example
const ProjectDetails = ({ project }) => (
  <Tabs
    items={[
      {
        id: 'overview',
        label: 'Overview',
        content: <ProjectOverview project={project} />
      },
      {
        id: 'technical',
        label: 'Technical Details',
        content: <TechnicalSpecs project={project} />
      },
      {
        id: 'demo',
        label: 'Interactive Demo',
        content: <ProjectDemo project={project} />
      },
      {
        id: 'code',
        label: 'Source Code',
        content: <SourceCode project={project} />
      }
    ]}
    defaultTab="overview"
  />
);
```

## Content Patterns

### Card Pattern

Flexible content containers with consistent styling and interactive states.

```tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  loading = false,
  header,
  footer,
  className = '',
  onClick,
  children
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-transparent border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border-0',
    filled: 'bg-gray-50 border-0'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  };
  
  if (loading) {
    return <CardSkeleton variant={variant} padding={padding} />;
  }
  
  return (
    <div
      className={`
        rounded-lg transition-all duration-200
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverable ? 'hover:shadow-md' : ''}
        ${clickable ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {header && (
        <div className={`${padding !== 'none' ? '-mt-2 mb-4' : 'mb-4'}`}>
          {header}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {footer && (
        <div className={`${padding !== 'none' ? '-mb-2 mt-4' : 'mt-4'}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Specialized Card Variants
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <Card
    variant="elevated"
    hoverable
    clickable
    onClick={() => navigate(`/projects/${project.id}`)}
    header={
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{project.name}</h3>
        <TechBadge tech={project.primaryTech} />
      </div>
    }
    footer={
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {project.tags.map(tag => (
            <Tag key={tag} size="sm">{tag}</Tag>
          ))}
        </div>
        <Button size="sm" variant="outline">
          View Project
        </Button>
      </div>
    }
  >
    <div className="space-y-3">
      <img 
        src={project.thumbnail} 
        alt={project.name}
        className="w-full h-48 object-cover rounded"
      />
      <p className="text-gray-600">{project.description}</p>
    </div>
  </Card>
);
```

### Modal Pattern

Accessible modal dialogs with focus management and keyboard handling.

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  preventClose?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  preventClose = false,
  className = '',
  children
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const firstFocusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusableElement?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, preventClose]);
  
  if (!isOpen) return null;
  
  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={!preventClose ? onClose : undefined}
        />
        
        {/* Modal Content */}
        <div className={`
          relative bg-white rounded-lg shadow-xl
          ${sizeClasses[size]}
          max-h-[90vh] overflow-auto
          transform transition-all duration-200
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${className}
        `}>
          {/* Header */}
          {(title || !preventClose) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold">
                  {title}
                </h2>
              )}
              
              {!preventClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

// Usage Examples
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="text-center space-y-4">
      <p className="text-gray-600">{message}</p>
      <div className="flex justify-center space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  </Modal>
);

const ProjectDetailsModal = ({ project, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
    <div className="space-y-6">
      <img 
        src={project.image} 
        alt={project.name}
        className="w-full h-64 object-cover rounded"
      />
      <div>
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-600">{project.description}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
        <TechnicalSpecs project={project} />
      </div>
    </div>
  </Modal>
);
```

## Form Patterns

### Form Group Pattern

Consistent form field layout with validation and accessibility.

```tsx
interface FormGroupProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({
  label,
  name,
  required = false,
  error,
  help,
  className = '',
  children
}) => {
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;
  const helpId = `help-${name}`;
  
  return (
    <div className={`form-group ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          name,
          'aria-describedby': [
            error ? errorId : '',
            help ? helpId : ''
          ].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined
        })}
        
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {help && !error && (
        <p id={helpId} className="mt-1 text-sm text-gray-500">
          {help}
        </p>
      )}
    </div>
  );
};

// Usage Example
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form className="space-y-6">
      <FormGroup
        label="Full Name"
        name="name"
        required
        error={errors.name}
        help="Enter your first and last name"
      >
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
        />
      </FormGroup>
      
      <FormGroup
        label="Email Address"
        name="email"
        required
        error={errors.email}
      >
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
        />
      </FormGroup>
      
      <FormGroup
        label="Subject"
        name="subject"
        error={errors.subject}
      >
        <Input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="How can we help?"
        />
      </FormGroup>
      
      <FormGroup
        label="Message"
        name="message"
        required
        error={errors.message}
        help="Please provide as much detail as possible"
      >
        <TextArea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell us about your project..."
          rows={6}
        />
      </FormGroup>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Send Message
        </Button>
      </div>
    </form>
  );
};
```

These UI patterns provide a comprehensive foundation for building consistent, accessible, and user-friendly interfaces throughout the Antimony Labs portfolio. Each pattern includes proper accessibility attributes, keyboard navigation, and responsive behavior.