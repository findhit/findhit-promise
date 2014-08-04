module.exports = (function ( Promise ){

	Promise.resolve = function ( value ) {
		return value instanceof Promise && value ||
			// Promise.Common[ value ] ||
			Promise.from( value );
	};

	Promise.resolved = function ( value ) {
		var deferred = Promise.deferred();
		return deferred.resolve( value );
	};
	Promise.rejected = function ( error ) {
		var deferred = Promise.deferred();
		return deferred.reject( error );
	};
	Promise.deferred = function () {
		var promise = new Promise(function () {});

		return {
			promise: promise,
			resolve: function ( value ) {
				return promise.fulfill( value );
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

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) { 
			values.forEach(function(value){
				Promise.resolve(value).then(resolve, reject);
			});
		});
	};

	Promise.cast = Promise.from = function ( value ) {
		return new Promise(function ( fulfill ) {
			fulfill( value );
		});
	};

});