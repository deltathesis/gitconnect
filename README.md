# GitConnect ![](https://travis-ci.org/deltathesis/gitconnect.svg?branch=dev)
[GitConnect Website](http://gitconnect.me)  

GitConnect is a social application designed to help you meet new developers in your area. 
Our matching algorithm uses your GitHub account to find other people with similar interests,
and allows you to connect with them and collaborate on projects. After you work on a project with your
new friend, you can publish it to our project page and see how it ranks against other community members.

## Documentation
For this application, we created several functions that helped simplify the process of interacting with the neo4j database.  
Please check out [DOCUMENTATION.md](DOCUMENTATION.md) for more information on our custom-built neo4j queries.

## Architecture 
__Overall Application Architecture__
![alt text](http://i.imgur.com/RVy1MLQ.jpg)

__Database Schema__
![alt text](http://i.imgur.com/5M6qCse.png)


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

- `npm install`  
- `npm start`  
- Before running the application on your local machine, you must create a .env file in the root directory. A [env template](dotenvTemplate) is created for you. Please fill it out and rename it to ".env" before launching the server.  
- Afterwards, navigate to http://localhost:3000 to start using the application.


## Testing

__Install__  
First, we install Protractor and update our webdriver-manager that is used for our selenium server.    
- `npm install -g protractor`  
- `webdriver-manager update`  

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
- `webdriver-manager start`  
- `protractor client/testing/conf.js`

## Contributing

1. Fork our repo and clone your fork to your local computer.
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
__Please try to write self-documenting code and comments when contributing!__

## Authors 
- Renan Deswarte
- Chris Nixon
- Yusuf Modan
- Jake Garelick
- Royce Leung
