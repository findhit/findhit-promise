var Class = require('findhit-class'),
	Process = require('findhit-process'),

	_ = require('underscore');

module.exports = (function (){
	var Promise = Class.extend({

		// STATICS

		statics: {

			// STATIC VARS

				STATE: {
					INITIALIZED: -2,
					STOPPED: -1,
					PENDING: 0,
					FULFILLED: 1,
					REJECTED: 2,
				},

		},

		// INITIALIZE AND DESTROY METHODS

			initialize: function ( fn, context ) {
				if( typeof fn !== 'function' ) throw new TypeError("fn is not a function");

				// Initialize variables
				this.state = Promise.STATE.INITIALIZED;
				this.handlers = [];
				this.value = fn;

				// Set fn and context
				this.fn = fn;
				this.context = context || this;

				// Controled running
				Process.nextTick(function () {

					if( this.state === Promise.STATE.INITIALIZED )
						this.run();

				}, this);

				return this;
			},

			destroy: function () {},

		// INNER API METHODS

			fulfill: function ( result ) {
				if( this.state === Promise.STATE.STOPPED || this.state >= Promise.STATE.FULFILLED )
					return false;

				this.state = Promise.STATE.FULFILLED;
				this.value = result;

				return this.handle();
			},
			reject: function ( error ) {
				if( this.state === Promise.STATE.STOPPED || this.state >= Promise.STATE.FULFILLED )
					return false;

				this.state = Promise.STATE.REJECTED;
				this.value = error instanceof Error && error || typeof error === 'string' && new Error( error ) || new Error();

				return this.handle();
			},

			handle: function ( handler ) {
				var promise = this;

				if( handler instanceof Promise.Handler ) {
					handler.handle( promise );
				} else {
					this.handlers.forEach(function( handler, i ) {
						handler.handle( promise );
					});
				}

				return this;
			},

			stop: function () {
				if( this.state <= Promise.STATE.STOPPED ) throw new Error("Promise is already stopped");

				this.state = Promise.STATE.STOPPED;
			},

			run: function () {
				if( this.state > Promise.STATE.STOPPED ) throw new Error("Promise isn't stopped");

				this.state = Promise.STATE.PENDING;

				return this.doResolve();
			},

			resolve: function ( x ) {
				if( x === this ) {
					throw new TypeError("We can't resolve promise with the same promise");
				}

				// Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
				if( x instanceof Error ) {
					this.reject( x );
					return;
				}

				try {

					if ( x === this ) {
						throw new TypeError('A promise cannot be resolved with itself.');
					}

					if( typeof x === 'function' ) {
						promise.doResolve( x.bind( this ), resolve, reject );
						return;
					}

					this.fulfill( x );

				} catch ( error ) {

					this.reject( error );

				}

			},

			doResolve: function ( fn ) {
				fn = typeof fn === 'function' && fn || this.fn;

				// Be sure that we are always async
				Process.nextTick(function () {

					this.fn.call(
						this.context || this,
						this.resolve.bind( this ),
						this.resolve.bind( this )
					);

				}, this);
			},

			extend: function ( a, b, c ) {
				var i, context,
					methods = {},
					al = arguments.length;

				// API cases detection

					// .extend( name, fn, context )
					if(
						( al === 2 || al === 3 ) &&
						a && typeof a === 'string' &&
						b && typeof b === 'function'
					) {

						methods[ a ] = b;
						context = c;

					} else

					// .extend( { name: fn, ... }, context )
					if(
						( al === 1 || al === 2 ) &&
						a && typeof a === 'object'
					) {

						context = b;

						_.forEach( a, function ( fn, k ) {
							if( typeof fn == 'function' ) {
								methods[ k ] = fn;
							} else {
								throw new TypeError("Only functions are allowed as method");
							}
						});

					} else

					// .extend( context, [ 'methodName', ... ] )
					if(
						al === 2 &&
						a && typeof a === 'object' &&
						b && typeof b === 'object'
					) {

						context = a;

						_.forEach( b, function ( k, i ) {
							if( typeof a[ k ] == 'function' ) {
								methods[ k ] = a[ k ];
							} else {
								throw new TypeError("Only functions are allowed as method");
							}
						});

					} else

						throw new TypeError("You didn't follow API allowed cases");

				// Instance methods extending

					for( i in methods ) {
						this._proxyMethod( i, methods[ i ], context || this );
					}

				return this;
			},
				_proxyMethod: function ( name, fn, context ) {
					this[ name ] = function () {
						var args = arguments;
						return this.then(function () {
							return fn.apply( context, args );
						});
					};
				},

			fork: function () {
				return this.forkTo(
					new Promise(
						function () {}
					)
				);
			},

			forkTo: function ( promise ) {
				if ( ! ( promise instanceof Promise ) ) throw new TypeError("promise should be instance of Promise");

				var i, handler;

				// push persistent handlers
				for( i in this.handlers ) {
					handler = this.handlers[ i ];

					if( handler.persistent ) {
						promise.handlers.push( handler );
					}
				}

				return promise;
			},

		// OUTER API METHODS

			catch: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				new Promise.Handler({

					persistent: true,
					onRejected: onRejected,

				}).handle( this );

				return this;
			},

			done: function ( onFulfilled, onRejected ) {

				new Promise.Handler({

					persistent: false,

					onFulfilled: onFulfilled,
					onRejected: onRejected,

				}).handle( this );

				return this;
			},

			then: function ( onFulfilled, onRejected ) {
				var promise = this;

				return this.forkTo(new Promise(function ( fulfill, reject ) {

					new Promise.Handler({
						
						persistent: false,

						onFulfilled: onFulfilled,
						onRejected: onRejected,
						fulfill: fulfill,
						reject: reject,

					}).handle( promise );

				}));
			},

			error: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				new Promise.Handler({
					
					persistent: false,

					onRejected: onRejected,

				}).handle( this );

				return this.fork();
			},

	});

	return Promise;
});