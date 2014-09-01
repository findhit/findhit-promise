var Class = require('findhit-class'),
	Process = require('findhit-process'),
	Util = require('findhit-util');

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

				// Initialize variables
				this.state = Promise.STATE.INITIALIZED;
				this.handlers = [];
				this.value = fn;

				// Rebind control functions to be run always on this promise
				this.resolve = this.resolve.bind( this );
				this.fulfill = this.fulfill.bind( this );
				this.reject = this.reject.bind( this );

				// Set fn and context
				if( fn ) {
					if( typeof fn !== 'function' ) throw new TypeError("fn is not a function");

					this.fn = fn;
					this.context = context || this;

					this.run();

				}

				return this;
			},

			destroy: function () {},

		// INNER API METHODS

			resolve: function ( x ) {

				if( Util.is.Error( x ) ) {
					return this.reject( x );
				}

				// Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
				try {

					if ( x === this ) {
						throw new TypeError('A promise cannot be resolved with itself.');
					}

					if( Util.is.Promise( x ) ) {

						Promise.doResolve( x.then.bind( x ), this.resolve, this.reject );
						return this;
					}

					if( Util.is.Function( x ) ) {
						Promise.doResolve( x, this.resolve, this.reject );
						return this;
					}

					if( Util.is.Object( x ) && Util.is.Function( x.then ) ) {
						Promise.doResolve( x.then.bind( x ), this.resolve, this.reject );
						return this;
					}

					this.fulfill( x );

				} catch ( error ) {

					return this.reject( error );

				}

				return this;
			},


			fulfill: function ( result ) {
				if( this.state !== Promise.STATE.PENDING )
					return this;

				this.state = Promise.STATE.FULFILLED;
				this.value = result;

				return this.handle();
			},
			reject: function ( error ) {
				if( this.state !== Promise.STATE.PENDING )
					return this;

				this.state = Promise.STATE.REJECTED;
				this.value = error;

				// If we don't have reject handlers, we should throw this error, if it is one
				if( Util.is.Error( error ) ) {
					if(
						// If there aren't handlers with onRejected functions, lets throw it!!!
						Util.filter( this.handlers, function( handler ) { return !! handler.onRejected }).length === 0
					) {
						// Sorry
						throw error;
					}
				}

				return this.handle();
			},

			handle: function ( handler ) {
				var promise = this;

				if( Util.is.instanceof( Promise.Handler, handler ) ) {
					handler.handle( promise );
				} else {
					Util.each( this.handlers, function( handler, i ) {
						handler.handle( promise );
					});
				}

				return this;
			},

			stop: function () {
				if( this.state <= Promise.STATE.STOPPED ) throw new Error("Promise is already stopped");

				this.state = Promise.STATE.STOPPED;

				return this;
			},

			run: function () {
				if( this.state > Promise.STATE.STOPPED ) throw new Error("Promise isn't stopped");

				this.state = Promise.STATE.PENDING;

				Promise.doResolve( this.fn, this.resolve, this.reject );

				return this;
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

						Util.each( a, function ( fn, k ) {
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

						Util.each( b, function ( k, i ) {
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
					if( this[ name ] ) {
						throw Error("You could not overlap exitent functions!!");
					}

					this[ name ] = function () {
						var args = arguments;
						return this.then(function () {
							return fn.apply( context, args );
						});
					};
				},

			fork: function () {
				return this.forkTo( Promise.from( null ) );
			},

			forkTo: function ( promise ) {
				if ( Util.isnt.Promise( promise ) ) throw new TypeError("promise should be instance of Promise");

				promise.parent = this;

				return promise;
			},

		// OUTER API METHODS

			catch: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				var promise = this,
					handler = new Promise.Handler({
						onRejected: onRejected,
					});

				// Catch on entire promise chain
				while( promise ) {
					handler.handle( promise );
					promise = promise.parent;
				}

				return this;
			},

			done: function ( onFulfilled, onRejected ) {

				new Promise.Handler({

					onFulfilled: onFulfilled,
					onRejected: onRejected,

				}).handle( this );

				return this;
			},

			then: function ( onFulfilled, onRejected ) {
				var promise = this, childPromise;

				return childPromise = this.forkTo(new Promise(function ( resolve, reject ) {

					new Promise.Handler({

						onFulfilled: onFulfilled,
						onRejected: onRejected,
						resolve: resolve,
						reject: reject,

					}).handle( promise );

				}));
			},

			error: function ( onRejected ) {
				if( onRejected && typeof onRejected !== 'function' ) throw new TypeError("onFulfilled is not a function");

				new Promise.Handler({

					onRejected: onRejected,

				}).handle( this );

				return this.fork();
			},

	});

	Promise.doResolve = function ( fn, onFulfilled, onRejected ) {
		var done = false;

		try {
			fn(function (value) {
				if (done) return
				done = true
				onFulfilled(value)
			}, function (reason) {
				if (done) return
				done = true
				onRejected(reason)
			});
		} catch (ex) {
			if (done) return
			done = true
			onRejected(ex)
		}
	};

	return Promise;
});