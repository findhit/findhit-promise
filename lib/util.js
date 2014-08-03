module.exports = (function ( Promise ){
	var Util = Promise.Util = {};

	Util.getInstances = function () {
		var promises = [], forced = !! this,
			i, p;

		for( i in arguments ) {
			arg = arguments[ i ];

			if ( arg instanceof Promise ) {
				promises.push( arg );
			} else

			if ( typeof arg == 'object' ) {
				Util.getInstances( arg ).forEach(function ( arg ) {
					promises.push( arg );
				});
			}
		}

		return promises;
	};

});