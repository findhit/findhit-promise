module.exports = (function ( Promise ){

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
	}

	Promise.resolve = function ( value ) {
		return value instanceof Promise && value ||
			// Promise.Common[ value ] ||
			Promise.from( value );
	};


	Promise.deferred = function () {
		var promise = Promise.pending();

		return {
			promise: promise,
			resolve: promise.resolve,
			reject: promise.reject,
		};
	};

	Promise.resolved = function ( value ) {
		return Promise.pending().resolve( value );
	};
	Promise.rejected = function ( error ) {
		return Promise.pending().reject( error );
	};

	Promise.pending = function () {
		var promise = new Promise();

		// Don't run the function, set promise already as pending!
		promise.state = Promise.STATE.PENDING;

		return promise;
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

});