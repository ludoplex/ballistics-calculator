# GitHub Pages Deployment

This project is configured to deploy automatically to GitHub Pages when changes are pushed to the `main` branch.

## Deployment Workflow

The deployment is handled by the `.github/workflows/deploy-pages.yml` workflow, which:

1. Builds the Vite React TypeScript application using Node.js 18
2. Uploads the production build (`dist/` directory) as a GitHub Pages artifact
3. Deploys the artifact to GitHub Pages

## Manual Deployment

You can also trigger a deployment manually using the workflow_dispatch event in the GitHub Actions tab.

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install --force

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- The workflow uses `npm ci` for dependency installation, which requires a `package-lock.json` file
- The `.nojekyll` file prevents GitHub Pages from processing the site with Jekyll
- The production build outputs to the `./dist` directory by default
