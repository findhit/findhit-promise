var Class = require('findhit-class'),
	Process = require('findhit-process');

module.exports = (function ( Promise ){

	var Handler = Promise.Handler = Class.extend({

		initialize: function ( o ) {
			o = typeof o === 'object' && o || {};

			this.persistent = !! o.persistent;

			this.onFulfilled = typeof o.onFulfilled === 'function' ? o.onFulfilled : null;
			this.onRejected = typeof o.onRejected === 'function' ? o.onRejected : null;
			this.fulfill = o.fulfill;
			this.reject = o.reject;

			if( o.promise && o.promise instanceof Promise ) {
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

			if( promise.state <= Promise.STATE.PENDING ) {
				this.joinToPromise( promise );
				return;
			}

			// If already stated, but this is persistent, add it to current promise
			// Otherwise it could be called from a state change, so lets remove if not persistent
			this[ promise.persistent && 'joinToPromise' || 'removeFromPromise' ]( promise );

			Process.nextTick(function () {
				var cb = promise.state === Promise.STATE.FULFILLED ? this.onFulfilled : this.onRejected;

				if ( cb === null ) {
					cb = ( promise.state === Promise.STATE.FULFILLED ? this.fulfill : this.reject );
					if( cb ) cb( promise.value );
					return;
				}

				var returned;

				try {
					returned = cb( promise.value );
				} catch ( error ) {
					this.reject( error );
					return;
				}

				this.fulfill( returned );

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