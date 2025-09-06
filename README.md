# Antimony Labs - Personal Portfolio

Shivam Bhardwaj's personal portfolio website built with Next.js and deployed on Google Cloud Platform.

## 🚀 Features

- **Modern Design**: Clean, professional portfolio with dark theme
- **Responsive**: Optimized for desktop and mobile
- **Fast**: Next.js 15 with App Router for optimal performance
- **Cloud-Native**: Deployed on Google App Engine
- **Automated**: Master controller script for complete workflow
- **Type-Safe**: Full TypeScript implementation
- **Tested**: Comprehensive testing with Vitest and Playwright

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Backend**: Next.js API Routes
- **Cloud**: Google App Engine, Cloud Build
- **Domain**: Cloudflare DNS
- **Testing**: Vitest, Playwright, Testing Library
- **Development**: ESLint, Prettier, Husky

## 🏃‍♂️ Quick Start

### Using the Master Controller (Recommended)
```bash
# Run the interactive menu
master-controller.bat

# Or use direct commands
master-controller.bat quick-dev    # Start development server
master-controller.bat build        # Build for production
master-controller.bat deploy       # Deploy to GCP
```

### Manual Commands
```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## 📁 Project Structure

```
antimony-labs/
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── (pages)/            # Route groups
│   │   │   ├── about/          # About page
│   │   │   ├── blog/           # Blog pages
│   │   │   ├── contact/        # Contact page
│   │   │   ├── projects/       # Projects page
│   │   │   └── api/            # API routes
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable components
│   │   ├── Hero3D.tsx          # 3D hero section
│   │   ├── Navigation.tsx      # Navigation component
│   │   ├── SwarmSimulation.tsx # Swarm simulation
│   │   └── TechStack.tsx       # Tech stack display
│   ├── lib/                    # Utility libraries
│   │   ├── blog-data.ts        # Blog data management
│   │   ├── logging.ts          # Logging utilities
│   │   └── robotics/           # Robotics algorithms
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
│   ├── favicon.ico
│   └── favicon.svg
├── scripts/                    # Automation scripts
│   ├── master-controller.js    # Main controller script
│   └── deployment/             # Deployment scripts
├── master-controller.bat       # Windows batch controller
├── package.json                # Dependencies & scripts
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── playwright.config.ts        # E2E testing config
├── vitest.config.ts            # Unit testing config
├── app.yaml                    # App Engine config
├── cloudbuild.yaml             # Cloud Build config
└── README.md                   # This file
```

## 🎯 Development Workflow

### 1. Local Development
```bash
master-controller.bat
# Then select option 1 (Development Menu) -> 1 (Start Dev Server)
```
- Starts Next.js development server
- Opens browser automatically at http://localhost:3000
- Hot reload enabled
- TypeScript checking active

### 2. Testing
```bash
master-controller.bat
# Then select option 2 (Testing Menu) -> 1 (Run All Tests)
```
- Runs unit tests with Vitest
- Executes E2E tests with Playwright
- Accessibility and performance tests
- Coverage reports generated

### 3. Deploy to GCP
```bash
master-controller.bat
# Then select option 3 (Build & Deploy) -> 5 (Deploy to GCP Production)
```
- Builds production bundle
- Deploys to Google App Engine
- Automatic SSL certificate provisioning
- CDN and caching configured

## 🌐 Live URLs

- **Production**: https://anti-mony.uc.r.appspot.com
- **Custom Domain**: shivambhardwaj.com

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - TypeScript type checking

### Testing
- `npm run test` - Run unit tests
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:accessibility` - Accessibility tests
- `npm run test:performance` - Performance tests

### Quality
- `npm run lint` - ESLint code quality
- `npm run lint:fix` - Auto-fix lint issues
- `npm run security:audit` - Security audit

### Deployment
- `master-controller.bat` - Interactive deployment menu
- `npm run deploy:staging` - Deploy to staging
- `npm run deploy:production` - Deploy to production

## 🏗 Infrastructure

### Google Cloud Setup
- **Project**: anti-mony
- **Service**: App Engine (default service)
- **Region**: us-central1
- **Runtime**: Node.js 18

### Domain Configuration
- **Registrar**: Cloudflare
- **DNS**: Cloudflare DNS with proxy
- **SSL**: Automatic via App Engine
- **CDN**: Cloudflare CDN enabled

## 📊 Monitoring

### Health Endpoints
- `GET /api/health` - Service status
- `GET /api/tech-versions` - Technology stack info

### Logging
```bash
master-controller.bat
# Select option 6 (Monitoring) -> 1 (View Application Logs)
```

### Performance Monitoring
- Core Web Vitals tracking
- Lighthouse performance scores
- Real-time error monitoring
- User analytics

## 🚀 Deployment

The application deploys to Google App Engine:

1. **Build**: Next.js production build
2. **Deploy**: App Engine deployment with `gcloud app deploy`
3. **SSL**: Automatic certificate provisioning
4. **Scaling**: Automatic scaling based on traffic
5. **CDN**: Static assets served via CDN

## 🔒 Security Features

- **HTTPS Only**: Automatic SSL certificates
- **CORS Configured**: Proper cross-origin handling
- **Security Headers**: Helmet.js integration
- **Input Validation**: TypeScript type safety
- **Dependency Scanning**: Automated security audits

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Report issues
- Suggest improvements
- Fork for your own use

## 📄 License

MIT License - Feel free to use this as a template for your own portfolio.

---

**Built with ❤️ by Shivam Bhardwaj**  
Powered by Google Cloud Platform