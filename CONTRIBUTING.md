# Contributing to TaskFlow

First of all, thank you for considering contributing to TaskFlow! It's people like you that make TaskFlow such a great tool. We welcome contributions from everyone, regardless of their experience level.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Workflow](#development-workflow)
  - [Setting Up Your Development Environment](#setting-up-your-development-environment)
  - [Coding Standards](#coding-standards)
  - [Commit Guidelines](#commit-guidelines)
- [Project Structure](#project-structure)
- [Review Process](#review-process)

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to [project_email@example.com](mailto:project_email@example.com).

## Getting Started

Before you begin:
- Make sure you have a [GitHub account](https://github.com/signup/free)
- Familiarize yourself with Git and GitHub workflows
- Read through this document to understand our development process

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

#### Before Submitting A Bug Report

- Check the [existing issues](https://github.com/yourusername/taskflow/issues) to see if the problem has already been reported.
- Perform a cursory search to see if the problem has been reported already.

#### How Do I Submit A Good Bug Report?

Bugs are tracked as [GitHub issues](https://github.com/yourusername/taskflow/issues). Create an issue and provide the following information:

- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Describe the behavior you observed and what was expected
- Include screenshots if possible
- Provide your browser and OS information
- Add any other context that might be helpful

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

#### Before Submitting An Enhancement Suggestion

- Check if the enhancement has already been suggested.
- Determine which repository the enhancement should be suggested in.
- Perform a cursory search to see if the enhancement has already been suggested.

#### How Do I Submit A Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/taskflow/issues). Create an issue and provide the following information:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Describe the current behavior and explain why the suggested enhancement would be useful
- Include screenshots or mock-ups if applicable
- Explain why this enhancement would be useful to most TaskFlow users

### Pull Requests

The process described here has several goals:
- Maintain TaskFlow's quality
- Fix problems that are important to users
- Enable a sustainable system for maintaining and reviewing contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Fork the repository
2. Create a new branch from `main` for your changes
3. Make your changes following our [coding standards](#coding-standards)
4. Write or adapt tests as needed
5. Update documentation as needed
6. Submit a pull request

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Development Workflow

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

3. Create a branch for your changes:
```bash
git checkout -b your-branch-name
```

### Coding Standards

Please follow the [Style Guide](STYLE_GUIDE.md) for this project. Here are some key points:

- Use 4 spaces for indentation in JavaScript
- Use 2 spaces for indentation in HTML and CSS
- Write meaningful commit messages
- Comment your code where necessary
- Write tests for your changes
- Update documentation as needed

### Commit Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
    - ✨ `:sparkles:` when adding a new feature
    - 🐛 `:bug:` when fixing a bug
    - 📝 `:memo:` when adding or updating documentation
    - 🎨 `:art:` when improving the format/structure of the code
    - ⚡️ `:zap:` when improving performance
    - 🔧 `:wrench:` when updating configs

## Project Structure

Understanding the project structure will help you locate and make changes efficiently:

```
taskflow/
├── assets/          # Static assets like images, CSS, and JavaScript
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript files
│   └── images/      # Image files
├── .github/         # GitHub specific files
├── docs/            # Documentation
└── index.html       # Main HTML file
```

## Review Process

All submissions, including submissions by project members, require review. We use GitHub pull requests for this purpose. Consult [GitHub Help](https://help.github.com/articles/about-pull-requests/) for more information on using pull requests.

1. A maintainer will review your pull request
2. The maintainer may request changes
3. Once your pull request is approved, it will be merged into the main branch
4. Your contribution will be part of the next release

Thank you for contributing to TaskFlow!
