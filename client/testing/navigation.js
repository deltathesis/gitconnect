var env = require('./userinfo.js');

describe('Github Connection', function() {
  var loginNameInputElm = $('#login_field');
  var passwordInputElm = $('#password');
  var loginBtnElm = $('input[type=submit]');

  it('non-angular page so ignore sync and active wait to load', function() {
      browser.ignoreSynchronization = true;
      browser.get('http://127.0.0.1:3000' + '/auth/github');
  });

  it('should fill user and password and logins', function() {
      loginNameInputElm.sendKeys(env.github.username);
      passwordInputElm.sendKeys(env.github.password);
      $('input[type=submit]').click();
  });

  it('restores ignore sync when switching back to angular pages', function() {
      browser.ignoreSynchronization = false; // restore
      // browser.pause()
  });

  // Navigation
  it('Logo button should bring back to the homepage', function() {
    element(by.css('.link-logo')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/');
  });
  it('Connect button should bring back to the connect page', function() {
    element(by.css('.link-connect')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/connect');
  });
  it('Project button should bring back to the projects page', function() {
    element(by.css('.link-projects')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/projects');
  });
  it('Homepage to connect to projects to login to homepage', function() {
    element(by.css('.link-connect')).click();
    element(by.css('.link-projects')).click();
    element(by.css('.link-logo')).click();
    expect(browser.getCurrentUrl()).toEqual('http://127.0.0.1:3000/#/');
  });
});
