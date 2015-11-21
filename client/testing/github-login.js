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
});
