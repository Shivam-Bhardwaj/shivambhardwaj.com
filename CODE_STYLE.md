# Code Style Guidelines

## No Emojis

**Rule**: Emojis are not allowed in code, comments, documentation, or UI text.

- Use plain text labels instead of emojis
- UI elements should use text or icons, not emojis
- Documentation should be professional and emoji-free
- Commit messages should not contain emojis

## No AI-Generated Content

**Rule**: Avoid AI-generated boilerplate, verbose comments, or generic explanations.

### What to Avoid

- Verbose JSDoc comments that restate the obvious
- Generic AI-generated function descriptions
- Excessive inline comments explaining basic code
- Copy-pasted AI explanations without context
- Overly detailed comments that don't add value

### What's Acceptable

- Concise, meaningful comments explaining non-obvious logic
- References to research papers or algorithms when relevant
- Technical documentation for complex systems
- Clear, purposeful code documentation

### Examples

**Bad** (AI-generated verbosity):
```typescript
/**
 * This function calculates the distance between two points.
 * It takes two Vector2 objects as parameters and returns the distance.
 * The distance is calculated using the Euclidean distance formula.
 */
function distance(a: Vector2, b: Vector2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
```

**Good** (concise and meaningful):
```typescript
// Calculate Euclidean distance between two points
function distance(a: Vector2, b: Vector2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
```

**Acceptable** (research reference):
```typescript
/**
 * Potential fields navigation algorithm.
 * Reference: Real-Time Obstacle Avoidance for Manipulators and Mobile Robots (Khatib, 1986)
 */
```

## Code Review Checklist

When reviewing code, check for:
- [ ] No emojis in code, comments, or UI
- [ ] Comments are concise and meaningful
- [ ] No unnecessary AI-generated boilerplate
- [ ] Code is self-documenting where possible
- [ ] Documentation references are accurate and relevant

