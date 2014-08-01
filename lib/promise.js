'use strict';

var Class = require('findhit-class'),
	process = require('findhit-process');

/**
 * To use it, you just need to import it:
 *
 * ```js
 * var Promise = require('findhit-promise');
 * ```
 *
 * Based on [PromiseA+](http://promisesaplus.com/) Standartization, but slightly modified.
 *
 * @class Promise
 */
module.export = (function () {

	var Promise = Class.extend({

		statics: {
			STATE: {
				PENDING: 0,
				FULFILLED: 1,
				REJECTED: 2,
			},
		},

		initialize: function ( fn, context ) {
			if( typeof fn !== 'function' ) throw new TypeError("fn is not a function");

			// Initialize variables
			this.state = Promise.STATE.PENDING;
			this.handlers = [];
			this.value = undefined;

			// Set fn and context
			this.fn = fn;
			this.context = context || this;

			return this;
		},

		destroy: function () {

		},

		fulfill: function ( result ) {
			this.state = Promise.STATE.FULFILLED;
			this.value = result;

			return this;
		},
		reject: function ( error ) {
			this.state = Promise.STATE.REJECTED;
			this.value = error;

			return this;
		},

		run: function () {
			process.nextTick(function () { // Be sure that we are always async

				

			}, this);

			return this;
		},

		/* Callable by implemented side */
		
		extend: function ( a, b ) {

		},

		/* Callable by usable side */
		catch: function () {},

		done: function ( onDone ) {
			if( typeof onDone !== 'function' ) throw new TypeError("onDone is not a function");

			handlers.push({

				onFulfilled: function ( value ) {
					onDone( null, value );
				},

				onRejected: function ( err ) {
					onDone( err, undefined );
				}

			});

			return this;
		},
		then: function ( onFulfilled, onRejected ) {
			if( ! onFulfilled && ! onRejected ) return this;

			if( onFulfilled && typeof onFulfilled !== 'function' ) throw new TypeError("onFulfilled is not a function");
			if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

			handlers.push({
				onFulfilled: onFulfilled || undefined,
				onRejected: onRejected || undefined,
			});

			return this;
		},
		error: function ( onRejected ) {
			if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

			handlers.push({
				onRejected: onRejected,
			});

			return this;
		},

	});

	Promise.resolve = function ( value ) {
		return value instanceof Promise ?
			value :
			new Promise(function ( fulfill ) {
				fulfill( value );
			});
	};

	Promise.reject = function ( error ) {
		return new Promise(function ( fulfill, reject ) {
			reject(
				error instanceof Error && error ||
				typeof error === 'string' && new Error( error ) ||
				new Error()
			);
		});
	};

	Promise.all = function ( promises ) {
		var promises = Promise.Util.getInstances.apply( true, arguments ),
			accumulator = [], ready = Promise.from(null);

		promises.forEach(function (promise) {
			ready = ready.then(function () {
				return promise;
			}).then(function (value) {
				accumulator.push(value);
			});
		});

		return ready.then(function () { return accumulator; });
	};

	Promise.seq = function ( promises ) {
		var promises = Promise.Util.getInstances.apply( true, arguments ),
			accumulator = [], ready = Promise.from(null);

		promises.forEach(function (promise) {
			ready = ready.then(function () {
				return promise;
			}).then(function (value) {
				accumulator.push(value);
			});
		});

		return ready.then(function () { return accumulator; });
	};

	// Utils
	Promise.Util = {};

	Promise.Util.getInstances = function () {
		var promises = [], forced = !! this,
			i, p;

		for( i in arguments ) {
			arg = arguments[ i ];

			if ( arg instanceof Promise ) {
				promises.push( arg );
			} else

			if ( typeof arg == 'object' ) {
				Promise.Util.getInstances( arg ).forEach(function ( arg ) {
					promises.push( arg );
				});
			}
		}

		return promises;
	};

	return Promise;
});