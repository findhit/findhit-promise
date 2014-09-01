module.exports = (function ( Promise ){
	var Util = require('findhit-util');

	var defaultOptions = {

		function: false,
		context: false,
		parameters: false,

		callbackParameter: 'callback',
	};

	Promise.ify = function ( options ) {

		// Get options already defaultilized
		options = Util.extend( {}, defaultOptions,
			Util.is.Object( options ) && options ||
			Util.is.Function( options ) && { function: options } ||
			{}
		);

		if(
			Util.isnt.function( options.function )
		) {
			return false;
		}

		// Try to auto-detect parameters
		if( ! options.parameters ) {
			options.parameters = Util.function.getParamNames( options.function ) || false;
		}

		// Let's get it started - Black Eyed Peas
		return function () {
			var argsCalled = arguments;

			return new Promise(function ( fulfill, reject ) {
				// And running, running
				var argsToFunction, i, callback;

				// Preparing callback
				callback = function ( err, value ) {

					if( err ) {
						reject( err );
						return;
					}

					if( arguments.length > 2 ) {

						// Slice err from arguments and fulfill it as an array
						value = Array.prototype.slice( arguments, 1 );

					}

					fulfill( value );

				};

				// Selecting arguments
				// we have two choices here, if they were provided, and there is one called 'callback', we have to replace it,
				// otherwise we must push callback at last

					// TODO: check optional parameters by detecting brackets '[parameter]'

				if( Util.is.array( options.parameters ) ) {

					argsToFunction = Util.map( options.parameters, function ( name, i ) {

						if( name === options.callbackParameter ) {
							return callback;
						}

						return argsCalled[ i ];

					});

				} else {
					
					argsToFunction = Util.map( argsToFunction, function ( arg ) { return arg; }).push( callback );

				}

				// Run function
				options.function.apply( options.context || null, argsToFunction );

			});
		};
	};

});