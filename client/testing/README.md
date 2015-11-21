#Protractor Setup and Testing###
=====

##Setup on OSX
-----


###Install protractor

`npm install -g protractor`

###Update webdriver-manager
`webdriver-manager update`

###Install JDK

[Link to Oracle JDK page](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

###Install Chrome Browser

###Start Selenium Server
`webdriver-manager start`

###Run Test
Go into client/testing and run

`protractor conf.js`


###Github account needed
You must first have authorize the application with your github account.

Then, add a `userinfo.js` into the testing folder.

Into `userinfo.js`, add these lines with your github account information:

`exports.github = {
  username: "YOUR_GITHUB_USERNAME",
  password: "PASSWORD"
};`






