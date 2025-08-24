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

## 📋 Development Guidelines

### Code Style

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Processes voice command for payment transactions
 * @param command - The voice command string
 * @param context - User context and settings
 * @returns Promise resolving to parsed command
 */
async function processVoiceCommand(
  command: string,
  context: UserContext
): Promise<ParsedCommand> {
  // Implementation
}
```

#### Rust (Smart Contracts)
- Follow Rust formatting standards (`cargo fmt`)
- Use `cargo clippy` for linting
- Add comprehensive documentation
- Include unit tests for all functions

```rust
/// Records a payment transaction on-chain
/// 
/// # Arguments
/// * `recipient` - The recipient's AccountId
/// * `amount` - The payment amount in Planck
/// * `voice_command` - Original voice command for audit
/// 
/// # Returns
/// Result indicating success or error
#[ink(message)]
pub fn record_payment(
    &mut self,
    recipient: AccountId,
    amount: Balance,
    voice_command: String,
) -> Result<(), Error> {
    // Implementation
}
```

### Git Commit Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or modifying tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(voice): add multi-currency command parsing
fix(security): resolve rate limiting bypass vulnerability
docs(api): update voice command reference
test(integration): add wallet connection tests
```

### Testing Requirements

#### Frontend Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y
```

#### Smart Contract Tests
```bash
# Unit tests
cargo test

# Integration tests
cargo test --features integration

# Security tests
cargo test --features security
```

#### Test Coverage
- Minimum 80% code coverage
- All public APIs must have tests
- Critical security functions require 100% coverage
- E2E tests for main user flows

### Documentation Standards

#### Code Documentation
- All public functions must have JSDoc/rustdoc
- Include parameter types and descriptions
- Add usage examples for complex functions
- Document error conditions

#### User Documentation
- Write in clear, simple language
- Include code examples
- Add screenshots for UI features
- Provide troubleshooting guides

## 🔒 Security Guidelines

### Reporting Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@echopay.io
2. Include detailed reproduction steps
3. Provide impact assessment
4. Allow 90 days for fix before disclosure

### Security Review Process

All security-related changes require:
- Security team review
- Automated security scanning
- Manual penetration testing
- Documentation updates

### Security-Critical Areas

Be extra careful when modifying:
- Voice biometric verification
- Transaction validation
- Rate limiting mechanisms
- Encryption/decryption functions
- Smart contract storage
- Wallet integration code

## 🎯 Feature Development Process

### Before Starting

1. **Check Existing Issues** - Avoid duplicate work
2. **Create Feature Request** - Discuss approach with maintainers
3. **Design Review** - For significant features
4. **Security Assessment** - For security-sensitive features

### Development Phases

#### Phase 1: Design & Planning
- [ ] Feature specification document
- [ ] Security impact assessment
- [ ] UI/UX mockups (if applicable)
- [ ] API design (if applicable)
- [ ] Test plan creation

#### Phase 2: Implementation
- [ ] Core functionality
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation updates
- [ ] Security review

#### Phase 3: Testing & Review
- [ ] Code review by maintainers
- [ ] Security audit (for sensitive features)
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] User acceptance testing

#### Phase 4: Deployment
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] User feedback collection
- [ ] Bug fixes and improvements

## 🏗️ Project Structure

```
echopay-2/
├── contracts/          # Smart contracts (Rust/ink!)
├── frontend/           # React frontend
├── docs/              # Documentation
├── tests/             # Test suites
├── scripts/           # Development scripts
├── deployment/        # Deployment configs
└── config/            # Configuration files
```

### Adding New Components

#### Frontend Components
```bash
# Create component file
touch frontend/voice-payment-dapp/src/components/YourComponent.tsx

# Add tests
touch frontend/voice-payment-dapp/src/components/__tests__/YourComponent.test.tsx

# Add to index
# Update frontend/voice-payment-dapp/src/components/index.ts
```

#### Smart Contract Functions
```bash
# Add function to lib.rs
# Add tests to tests/
# Update documentation
# Run security audit
```

## 🎨 UI/UX Guidelines

### Design Principles
- **Accessibility First** - WCAG 2.1 AAA compliance
- **Mobile Responsive** - Touch-friendly interfaces
- **Voice-Optimized** - Clear audio feedback
- **Consistent** - Follow design system
- **Performance** - Fast loading and interactions

### Accessibility Requirements
- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Voice feedback for all actions

### Design Assets
- Use consistent color palette
- Follow typography guidelines
- Optimize images and icons
- Support dark/light modes
- Ensure responsive breakpoints

## 🌐 Internationalization

### Adding New Languages

1. **Create Translation Files**
   ```bash
   touch frontend/voice-payment-dapp/src/locales/[language-code].json
   ```

2. **Add Language Configuration**
   ```typescript
   // frontend/voice-payment-dapp/src/i18n/config.ts
   export const supportedLanguages = {
     en: 'English',
     es: 'Español',
     fr: 'Français',
     // Add your language
   };
   ```

3. **Update Voice Commands**
   ```json
   // config/voice-commands.json
   {
     "languages": {
       "en": { "send": ["send", "pay", "transfer"] },
       "es": { "send": ["enviar", "pagar", "transferir"] }
     }
   }
   ```

## 📊 Performance Guidelines

### Performance Targets
- Voice processing: < 1.5 seconds
- Page load time: < 3 seconds
- Bundle size: < 1MB (main)
- Memory usage: < 100MB
- Transaction confirmation: < 5 seconds

### Optimization Techniques
- Code splitting and lazy loading
- Image optimization
- Bundle analysis and tree shaking
- Memory leak prevention
- Database query optimization
- Caching strategies

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors.

#### Our Standards
- **Be respectful** - Treat everyone with respect
- **Be inclusive** - Welcome people of all backgrounds
- **Be collaborative** - Work together constructively
- **Be professional** - Focus on technical merit
- **Be patient** - Help newcomers learn

#### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information
- Spam or off-topic content

### Getting Help

### Recognition

Contributors are recognized through:
- GitHub contributor stats
- Hall of Fame in documentation
- Special Discord roles
- Conference speaking opportunities
- Mentorship opportunities

## 📝 License

By contributing to EchoPay-2, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

## 🎉 Thank You!

Every contribution, no matter how small, helps make EchoPay-2 better for everyone. We appreciate your time and effort in helping us build the future of accessible Web3 payments.

---

**Questions?** Feel free to reach out to our community on Discord or create an issue for clarification.
