
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

var Promise = require('./lib/class');

// Extend it plus
require('./lib/handler')( Promise );
require('./lib/static.methods')( Promise );
require('./lib/promiseify')( Promise );
require('./lib/common')( Promise );
require('./lib/util')( Promise );

// Export it
module.exports = Promise;

// TODO: AMDify