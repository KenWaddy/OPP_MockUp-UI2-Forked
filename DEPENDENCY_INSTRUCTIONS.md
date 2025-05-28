# Dependency Installation Instructions

If you encounter issues with missing dependencies like `i18next` or `react-i18next`, please try the following steps:

1. Delete the `node_modules` folder and `package-lock.json` file:
   ```
   rm -rf node_modules
   rm package-lock.json
   ```

2. Clear npm cache:
   ```
   npm cache clean --force
   ```

3. Reinstall all dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

These steps should resolve any dependency resolution issues with i18next and react-i18next packages.
