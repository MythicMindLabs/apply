# Contributing to EchoPay-2

Thank you for your interest in contributing to EchoPay-2! This document provides guidelines and information for contributors.

## 🌟 How to Contribute

### Types of Contributions

We welcome all types of contributions:

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve guides and references
- 🔧 **Code Contributions** - Fix bugs or implement features
- 🎨 **Design Improvements** - Enhance UI/UX
- ♿ **Accessibility** - Make EchoPay-2 more accessible
- 🔒 **Security** - Report vulnerabilities responsibly
- 🌍 **Translations** - Add multi-language support

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/echopay-2.git
   cd echopay-2
   ```

2. **Set Up Development Environment**
   ```bash
   npm run setup
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make Your Changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

5. **Test Your Changes**
   ```bash
   npm test
   npm run test:e2e
   npm run lint
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add voice command for multi-currency support"
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Use our PR template
   - Provide clear description
   - Link related issues
