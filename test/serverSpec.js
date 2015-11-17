require('dotenv').load(); //load environmental variables

var expect = require('chai').expect;
var http = require('http');
var server = require('../server/server');

var BASE_URL = 'http://localhost:' + process.env.PORT;

describe('server', function() {

	before(function(done) {
		server.listen(process.env.PORT);
		done();
	});

	after(function(done) {
		server.close();
		done();
	});

	it('should be true', function() {
		expect(true).to.be.true;
	});

	it('should return 200', function(done) {
		http.get(BASE_URL, function(res) {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});

	describe('routes', function() {

		it('GET /auth/github', function(done) {			
			http.get(BASE_URL + '/auth/github', function(res) {
				expect(res.statusCode).to.equal(302);
				done();
			});
		});

		it('GET /auth/github/callback', function(done) {
			http.get(BASE_URL + '/auth/github/callback', function(res) {
				expect(res.statusCode).to.equal(302);
				done();
			});
		});

	});

});