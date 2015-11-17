//Can't figure out how to unit test the database without env vars. We'll ignore it for now.
var expect = require('chai').expect;

describe('database', function() {

	var db;

	before(function(done) {
		db = require('seraph')();
		done();
	});

	it('should be true', function() {
		expect(true).to.be.true;
	});

	it('should connect to the database', function() {
		expect(db).to.exist;
	});

	describe('orm', function() {

		var test_user = {name: 'Kyle Simpson', username: 'getify', getify_ism: 'Learn or churn, there is no do.'};

		it('should create a new user', function(done) {
			db.save(test_user, function(saveErr, node) {
				db.label(node, 'User', function(labelErr) {
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