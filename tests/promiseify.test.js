var Promise = require('../index'),
	Util = require('findhit-util'),

	sinon = require('sinon'),
	chai = require('chai'),
	expect = chai.expect;

describe( "Promise", function () {

	describe.only( ".ify", function () {

		it( "function with second argument as a callback that returns a value", function ( done ) {

			var fn, pfn, promise;

			fn = function ( value, callback ) {
				callback( null, value );
			};

			pfn = Promise.ify({
				function: fn,
				parameters: [ 'value', 'callback' ],
			});

			promise = pfn( 'bar' );

			expect( Util.is.instanceof( Promise, promise ) ).to.be.ok;

			promise
				.then(function ( bar ) {
					expect( bar ).to.be.equal( 'bar' );
					done();
				});

		});

		it( "function by autodetecting callback parameter", function ( done ) {

			var fn, pfn, promise;

			fn = function ( value, callback ) {
				callback( null, value );
			};

			pfn = Promise.ify({
				function: fn
			});

			promise = pfn( 'bar' );

			expect( Util.is.instanceof( Promise, promise ) ).to.be.ok;

			promise
				.then(function ( bar ) {
					expect( bar ).to.be.equal( 'bar' );
					done();
				});

		});

		it( "function by autodetecting callback parameter as cb", function ( done ) {

			var fn, pfn, promise;

			fn = function ( value, cb ) {
				cb( null, value );
			};

			pfn = Promise.ify({
				function: fn,
				callbackParameter: 'cb',
			});

			promise = pfn( 'bar' );

			expect( Util.is.instanceof( Promise, promise ) ).to.be.ok;

			promise
				.then(function ( bar ) {
					expect( bar ).to.be.equal( 'bar' );
					done();
				});

		});

	});

});