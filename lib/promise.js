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
				STOPPED: -1,
				PENDING: 0,
				FULFILLED: 1,
				REJECTED: 2,
			},
		},

		initialize: function ( fn, context ) {
			if( typeof fn !== 'function' ) throw new TypeError("fn is not a function");

			// Initialize variables
			this.state = Promise.STATE.STOPPED;
			this.handlers = [];
			this.value = undefined;

			// Set fn and context
			this.fn = fn;
			this.context = context || this;

			return this;
		},

		// TODO
		destroy: function () {},

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

		execute: function () {
			if( this.state !== Promise.STATE.STOPPED ) throw new Error("Promise isn't stopped");

			this.state = Promise.STATE.PENDING;

			// Be sure that we are always async
			process.nextTick(function () {



			}, this);

			return this;
		},
		
		// TODO
		extend: function ( a, b ) {},

		fork: function () {
			return this.forkTo( new Promise.from( null ) );
		},

		forkTo: function ( promise ) {
			if ( ! ( promise instanceof Promise ) ) throw new TypeError("promise should be instance of Promise");

			var i, handler;

			// push persistent handlers
			for( i in this.handlers ) {
				handler = this.handlers[ i ];

				if( handler.isPersistent ) {
					promise.handlers.push( handler );
				}
			}

			return promise;
		},

		// Persistent handlers populator

			catch: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				handlers.push({
					isPersistent: true,

					onRejected: onRejected,
				});

				return this;
			},

		// Non-persistent handlers populator

			done: function ( onDone ) {
				if( typeof onDone !== 'function' ) throw new TypeError("onDone is not a function");

				handlers.push({
					isPersistent: false,

					onFulfilled: function ( value ) {
						onDone( null, value );
					},

					onRejected: function ( err ) {
						onDone( err, undefined );
					}

				});

				return this.fork();
			},

			then: function ( onFulfilled, onRejected ) {
				if( ! onFulfilled && ! onRejected ) return this;

				if( onFulfilled && typeof onFulfilled !== 'function' ) throw new TypeError("onFulfilled is not a function");
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				handlers.push({
					isPersistent: false,

					onFulfilled: onFulfilled || undefined,
					onRejected: onRejected || undefined,
				});

				return this.fork();
			},

			error: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				handlers.push({
					isPersistent: false,

					onRejected: onRejected,
				});

				return this.fork();
			},

	});

	Promise.from = function ( value ) {
		new Promise(function ( fulfill ) {
			fulfill( value );
		});
	};

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

		promises.forEach(function ( promise ) {
			ready = ready.then(function () {
				return promise.execute();
			}).then(function ( value ) {
				accumulator.push(value);
			});
		});

		return ready.then(function () { return accumulator; });
	};

	Promise.seq = function ( promises ) {
		var promises = Promise.Util.getInstances.apply( true, arguments ),
			accumulator = [], ready = Promise.from(null);

		promises.forEach(function ( promise ) {
			ready = ready.then(function () {
				return promise;
			}).then(function ( value ) {
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