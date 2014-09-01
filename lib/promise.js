'use strict';

/**
 * To use it, you just need to import it:
 *
 * ```js
 * var Promise = require('findhit-promise');
 * ```
 *
 * Based on [PromiseA+](http://promisesaplus.com/) Standartization, but slightly modified.
 *
 * @class Promise
 */
module.exports = (function () {

	var Promise = require('./core')();

	// Extend it plus
	require('./handler')( Promise );
	require('./static.methods')( Promise );
	require('./promiseify')( Promise );
	require('./common')( Promise );
	require('./util')( Promise );

	return Promise;
})();