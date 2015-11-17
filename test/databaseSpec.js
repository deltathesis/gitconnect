require('dotenv').load(); //load environmental variables

var expect = require('chai').expect;
var db = require('../server/db/models/user').db;
var User = require('../server/db/models/user').User;

describe('database', function() {

	it('should be true', function() {
		expect(true).to.be.true;
	});

	it('should connect to the database', function() {
		expect(db).to.exist;
	});

	describe('orm', function() { //eventually this should use 'User' but right now it relies on a request from GitHub.

		var test_user = {name: 'Kyle Simpson', username: 'getify', getify_ism: 'Learn or churn, there is no do.'};

		it('should create a new user', function(done) {
			db.save(test_user, function(saveErr, node) {
				db.label(node, 'USER', function(labelErr) {
					expect(saveErr).to.not.exist;
					expect(labelErr).to.not.exist;
					done();
				});
			});
		});

		it('should remove a user', function(done) {
			db.find(test_user, function(err, objs) {
				expect(err).to.not.exist;
				expect(objs).to.have.length(1);
				db.delete(objs[0], function(err) {
					expect(err).to.not.exist;
					done();
				});
			});
		});

	});

});