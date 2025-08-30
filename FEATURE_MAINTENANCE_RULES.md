# Feature Maintenance Rules

This document establishes rules to ensure features are well-maintained and to prevent accidental duplication or breakage.

## Core Principles

### 1. Single Responsibility Principle
- Each component should have ONE clear purpose
- If a component does multiple things, consider splitting it
- Example: VersionDisplay and VersionInfo were both showing version - one was removed

### 2. No Duplicate Functionality 
- Before adding a new feature, search codebase for existing similar functionality
- Use `grep` or `Grep` tool to search for similar patterns
- Document why duplicates exist if they're truly needed

### 3. Consistent Design Patterns

#### Theme Support
- ALL visual components MUST support both light and dark themes
- Use `document.documentElement.classList.contains('dark')` to detect theme
- Canvas/drawing operations must check theme and adapt colors accordingly
- Example: Robot paths in SmartAvoidanceRobots now adapt to theme

#### Component Structure
- Navigation: Centered menu, no header redundancy
- Version info: Footer only (via VersionInfo component)
- Theme toggle: Top-right fixed position
- Background: Robot simulation always running

## Maintenance Checklist

### Before Adding Features
- [ ] Search for existing similar functionality
- [ ] Check if theme support is needed
- [ ] Verify component follows established patterns
- [ ] Test in both light and dark modes

### Before Modifying Features
- [ ] Understand current implementation completely
- [ ] Test iteratively with small changes
- [ ] Build and verify after each change
- [ ] Deploy and test on live site

### Code Quality Gates
- [ ] No ESLint errors (warnings acceptable)
- [ ] TypeScript compilation passes
- [ ] Build completes successfully
- [ ] No console errors in browser

## Specific Rules

### BAT File Management
- **Rule**: ONLY ONE batch file allowed: `master.bat` in root directory
- **Rationale**: Centralized control system prevents script fragmentation
- **Enforcement**: 
  - ❌ No additional `.bat`, `.cmd`, or batch script files anywhere in project
  - ❌ No creating new batch files for specific features or utilities
  - ✅ All functionality MUST be integrated into `master.bat` menus
- **Violation Response**: Merge functionality into `master.bat` and delete additional files

### Version Display
- **Rule**: Only show version info in the Footer via VersionInfo component
- **Rationale**: Prevents duplicate version displays
- **Location**: `src/components/Footer.tsx` uses `VersionInfo`

### Navigation
- **Rule**: Menu items centered, no logo/name duplication in header
- **Rationale**: Clean, focused navigation experience
- **Implementation**: `src/components/Navbar.tsx` uses `justify-center`

### Theme Support
- **Rule**: All visual elements must adapt to dark/light themes
- **Implementation**: 
  - CSS: Use Tailwind dark: classes
  - Canvas: Check `document.documentElement.classList.contains('dark')`
  - Components: Use theme-aware color schemes

### Robot Background
- **Rule**: Robot simulation always runs, adapts to theme
- **Colors**: 
  - Light mode: Light background fade, darker robot elements
  - Dark mode: Dark background fade, brighter robot elements
- **Implementation**: `SmartAvoidanceRobots.tsx` detects theme in animate loop

## Testing Strategy

### Iterative Testing
1. Make ONE small change at a time
2. Build and test immediately: `npm run build`
3. Deploy to test: `node scripts/deploy-quick.js`
4. Verify functionality works as expected
5. Move to next change

### Theme Testing
1. Test feature in light mode
2. Toggle to dark mode
3. Verify all visual elements adapt correctly
4. Check that robot paths/trails are visible
5. Ensure no hard-coded colors remain

## Tools and Commands

### Search for Similar Features
```bash
# Search for existing functionality
grep -r "version" src/
grep -r "Version" src/
```

### Build and Test Pipeline
```bash
# Quick build test
npm run build

# Full production deployment
node scripts/production-deploy.js

# Quick deployment for testing
node scripts/deploy-quick.js
```

### Development Best Practices
- Use absolute imports: `@/components/...`
- Follow TypeScript strict mode
- Use semantic HTML and ARIA labels
- Test on both desktop and mobile
- Verify accessibility with screen readers

## Change Log Requirement

When modifying features, update this document with:
1. What was changed
2. Why it was changed  
3. How to maintain it going forward

This ensures knowledge is preserved and prevents regression.