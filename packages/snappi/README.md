# Snappi 📸

> Visual regression testing made simple

Snappi is a modern visual regression testing tool designed to work seamlessly with Storybook. It captures, compares, and maintains visual snapshots of your components across different viewports.

## Features

- 🖼️ **Automated Screenshots**: Capture consistent snapshots of your Storybook components
- 📱 **Multi-viewport Support**: Test across mobile, tablet, and desktop views
- 🎯 **Smart Diffing**: Visual difference detection with configurable thresholds
- 🎨 **Visual Feedback**: Color-coded diff images showing exactly what changed
- 📂 **Organized Structure**: Clear separation of references, tests, and diffs
- 🚀 **CI/CD Ready**: Easy integration with your pipeline

## Installation

```bash
# Using npm
npm install @reshot-sdk/snappi --save-dev

# Using pnpm
pnpm add -D @reshot-sdk/snappi

# Using yarn
yarn add -D @reshot-sdk/snappi
```

## Usage

### Quick Start

1. Initialize Snappi configuration:
```bash
pnpm snappi init
```

2. Capture reference screenshots:
```bash
pnpm snappi capture
```

3. Run visual regression tests:
```bash
pnpm snappi test
```

### CLI Commands

#### \`snappi init\`
Generate configuration based on your Storybook setup.

```bash
# Basic usage
pnpm snappi init

# Custom Storybook URL
pnpm snappi init --url http://localhost:9009

# Custom output location
pnpm snappi init --output ./config/snappi.config.json
```

Options:
- \`-u, --url <url>\` - Storybook URL (default: "http://localhost:6006")
- \`-d, --dir <directory>\` - Storybook static directory (default: "storybook-static")
- \`-o, --output <path>\` - Output path for config file (default: "./snappi.config.json")

#### \`snappi capture\`
Capture reference screenshots for your components.

```bash
# Basic usage
pnpm snappi capture

# Force update all references
pnpm snappi capture --force

# Use custom config
pnpm snappi capture --config ./custom-config.json
```

Options:
- \`-c, --config <path>\` - Path to config file (default: "./snappi.config.json")
- \`-f, --force\` - Force overwrite existing references (default: false)

#### \`snappi test\`
Run visual regression tests against references.

```bash
# Basic usage
pnpm snappi test

# Custom config location
pnpm snappi test --config ./custom-config.json
```

Options:
- \`-c, --config <path>\` - Path to config file (default: "./snappi.config.json")
- \`-o, --output <dir>\` - Output directory (default: ".snappi")

## Configuration

\`snappi.config.json\` example:

```json
{
  "id": "my-component-library",
  "viewports": [
    {
      "label": "phone",
      "width": 320,
      "height": 480
    },
    {
      "label": "tablet",
      "width": 768,
      "height": 1024
    },
    {
      "label": "desktop",
      "width": 1920,
      "height": 1080
    }
  ],
  "defaultDelay": 800,
  "defaultMisMatchThreshold": 0.1
}
```

### Advanced Configuration

#### Custom Selectors
```json
{
  "scenarios": [
    {
      "label": "Button/Primary",
      "waitForSelector": "#storybook-root",
      "hideSelectors": [".animation"],
      "removeSelectors": [".dev-tools"],
      "clickSelectors": [".toggle-button"]
    }
  ]
}
```

#### Viewport Options
```json
{
  "viewports": [
    {
      "label": "mobile",
      "width": 375,
      "height": 667,
      "isMobile": true
    },
    {
      "label": "desktop-dark",
      "width": 1440,
      "height": 900,
      "colorScheme": "dark"
    }
  ]
}
```

## Project Structure

After running tests, your project will have this structure:

```
.snappi/
├── references/          # Baseline screenshots
│   ├── Button_desktop.png
│   └── Button_mobile.png
├── tests/              # Test run screenshots
│   └── 20240104-123456-789/
│       ├── Button_desktop.png
│       └── Button_mobile.png
└── diffs/              # Visual difference images
    └── 20240104-123456-789/
        └── Button_desktop.png
```

## CI Integration

Example GitHub Actions workflow:

```yaml
name: Visual Tests
on: [pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build Storybook
        run: pnpm build-storybook
        
      - name: Run visual tests
        run: |
          pnpm snappi init
          pnpm snappi test
```

## Troubleshooting

### Common Issues

1. **Missing References**
   ```bash
   Error: No baseline found
   ```
   Run \`pnpm snappi capture\` first to create reference images.

2. **Storybook Not Running**
   ```bash
   Error: Failed to connect to Storybook
   ```
   Ensure Storybook is running at the configured URL.

3. **High Diff Percentages**
    - Check for dynamic content
    - Increase \`misMatchThreshold\`
    - Use \`hideSelectors\` for animations

## Contributing

Pull requests are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT © Your Name

## Acknowledgments

Built with:
- [Playwright](https://playwright.dev/)
- [pixelmatch](https://github.com/mapbox/pixelmatch)
- [Commander.js](https://github.com/tj/commander.js/)