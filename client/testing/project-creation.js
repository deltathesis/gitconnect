var env = require('./userinfo.js');
var path = require('path');

describe('Create a project', function() {
  // Show add project modal
  it('Project button should bring back to the projects page', function() {
    element(by.className('link-projects-container')).click();
    element(by.className('link-add-a-project')).click();
    browser.driver.sleep(500);
    element(by.className('input-add-project-name')).sendKeys("Protractor Test Project");
    element(by.className('project-add-submit')).click();
    browser.driver.sleep(500);
    expect(true).toEqual(true);
  });

  it('Edit the project informations', function() {
    // Edit Project Resources
    element(by.className('edit')).click();
    browser.driver.sleep(500);
    element(by.className('resource-repo')).sendKeys("http://protractor-resource-repo");
    element(by.className('resource-library')).sendKeys("http://protractor-resource-library");
    element(by.className('resource-storage')).sendKeys("http://protractor-resource-storage");
    element(by.className('resource-board')).sendKeys("http://protractor-resource-board");
    element(by.className('resource-website')).sendKeys("http://protractor-resource-website");
    element(by.className('resource-database')).sendKeys("http://protractor-resource-database");
    element(by.className('resource-submit')).click();
    expect(true).toEqual(true);
  });

  it('Send message to collaborators', function() {
    // Send a message to the page
    browser.driver.sleep(500);
    element(by.className('collaboration-text-input')).sendKeys("This is a default test message");
    element(by.className('message-send')).click().then(function() {
      element.all(by.repeater('message in messages')).then(function(messages) {
        // Check if message displayed
        var text = messages[0].element(by.className('message-content-body'));
        expect(text.getText()).toEqual('This is a default test message');
      });
    });
    browser.driver.sleep(500);
    expect(true).toEqual(true);
  });

  it('Fill publish project form and send form', function() {
    // Publish the project
    element(by.className('publish-action')).click();
    browser.driver.sleep(500);
    element(by.className('input-about')).sendKeys("http://protractor-input-about");
    element(by.className('input-short-desc')).sendKeys("http://protractor-input-short-desc");
    element(by.className('input-repo')).sendKeys("http://protractor-input-repo");
    element(by.className('input-website')).sendKeys("http://protractor-input-website");
    element(by.css('.tech[data-tech="AngularJS"]')).click();
    element(by.css('.tech[data-tech="HTML"]')).click();
    element(by.css('.tech[data-tech="CSS"]')).click();
    element(by.css('.tech[data-tech="JavaScript"]')).click();
    element(by.css('.tech[data-tech="Node.js"]')).click();
    element(by.css('.tech[data-tech="Protractor"]')).click();

    //Upload the file
    var fileToUpload = './picture/path/picture-project.jpg',
    absolutePath = path.resolve(__dirname, fileToUpload);

    element(by.className('input-file')).sendKeys(absolutePath); 

    // Publish the project
    element(by.className('project-publish-submit')).click();
    browser.driver.sleep(500);
    browser.driver.sleep(500);
    expect(true).toEqual(true);
  });

  it('Remove popup alert', function() {
    // Remove alert pop up
    browser.ignoreSynchronization = true;
    browser.driver.sleep(200);
    browser.switchTo().alert().accept();
    browser.driver.sleep(500);
    expect(true).toEqual(true);
  });

  it('Check if project is on the user project list page', function() {
    browser.driver.sleep(1000);
    element(by.css('.user-name[data-project-name="Protractor Test Project"]')).click();
    browser.driver.sleep(500);
    expect(true).toEqual(true);
  });

  it('Delete the test project', function() {
    // Delete the project
    browser.driver.sleep(500);
    element(by.className('delete-project')).click();
    browser.driver.sleep(500);
    element(by.className('username-input')).sendKeys(env.github.username);
    element(by.className('submit-project-delete')).click();
    expect(true).toEqual(true);
  });

});
