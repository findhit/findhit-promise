var Class = require('findhit-class');

module.exports = (function ( Promise ){

	var Handler = Promise.Handler = Class.extend({

		initialize: function ( persistent, onFulfilled, onRejected, resolve, reject ) {
			this.persistent = !! persistent;

			this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
			this.onRejected = typeof onRejected === 'function' ? onRejected : null;
			this.resolve = resolve;
			this.reject = reject;
		},

		destroy: function () {
			delete this.onFulfilled;
			delete this.onRejected;
			delete this.resolve;
			delete this.reject;
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