describe('App Global Info', function() {
  it('should have a title', function() {
    browser.get('http://localhost:3000/#/');
    expect(browser.getTitle()).toEqual('Git Connect');
  });
});

describe('Menu Navigation', function() {
  it('Logo button should bring back to the homepage', function() {
    browser.get('http://localhost:3000/#/');
    element(by.css('.link-logo')).click();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/');
  });
  it('View1 button should bring back to the view1', function() {
    browser.get('http://localhost:3000/#/');
    element(by.css('.link-view1')).click();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/view1');
  });
  it('View2 button should bring back to the view2', function() {
    browser.get('http://localhost:3000/#/');
    element(by.css('.link-view2')).click();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/view2');
  });
  it('Login button should bring back to the login', function() {
    browser.get('http://localhost:3000/#/');
    element(by.css('.link-login')).click();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/login');
  });
  it('Homepage to view1 to view2 to login to homepage', function() {
    browser.get('http://localhost:3000/#/');
    element(by.css('.link-view1')).click();
    element(by.css('.link-view2')).click();
    element(by.css('.link-login')).click();
    element(by.css('.link-logo')).click();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/');
  });

});
