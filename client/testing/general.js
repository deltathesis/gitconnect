describe('App Global Info', function() {
  it('should have a title', function() {
    browser.get('http://localhost:3000/#/');
    expect(browser.getTitle()).toEqual('GitConnect');
  });
});

