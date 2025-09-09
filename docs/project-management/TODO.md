NOTE: Keep format exactly: TASK: <id> | STATUS: <status>
Simple agent should execute tasks top-to-bottom. Only edit listed files.

STATUSES: TODO (not started), DOING (in progress), DONE (completed), BLOCKED (needs help), FUTURE (later backlog)

==================================================
TASK: 1-branding | STATUS: DONE
GOAL: Rebrand to "Antimony Labs" everywhere.
FILES: navigation, layout, homepage, blog-data.
ACCEPT: No old name appears.

TASK: 2-footer-techstack | STATUS: DONE
GOAL: Footer with system status + tech stack icons + versions.
FILES: src/components/Footer.tsx, src/components/TechStack.tsx, api/tech-versions.
ACCEPT: Version tooltips show.

TASK: 3-style-guide | STATUS: DONE
GOAL: Base design tokens + docs file.
FILES: STYLEGUIDE.md, globals.css, tailwind.config.js.
ACCEPT: Tokens referenced via CSS vars.

TASK: 4-portfolio-data | STATUS: DONE
GOAL: Structured projects + experience data.
FILES: src/lib/portfolio/*, pages projects/about.
ACCEPT: Pages render dynamically.

TASK: 5-theme-presets | STATUS: DONE
GOAL: 3 presets + custom builder with persistence.
FILES: presets.ts, ThemePresetSwitcher.tsx, page.tsx.
ACCEPT: Theme persists on reload.

TASK: 6-prevent-fouc | STATUS: TODO
GOAL: Eliminate flash on load.
FILES: layout.tsx.
STEPS:
 1 add inline script reading localStorage preset/custom
 2 generate CSS vars before body paint
ACCEPT: No color flicker.

TASK: 7-contrast-badges | STATUS: TODO
GOAL: Show AA/AAA contrast for primary/secondary mid tones.
FILES: presets.ts, ThemePresetSwitcher.tsx.
ACCEPT: Badges appear after color change.

TASK: 8-theme-export | STATUS: TODO
GOAL: Export/import JSON theme.
FILES: ThemePresetSwitcher.tsx.
STEPS: export button, copy JSON, import parse + apply.
ACCEPT: Import yields identical variables.

TASK: 9-shadow-border-tokens | STATUS: TODO
GOAL: Replace ad-hoc shadows + borders with tokens.
FILES: globals.css.
ACCEPT: Classes use token names only.

TASK: 10-ambient-layer | STATUS: TODO
GOAL: Subtle grid/noise background; disabled reduced-motion.
FILES: new component AmbientLayer.tsx + globals.css.
ACCEPT: Toggle off when prefers-reduced-motion.

TASK: 11-cursor-spotlight | STATUS: TODO
GOAL: Radial highlight follows cursor (desktop only).
FILES: globals.css or Spotlight.tsx.
ACCEPT: Hidden on touch devices.

TASK: 12-focus-halo | STATUS: TODO
GOAL: Keyboard focus halo effect.
FILES: globals.css, small script to set data-keyboard.
ACCEPT: Halo only after Tab key usage.

TASK: 13-telemetry-model | STATUS: TODO
GOAL: Data objects for telemetry values.
FILES: src/lib/telemetry/data.ts.
FIELDS: id,label,value,updatedAt,type.

TASK: 14-telemetry-bar | STATUS: TODO
GOAL: Horizontal auto-scroll metrics bar.
FILES: TelemetryBar.tsx.
ACCEPT: Pauses on hover.

TASK: 15-deployment-metadata | STATUS: TODO
GOAL: Inject build info JSON.
FILES: build script (scripts/), public/build-info.json.
ACCEPT: Footer shows commit hash.

TASK: 16-expandable-project-cards | STATUS: TODO
GOAL: Card expands in place.
FILES: projects page + component CardExpandable.tsx.
ACCEPT: Esc closes; focus returns.

TASK: 17-project-rich-content | STATUS: TODO
GOAL: Load metrics/media lazily in expanded view.
FILES: ExpandedProject.tsx.
ACCEPT: Network only when expanded.

TASK: 18-lab-log-model | STATUS: TODO
GOAL: Experiment entries model.
FILES: src/lib/lab-log/data.ts.
FIELDS: id,title,status,result,date,tags,notes.

TASK: 19-lab-log-ui | STATUS: TODO
GOAL: Timeline render + status filters.
FILES: LabLogTimeline.tsx.
ACCEPT: Filter updates list.

TASK: 20-knowledge-capsules | STATUS: TODO
GOAL: Audience summary blocks in blog.
FILES: capsule component + blog rendering logic.
ACCEPT: Block renders for configured posts.

TASK: 21-swarm-reactivity | STATUS: TODO
GOAL: Swarm colors use active theme mid tone.
FILES: SwarmSimulation.tsx.
ACCEPT: Changing theme updates particles.

TASK: 22-swarm-controls | STATUS: TODO
GOAL: UI sliders for cohesion/alignment/separation/speed.
FILES: SwarmControls.tsx.
ACCEPT: Values persist in localStorage.

TASK: 23-swarm-reduced-motion | STATUS: TODO
GOAL: Static snapshot when reduced motion.
FILES: SwarmSimulation.tsx.
ACCEPT: No animation with prefers-reduced-motion.

TASK: 24-hardware-explorer | STATUS: TODO
GOAL: 3D viewer placeholder + orbit controls.
FILES: HardwareExplorer.tsx.
ACCEPT: Fallback image on mobile.

TASK: 25-error-boundaries | STATUS: TODO
GOAL: Isolate visualization crashes.
FILES: VisualizationErrorBoundary.tsx.
ACCEPT: App stays functional if crash.

TASK: 26-a11y-audit | STATUS: TODO
GOAL: Log axe issues.
FILES: accessibility-report.md.
ACCEPT: Zero critical violations.

TASK: 27-keyboard-coverage | STATUS: TODO
GOAL: All interactive elements operable via keyboard.
FILES: Components touched incrementally.
ACCEPT: Tab order logical; Enter/Space work.

TASK: 28-contrast-monitor | STATUS: FUTURE
GOAL: Dev overlay highlighting low contrast.
FILES: overlay script.

TASK: 29-bundle-opt | STATUS: TODO
GOAL: Reduce initial JS size.
FILES: next.config.js (analyze), dynamic imports.
ACCEPT: < 180KB gzip initial.

TASK: 30-perf-budgets | STATUS: TODO
GOAL: Track LCP/CLS metrics.
FILES: telemetry instrumentation.
ACCEPT: LCP < 2.5s, CLS < 0.1.

TASK: 31-inline-theme-css | STATUS: TODO
GOAL: Inline current theme vars server-side.
FILES: layout.tsx.
ACCEPT: No flash.

TASK: 32-feature-flags | STATUS: TODO
GOAL: Env flags for experimental features.
FILES: config/index.ts.
FLAGS: LAB_LOG, SWARM_V2.

TASK: 33-theme-config-refactor | STATUS: TODO
GOAL: Extract logic to hook.
FILES: useThemePresets.ts, refactor switcher.
ACCEPT: Component < 200 lines.

TASK: 34-theme-export-tests | STATUS: TODO
GOAL: Unit tests for presets + custom apply.
FILES: tests/theme.test.ts.
ACCEPT: All tests pass.

TASK: 35-color-scale-tests | STATUS: TODO
GOAL: Deterministic scale generation.
FILES: tests/color-scale.test.ts.
ACCEPT: Mid tone stable.

TASK: 36-visual-regression | STATUS: TODO
GOAL: Screenshot diff key pages.
FILES: playwright tests.
ACCEPT: Baseline generated.

TASK: 37-dynamic-og-image | STATUS: FUTURE
GOAL: OG image reflects active theme colors.
FILES: /api/og/route.ts.

TASK: 38-theme-export-json | STATUS: TODO
GOAL: Copy JSON + import apply (duplicate of export but explicit).
FILES: ThemePresetSwitcher.tsx.

TASK: 39-swarm-id-hash | STATUS: TODO
GOAL: Deterministic ID displayed + copy.
FILES: footer extension, hash util.

TASK: 40-mobile-theme-button | STATUS: TODO
GOAL: Floating FAB for theme on small screens.
FILES: MobileThemeFab.tsx.

TASK: 41-interaction-analytics | STATUS: TODO
GOAL: Log key UI events.
FILES: analytics util + event calls.

TASK: 42-offline-caching | STATUS: FUTURE
GOAL: Basic offline for static assets.
FILES: service worker.

TASK: 43-docs-embed | STATUS: TODO
GOAL: In-page docs section #documentation.
FILES: homepage section.

TASK: 44-docs-advanced | STATUS: TODO
GOAL: Document advanced features (swarm, telemetry, export).
FILES: docs content component.

TASK: 45-update-styleguide-link | STATUS: TODO
GOAL: STYLEGUIDE.md points to in-app docs.
FILES: STYLEGUIDE.md.

TASK: 46-deploy-staging | STATUS: TODO
GOAL: Run staging deploy script.
FILES: scripts/deployment/*.
ACCEPT: URL reachable.

TASK: 47-dynamic-imports-visual | STATUS: TODO
GOAL: Lazy load heavy visualization components.
FILES: SwarmSimulation dynamic import.

TASK: 48-gradient-hairlines | STATUS: TODO
GOAL: Utility for 1px gradient border.
FILES: globals.css.

TASK: 49-shadow-token-system | STATUS: TODO
GOAL: Named shadow vars (shadow-sm, shadow-md...).
FILES: globals.css.

TASK: 50-summary-complete | STATUS: DOING
GOAL: Keep this file updated when tasks change.
FILES: TODO.md.

APPENDIX COMPLETED TASKS: branding, footer, style guide, portfolio data, theme presets & custom.

END OF FILE
