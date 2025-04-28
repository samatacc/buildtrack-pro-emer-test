# Translation Management System Evaluation

## Overview

This document evaluates different translation management systems for integration with BuildTrack Pro. As a construction management platform with international users, we need a robust system that can handle construction-specific terminology across multiple languages while maintaining our mobile-first design approach.

## Evaluation Criteria

Each system is evaluated based on the following criteria:

1. **Integration with Next.js** - How well it works with our Next.js (App Router) and next-intl setup
2. **Developer Experience** - Ease of implementation and maintenance
3. **Content Editor Experience** - Interface for translators and content managers
4. **Mobile Support** - Alignment with our mobile-first approach
5. **Construction Industry Features** - Support for industry-specific terminology
6. **Cost** - Pricing structure and value
7. **Scalability** - Ability to grow with BuildTrack Pro
8. **Automation** - Machine translation and workflow automation

## Systems Evaluated

### 1. Lokalise

**Integration with Next.js:** ★★★★★
- Official Next.js integration via NPM package
- Supports JSON file format used by next-intl
- Webhooks for automated deployment

**Developer Experience:** ★★★★★
- CLI tools for syncing translations
- GitHub integration
- Powerful API for automation

**Content Editor Experience:** ★★★★☆
- Clean, intuitive interface
- In-context editing
- Translation memory and glossary
- Comment and task system

**Mobile Support:** ★★★★☆
- Mobile app for translation on the go
- Mobile screenshot support for context
- Mobile-specific translation tags

**Construction Industry Features:** ★★★☆☆
- Custom glossaries can be established
- No specific construction templates

**Cost:** ★★★☆☆
- Starts at $90/month for small teams
- Pay per user and word count

**Scalability:** ★★★★★
- Enterprise plans available
- Handles millions of translation keys

**Automation:** ★★★★★
- Machine translation integration
- Translation memory leveraging
- QA checks and validation

### 2. Phrase (formerly Memsource)

**Integration with Next.js:** ★★★★☆
- No official Next.js integration but supports JSON
- More manual setup required
- API-driven workflow

**Developer Experience:** ★★★★☆
- GitHub sync
- CLI tools
- Content delivery API

**Content Editor Experience:** ★★★★★
- Advanced CAT (Computer Assisted Translation) tools
- Translation Memory and Term Base
- Collaborative features

**Mobile Support:** ★★★★★
- Mobile app with offline capability
- In-context QA for mobile UI
- Responsive preview

**Construction Industry Features:** ★★★★☆
- Industry-specific machine translation tuning
- Term base with construction terminology support
- More enterprise-focused with industry solutions

**Cost:** ★★★☆☆
- Enterprise pricing (quote-based)
- Higher entry point than Lokalise

**Scalability:** ★★★★★
- Used by large enterprises
- Multi-layered organization management

**Automation:** ★★★★★
- Advanced AI translation
- Automated quality checks
- Workflow automation

### 3. Crowdin

**Integration with Next.js:** ★★★★☆
- JSON support
- GitHub integration 
- Manual setup for Next.js

**Developer Experience:** ★★★★★
- Great CLI and API
- Source code integration
- Version control friendly

**Content Editor Experience:** ★★★★☆
- Clean interface
- Proofreader tools
- Commenting and discussion

**Mobile Support:** ★★★☆☆
- Reasonable mobile interface
- Less focus on mobile-first workflows

**Construction Industry Features:** ★★★☆☆
- No specific construction features
- Generic translation memory and glossary

**Cost:** ★★★★☆
- More affordable than Lokalise and Phrase
- Starts at $19/month for small projects

**Scalability:** ★★★★☆
- Handles large projects
- Enterprise options available

**Automation:** ★★★★☆
- Machine translation integration
- Quality assurance tools
- Integration with CI/CD

### 4. POEditor

**Integration with Next.js:** ★★★☆☆
- JSON support
- No specific Next.js integration
- API for custom integration

**Developer Experience:** ★★★☆☆
- Simple API
- Less developer-focused than alternatives
- Basic GitHub integration

**Content Editor Experience:** ★★★☆☆
- Clean but basic interface
- Translation memory
- Basic collaboration

**Mobile Support:** ★★☆☆☆
- Limited mobile focus
- No mobile app

**Construction Industry Features:** ★★☆☆☆
- No industry-specific features

**Cost:** ★★★★★
- Most affordable option
- Linear pricing based on word count

**Scalability:** ★★★☆☆
- Less suitable for large enterprise needs
- Good for medium-sized projects

**Automation:** ★★★☆☆
- Basic machine translation
- Import/export automation
- API for custom workflows

## Integration Approach for Next.js with next-intl

### Recommended Integration with Lokalise

Based on our evaluation, **Lokalise** provides the best balance of features, Next.js support, and construction industry capability. Here's how we'd implement it:

