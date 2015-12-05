# GitConnect
[GitConnect Website](http://gitconnect.me)  

GitConnect is a social network application that extends the functionality of GitHub. With GitConnect, you are able to discover, message, and collaborate with other developers to create meaningful projects.

## Documentation
Please check out [DOCUMENTATION.md](DOCUMENTATION.md) for information on our custom-built neo4j queries.

## Architecture 

Show images on the structure of our application.


## Technology Stack 

- AngularJS
- Node/Express
- Neo4j
- Firebase
- Travis CI
- Jasmine
- Protractor
- Gulp
- AWS S3
- Socket.io
- Sass
- GitHub API
- Google Maps and Analytics

## Installation 

`npm install`  
`npm start`  
Navigate to http://localhost:3000 to start using the application.


## Testing

__Install__  
First, we install Protractor and update our webdriver-manager that is used for our selenium server.    
`npm install -g protractor`  
`webdriver-manager update`

Chrome Browser and Java JDK is necessary for Protractor to run.  
[Oracle JDK Download Page](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)  
[Google Chrome Download Page](https://www.google.com/chrome/)

You must first authorize your github account to be used by GitConnect. On your first login in our application, you will be prompted to do so.

Next, please go into /client/testing/ and add a userinfo.js with the following information:  
```javascript
exports.github = {  
username: "YOUR_GITHUB_USERNAME",  
password: "PASSWORD"  
};
```

__Launch__  
Launch Selenium Server and launch Protractor    
`webdriver-manager start`  
`protractor client/testing/conf.js`

## Contributing

1. Fork our repo and clone it to your local computer.
2. Create your feature branch from the dev branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m '(type)Add some feature'`  
  __Allowed type values:__
  - **feat** (new feature for the user, not a new feature for build script)
  - **fix** (bug fix for the user, not a fix to a build script)
  - **docs** (changes to the documentation)
  - **style** (formatting, missing semi colons, etc; no production code change)
  - **refactor** (refactoring production code, eg. renaming a variable)
  - **test** (adding missing tests, refactoring tests; no production code change)
  - **chore** (updating grunt tasks etc; no production code change)
4. Push to the branch: `git push origin my-new-feature`.  
5. Submit a pull request to the dev branch.

## Authors 
- Renan Deswarte
- Chris Nixon
- Yusuf Modan
- Jake Garelick
- Royce Leung