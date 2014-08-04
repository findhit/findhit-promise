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

				var i;

				this.state = Promise.STATE.FULFILLED;
				this.value = result;

				// Call handlers
				for( i in this.handlers[i] ) {
					this.handlers[i].fireFulfilled( this );

					if( ! this.handlers[i].persistent ) {
						this.handlers[i].destroy();
						delete this.handlers[i];
					}
				}

				return this;
			},
			reject: function ( error ) {
				if( this.state === Promise.STATE.STOPPED || this.state >= Promise.STATE.FULFILLED )
					return false;

				var i;

				this.state = Promise.STATE.REJECTED;
				this.value = error instanceof Error && error || typeof error === 'string' && new Error( error ) || new Error();

				// Call handlers
				for( i in this.handlers[i] ) {
					this.handlers[i].fireRejected( this );

					if( ! this.handlers[i].persistent ) {
						this.handlers[i].destroy();
						delete this.handlers[i];
					}
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

				var promise = this,
					fulfill = function ( value ) {
						if( value instanceof Error ) {
							return promise.reject( value );
						}

						promise.fulfill( value );
					},
					reject = function ( err ) {
						promise.reject( err );
					};

				// Be sure that we are always async
				Process.nextTick(function () {

					this.fn.call(
						this.context || this,
						fulfill,
						reject
					)

				}, this);

				return this;
			},

			resolve: function ( x ) {
				if( this === x ) {
					throw new TypeError("We can't resolve promise with the same promise");
				}

				if( x instanceof Promise ) {

				}
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

				handlers.push({
					isPersistent: true,

					onRejected: onRejected,
				});

				return this;
			},

			done: function ( onFulfilled, onRejected ) {
				if( onFulfilled || onRejected ) {

					this.handlers.push(
						new Promise.Handler( false, onFulfilled, onRejected )
					);

				}

				return this;
			},

			then: function ( onFulfilled, onRejected ) {
				return this.done( onFulfilled, onRejected ).fork();
			},

			error: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				this.handlers.push(
					new Promise.Handler( false, undefined, onRejected )
				);

				return this.fork();
			},

	});

	return Promise;
});