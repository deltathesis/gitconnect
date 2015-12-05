## Testing with Protractor

###Install
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

###Launch
Launch Selenium Server and launch Protractor    
`webdriver-manager start`  
`protractor client/testing/conf.js`