1. **Installation:**
   ```bash
   npm install @lokalise/node-api
   ```

2. **Configuration Setup:**
   
   Create a configuration file at `app/utils/lokaliseConfig.ts`:
   ```typescript
   export const LOKALISE_CONFIG = {
     apiKey: process.env.LOKALISE_API_KEY,
     projectId: process.env.LOKALISE_PROJECT_ID
   };
   ```

3. **Translation Download Script:**

   Create a script at `scripts/downloadTranslations.js`:
   ```javascript
   const { LokaliseApi } = require('@lokalise/node-api');
   const fs = require('fs');
   const path = require('path');
   
   const { LOKALISE_CONFIG } = require('../app/utils/lokaliseConfig');
   
   async function downloadTranslations() {
     const lokaliseApi = new LokaliseApi({ apiKey: LOKALISE_CONFIG.apiKey });
     
     try {
       // Request a file export
       const response = await lokaliseApi.files().download(LOKALISE_CONFIG.projectId, {
         format: 'json',
         original_filenames: false,
         bundle_structure: '%LANG_ISO%.json',
         directory_prefix: '',
         filter_langs: ['en', 'es', 'fr', 'pt-BR'],
         export_empty_as: 'skip'
       });
       
       console.log('Successfully downloaded translations:', response);
       
       // Additional processing to place files in the correct messages/ directory
       // ...
     } catch (error) {
       console.error('Error downloading translations:', error);
     }
   }
   
   downloadTranslations();
   ```

4. **Add to Build Pipeline:**

   Update package.json:
   ```json
   "scripts": {
     "download-translations": "node scripts/downloadTranslations.js",
     "build": "npm run download-translations && next build"
   }
   ```

5. **GitHub Action for CI/CD:**

   Create `.github/workflows/translation-sync.yml`:
   ```yaml
   name: Sync Translations
   
   on:
     push:
       branches: [ main, development ]
     workflow_dispatch:
   
   jobs:
     sync:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Use Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm ci
         - name: Sync translations
           run: npm run download-translations
           env:
             LOKALISE_API_KEY: ${{ secrets.LOKALISE_API_KEY }}
             LOKALISE_PROJECT_ID: ${{ secrets.LOKALISE_PROJECT_ID }}
         - name: Commit changes
           uses: stefanzweifel/git-auto-commit-action@v4
           with:
             commit_message: "chore: sync translations from Lokalise"
   ```

6. **Upload Changes Script:**

   Create `scripts/uploadTranslations.js` for developers to push new keys:
   ```javascript
   const { LokaliseApi } = require('@lokalise/node-api');
   const fs = require('fs');
   const path = require('path');
   
   const { LOKALISE_CONFIG } = require('../app/utils/lokaliseConfig');
   
   async function uploadTranslations() {
     const lokaliseApi = new LokaliseApi({ apiKey: LOKALISE_CONFIG.apiKey });
     const enTranslationsPath = path.join(__dirname, '../messages/en.json');
     
     try {
       const content = fs.readFileSync(enTranslationsPath, 'utf8');
       
       const data = {
         data: content,
         filename: 'en.json',
         lang_iso: 'en'
       };
       
       const response = await lokaliseApi.files().upload(LOKALISE_CONFIG.projectId, data);
       console.log('Successfully uploaded new translation keys:', response);
     } catch (error) {
       console.error('Error uploading translations:', error);
     }
   }
   
   uploadTranslations();
   ```

7. **Validate Translations in Pre-commit Hook:**

   Enhance our existing pre-commit hook to validate translations:
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   
   cd $(git rev-parse --show-toplevel)
   
   # Check if translations file has changed
   if git diff --cached --name-only | grep -q "messages/en.json"; then
     echo "✓ Running translation validation..."
     npx ts-node scripts/validate-translations.ts
     if [ $? -ne 0 ]; then
       echo "❌ Translation validation failed. Please fix the issues before committing."
       exit 1
     fi
     
     echo "✓ Running translation check against Lokalise keys..."
     node scripts/checkTranslationsAgainstLokalise.js
     if [ $? -ne 0 ]; then
       echo "⚠️ Warning: Some keys may be missing from Lokalise. Consider running 'npm run upload-translations'."
     fi
   fi
   ```

## Conclusion

Based on our evaluation, we recommend implementing Lokalise as the translation management system for BuildTrack Pro due to its superior Next.js integration, developer experience, and reasonable support for construction industry needs.

The implementation plan provides a solid foundation for integrating Lokalise with our existing next-intl setup while maintaining our mobile-first design principles and accessible user interface.

The following steps should be taken:
1. Set up a trial account with Lokalise
2. Implement the integration scripts
3. Import existing translations
4. Train the content team on the new system
5. Set up automated workflows for the continuous translation process
