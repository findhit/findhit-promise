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
			STATUS: {
				PENDING: 0,
				FULFILLED: 1,
				REJECTED: -1,
			},
		},

		initialize: function ( fn, context ) {
			if( typeof fn !== 'function' ) {
				return false;
			}

			var self = this,
				fulfill = function ( a ) {
					if( a instanceof Error ) {
						return reject( a );
					}
				},
				reject = function ( err ) {
					;
				};

			// Initialize variables
			this.onFulfilled =
			this.onRejected =

			this.value =
			this.reason =

				undefined;

			// Set fn and context
			this.fn = fn;
			this.context = context;

			// Run promise
			process.nextTick(function () {
				try {
					fn.apply( context || this, fulfill, reject );
				} catch ( err ) {
					this.throw( err );
				};
			}, this);

			return this;
		},

		destroy: function () {

		},

		/* Internal mehtods */

		forkToPromise: function ( promise ) {
			this.destroy();
		},

		/* Callable by implemented side */
		
		extend: function () {},

		/* Callable by usable side */

		then: function () {},
		done: function () {},
		catch: function () {},

	});

	Promise.all = function ( promises ) {

		var accumulator = [];
		var ready = Promise.from(null);

		promises.forEach(function (promise) {
			ready = ready.then(function () {
				return promise;
			}).then(function (value) {
				accumulator.push(value);
			});
		});

		return ready.then(function () { return accumulator; });

	};

	return Promise;
});