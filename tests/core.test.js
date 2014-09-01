var Promise = require('../index'),
	Util = require('findhit-util'),

	sinon = require('sinon'),
	chai = require('chai'),
	expect = chai.expect;

describe( "Promise", function () {

	describe( "core", function () {

		it( "error thrown if we dont have rejected handlers", function ( done ) {

			try{
				new Promise(function ( fulfill, reject ) {

					reject( new TypeError() );

				});
			} catch ( err ) {
				expect( err ).to.be.ok
			}

		});

	});

});