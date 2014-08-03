module.exports = (function ( Promise ){

	Promise.resolved = function ( value ) {
		return value instanceof Promise ?
			value :
			new Promise(function ( fulfill ) {
				fulfill( value );
			});
	};

	Promise.rejected = function ( error ) {
		return new Promise(function ( fulfill, reject ) {
			reject(
				error instanceof Error && error ||
				typeof error === 'string' && new Error( error ) ||
				new Error()
			);
		});
	};

	Promise.deferred = function () {
		var promise = new Promise(function () {});

		return {
			promise: promise,
			resolve: function ( value ) {
				return promise.resolve( value );
			},
			reject: function ( error ) {
				return promise.reject( error );
			},
		};
	};

	Promise.all = function ( promises ) {
		var promises = Promise.Util.getInstances.apply( true, arguments ),
			accumulator = [], ready = Promise.from( null );

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
			accumulator = [], ready = Promise.from( null );

		promises.forEach(function ( promise ) {
			ready = ready.then(function () {
				return promise;
			}).then(function ( value ) {
				accumulator.push(value);
			});
		});

		return ready.then(function () { return accumulator; });
	};

	Promise.from = function ( value ) {
		return new Promise(function ( fulfill ) {
			fulfill( value );
		});
	};

});