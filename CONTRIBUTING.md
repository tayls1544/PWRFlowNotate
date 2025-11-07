# Contributing to PWRFlow Notate

Thank you for your interest in contributing to PWRFlow Notate! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information

## Getting Started

### Prerequisites

- Node.js and npm (for any future build processes)
- Git
- Google Chrome (for testing)
- A GitHub account

### First Time Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/PWRFlowNotate.git
   cd PWRFlowNotate
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/PWRFlowNotate.git
   ```

4. **Load extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the project directory

## Development Setup

### Directory Structure

```
PWRFlowNotate/
├── content/          # Content scripts
├── popup/            # Extension popup
├── icons/            # Extension icons
├── docs/             # Documentation
└── tests/            # Test files (coming soon)
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit the relevant files
   - Follow coding standards (see below)

3. **Test your changes**
   - Reload extension in Chrome
   - Test on Power Automate
   - Check browser console for errors

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues
- Verify it's reproducible
- Check if it's already fixed in the latest version

When creating a bug report, include:
- **Title**: Clear, descriptive title
- **Description**: What happened vs. what you expected
- **Steps to reproduce**: Numbered list of steps
- **Environment**: Chrome version, OS, Power Automate URL
- **Screenshots**: If applicable
- **Console errors**: From browser DevTools

**Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment:**
- Chrome Version: [e.g. 96.0.4664.110]
- OS: [e.g. Windows 10]
- Extension Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Features

When suggesting a feature:
- Check if it's already requested
- Explain the use case
- Describe the proposed solution
- Consider alternative solutions

**Template:**
```markdown
**Feature Description**
A clear description of the feature.

**Problem it Solves**
What problem does this solve for users?

**Proposed Solution**
How would you implement this?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Mockups, examples, or references.
```

### Code Contributions

Areas where we need help:
- Bug fixes
- Feature implementations
- Performance improvements
- Documentation
- Test coverage
- Accessibility improvements

## Coding Standards

### JavaScript Style

```javascript
// Use const/let, not var
const CONSTANT_VALUE = 'value';
let variable = 'value';

// Use template literals
const message = `Hello ${name}`;

// Use arrow functions
const myFunction = () => {
  // function body
};

// Use async/await instead of callbacks
async function fetchData() {
  const result = await chrome.storage.local.get(['key']);
  return result;
}

// Always handle errors
try {
  await riskyOperation();
} catch (error) {
  console.error('Error:', error);
}
```

### Naming Conventions

```javascript
// Classes: PascalCase
class AnnotationManager {}

// Functions/Methods: camelCase
function saveAnnotation() {}

// Constants: UPPER_SNAKE_CASE
const MAX_ANNOTATIONS = 100;

// Private members: prefix with _
this._privateMethod = () => {};

// DOM elements: descriptive names
const annotationModal = document.querySelector('.modal');
```

### CSS Style

```css
/* Use BEM-style naming */
.pwrflow-block {}
.pwrflow-block__element {}
.pwrflow-block--modifier {}

/* Prefer classes over IDs */
.good-selector {}
#avoid-ids {}

/* Group related properties */
.element {
  /* Positioning */
  position: relative;
  top: 0;

  /* Display & Box Model */
  display: flex;
  width: 100px;

  /* Typography */
  font-size: 14px;

  /* Visual */
  background: white;

  /* Animation */
  transition: all 0.3s ease;
}
```

### HTML Style

```html
<!-- Use semantic HTML -->
<button type="button">Click me</button>
<input type="text" aria-label="Description">

<!-- Include accessibility attributes -->
<div role="dialog" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
</div>

<!-- Use data attributes for JS hooks -->
<div data-pwrflow-id="123">Content</div>
```

### Code Comments

```javascript
/**
 * Comprehensive function documentation
 * @param {string} elementId - The ID of the element
 * @param {Object} annotation - The annotation data
 * @returns {boolean} True if successful
 */
function saveAnnotation(elementId, annotation) {
  // Explain why, not what
  // Good: Debounce to prevent excessive storage writes
  // Bad: Call debounce function

  return true;
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(annotations): add export to PDF functionality"

# Bug fix
git commit -m "fix(modal): prevent modal from closing on outside click"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(storage): migrate to chrome.storage.sync

BREAKING CHANGE: Annotations now sync across devices"
```

### Commit Best Practices

- Keep commits atomic (one logical change)
- Write clear, descriptive messages
- Reference issues when applicable (#123)
- Don't commit unrelated changes together

## Pull Request Process

### Before Submitting

- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Follow coding standards
- [ ] Write clear commit messages
- [ ] Rebase on latest main branch

### Submitting a PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill out the PR template

3. **PR Template**
   ```markdown
   ## Description
   What does this PR do?

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How was this tested?

   ## Screenshots
   If applicable

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   ```

### PR Review Process

1. **Automated checks** (if configured)
   - Linting passes
   - Tests pass

2. **Code review**
   - At least one approval required
   - Address review comments

3. **Merge**
   - Squash and merge (preferred)
   - Rebase and merge (for clean history)
   - Merge commit (for feature branches)

## Testing

### Manual Testing Checklist

Test on Power Automate:
- [ ] Create annotation
- [ ] Edit annotation
- [ ] Delete annotation
- [ ] Add color marker
- [ ] Add tags
- [ ] Export annotations
- [ ] Clear all annotations
- [ ] Reload page (annotations persist)

Test popup:
- [ ] Open popup
- [ ] View statistics
- [ ] Export works
- [ ] Clear all works

Browser compatibility:
- [ ] Chrome
- [ ] Edge
- [ ] Brave (if possible)

### Future: Automated Testing

We plan to add:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

## Documentation

### When to Update Docs

Update documentation when:
- Adding new features
- Changing behavior
- Fixing bugs that affect usage
- Adding configuration options

### Documentation Files

- `README.md` - Main documentation
- `INSTALL.md` - Installation guide
- `CONTRIBUTING.md` - This file
- Code comments - For complex logic

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots where helpful
- Keep it up-to-date

## Questions?

- Open a [Discussion](https://github.com/original/PWRFlowNotate/discussions)
- Join our community chat (coming soon)
- Email: your.email@example.com

## Recognition

Contributors will be:
- Added to README contributors section
- Credited in release notes
- Recognized in the community

Thank you for contributing to PWRFlow Notate! 🎉
