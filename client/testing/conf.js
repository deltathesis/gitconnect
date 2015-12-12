exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'general.js',
    'github-login.js',
    'navigation.js',
    'project-creation.js'
  ]
};