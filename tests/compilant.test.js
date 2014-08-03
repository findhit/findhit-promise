var Promise = require('../index');

describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha( Promise );
});