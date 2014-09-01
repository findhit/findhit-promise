var Class = require('findhit-class'),
	Process = require('findhit-process'),
	Util = require('findhit-util');

module.exports = (function ( Promise ){

	var Handler = Promise.Handler = Class.extend({

		initialize: function ( o ) {
			o = typeof o === 'object' && o || {};

			this.onFulfilled = typeof o.onFulfilled === 'function' ? o.onFulfilled : null;
			this.onRejected = typeof o.onRejected === 'function' ? o.onRejected : null;
			this.resolve = o.resolve;
			this.reject = o.reject;

			if( Util.is.Promise( o.promise ) ) {
				this.handle( o.promise );
			}
		},

		joinToPromise: function ( promise ) {
			var i = promise.handlers.indexOf( this );

			if( i !== -1 ) {
				return false;
			}

			promise.handlers.push( this );
			return true;
		},
		removeFromPromise: function ( promise ) {
			var i = promise.handlers.indexOf( this );

			if( i === -1 ) {
				return false;
			}

			delete promise.handlers[ i ];
			return false;
		},

		handle: function ( promise ) {

			var resolve = this.resolve || promise.resolve,
				reject = this.reject || promise.reject;

			if( promise.state <= Promise.STATE.PENDING ) {
				this.joinToPromise( promise );
				return;
			}

			// It could be called from a state change, so lets remove if not persistent
			this.removeFromPromise( promise );

			Process.nextTick(function () {
				var cb = promise.state === Promise.STATE.FULFILLED ? this.onFulfilled : this.onRejected;

				if ( cb === null ) {
					( promise.state === Promise.STATE.FULFILLED ? resolve : reject )( promise.value );
					return;
				}

				var returned;

				try {
					returned = cb( promise.value );
				} catch ( error ) {
					reject( error );
					return;
				}

				resolve( returned );

			},this);

		},

		fireFulfilled: function ( promise ) {
			if( this.onFulfilled ) {
				this.onFulfilled( promise.value );
			}
		},

		fireRejected: function ( promise ) {
			if( this.onRejected ) {
				this.onRejected( promise.value );
			}
		},

	});

});