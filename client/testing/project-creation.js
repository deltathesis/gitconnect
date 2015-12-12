var env = require('./userinfo.js');
var path = require('path');

describe('Create a project', function() {
  // Show add project modal
  it('Project button should bring back to the projects page', function() {
    element(by.css('.link-projects-container')).click();
    element(by.css('.link-add-a-project')).click();
    browser.driver.sleep(500);
    $('.input-add-project-name').sendKeys("Protractor Test Project");
    element(by.css('.project-add-submit')).click();

    // Edit Project Resources
    element(by.css('.edit')).click();
    browser.driver.sleep(500);
    $('.resource-repo').sendKeys("http://protractor-resource-repo");
    $('.resource-library').sendKeys("http://protractor-resource-library");
    $('.resource-storage').sendKeys("http://protractor-resource-storage");
    $('.resource-board').sendKeys("http://protractor-resource-board");
    $('.resource-website').sendKeys("http://protractor-resource-website");
    $('.resource-database').sendKeys("http://protractor-resource-database");
    element(by.css('.resource-submit')).click();

    // Send a message to the page
    browser.driver.sleep(500);
    $('.collaboration-text-input').sendKeys("This is a default test message");
    element(by.css('.message-send')).click().then(function() {
      element.all(by.repeater('message in messages')).then(function(messages) {
        // Check if message displayed
         var text = messages[0].element(by.className('message-content-body'));
         expect(text.getText()).toEqual('This is a default test message');
      });
    });
    browser.driver.sleep(500);

    // Publish the project
    element(by.css('.publish-action')).click();
    browser.driver.sleep(500);
    $('.input-about').sendKeys("http://protractor-input-about");
    $('.input-short-desc').sendKeys("http://protractor-input-short-desc");
    $('.input-repo').sendKeys("http://protractor-input-repo");
    $('.input-website').sendKeys("http://protractor-input-website");
    $('.tech[data-tech="AngularJS"]').click();
    $('.tech[data-tech="HTML"]').click();
    $('.tech[data-tech="CSS"]').click();
    $('.tech[data-tech="JavaScript"]').click();
    $('.tech[data-tech="Node.js"]').click();
    $('.tech[data-tech="Protractor"]').click();

    //Upload the file
    var fileToUpload = './picture/path/picture-project.jpg',
      absolutePath = path.resolve(__dirname, fileToUpload);

    $('.input-file').sendKeys(absolutePath); 

    // Publish the project
    $('.project-publish-submit').click();
    browser.driver.sleep(500);

    // Remove alert pop up
    browser.ignoreSynchronization = true;
    browser.driver.sleep(200);
    browser.switchTo().alert().accept();

    browser.driver.sleep(500);
    $('.user-name[data-project-name="Protractor Test Project"]').click();

    // Delete the project
    browser.driver.sleep(500);
    element(by.css('.delete-project')).click();
    browser.driver.sleep(500);
    $('.username-input').sendKeys(env.github.username);
    element(by.css('.submit-project-delete')).click();

  });
});
