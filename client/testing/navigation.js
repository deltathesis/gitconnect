var env = require('./userinfo.js');

describe('Github Connection', function() {

  // Navigation
  it('Logo button should bring back to the homepage', function() {
    element(by.css('.link-logo')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/welcome');
  });
  it('Connect button should bring back to the connect page', function() {
    element(by.css('.link-connect')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/connect');
  });
  it('News button should bring back to the homepage page', function() {
    element(by.css('.link-news')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/');
  });
  it('Project button should bring back to the projects page', function() {
    element(by.css('.link-projects-container')).click();
    element(by.css('.link-community-projects')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/projects');
  });
  it('Project button should bring back to the projects page', function() {
    element(by.css('.link-projects-container')).click();
    element(by.css('.link-my-projects')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/my-projects');
  });
  it('Project button should bring back to the projects page', function() {
    element(by.css('.link-connections-container')).click();
    element(by.css('.link-my-connections')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/my-connections');
  });
  it('Project button should bring back to the projects page', function() {
    element(by.css('.link-connections-container')).click();
    element(by.css('.link-pending-requests')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/requests');
  });
  it('Go back to welcome page', function() {
    element(by.css('.link-logo')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/welcome');
  });
});
