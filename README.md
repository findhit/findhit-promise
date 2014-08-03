findhit-promise
===============

javascript promise built on top of findhit-class


## Instalation

```bash
npm install findhit/findhit-promise --save
```

## Usage

```js

var Promise = require('findhit-promise');

// Implementing on your async function
	
	function async( a1, b1, cb ) {
		// ...

		process.nextTick(function () {
			cb( null, a2, b2)
		})
	};

	async( a1, b1, function ( err, a2, b2 ) {
		// ...
	})

	// Will be

	function async( a1, b1 ) {

		var self = {
			abc: function () {},
			def: function () {},
			fgh: function () {},
		}

		return new Promise(function ( done ) {

			// ...
			if( somethingGoesWrong )
				// You can throw Error, Promise will catch it...
				throw new Error();
				// Or you can send it to done
				// return done( new Error () );

				// Then promise will redirect to right method

			// Otherwise
			done( a2, b2 );
		})
			// If you have more actions on the same environment
			// you can configure them to be chained to this promise by:

				// specifying function
				// .extend( name, fn, context )

				.extend( 'yey', function ( a, b ) {
					return a + b;
				}, self)

				// giving an object with some functions
				// .extend( { name: fn, ... }, context )

				.extend({
					someaction: function ( z ) {
						return new Promise(function () {
							return new Error();
						});
					},
					anotheraction: function ( a ) {
						return new Promise(function () {
							return !! a;
						});
					},
				}, self)

				// Or give an existent instance and the list of keys you want to use
				// This will run thoose functions with the first object as context
				// .extend( context, [ 'methodName', ... ] )

				.extend( self, [ 'abc', 'def' ] )

				.ready()
	};

	// You can:

		// Receive error on a separate function
			
			async( a1, b1 )
				.then(function ( a2, b2 ) {
					// ...
				})
				.error(function ( err ){
					// ...
				})

			// or

			async( a1, b1 )
				.then(function ( a2, b2 ) {
					// ...
				}, function ( err ){
					// ...
				})

		// Always receive err
			
			async( a1, b1 )
				.done(function ( err, a2, b2 ) {
					// ...
				})

		// Chain multiple thens

			async( a1, b1 )
				.then(function ( a2, b2 ) {
					return async( a2, b2 );
				})
				.then(function ( a3, b3 ) {
					return a3 + b3;
				})
				.then(function ( z ) {
					return z;
				})

		// Chain multiple actions

			Promise.all(
			
				async( a1, b1 ),
				async( a2, b2 ),
				async( a3, b3 )
			
			).then(function ( arrayOfResults ) {
				// ...
			})

			Promise.all([
			
				async( a1, b1 ),
				async( a2, b2 ),
				async( a3, b3 ),

			]).then(function ( arrayOfResults ) {
				// ...
			})

		// Or if they provide some action context

			async( a1, b1 ).
			async( a2, b2 ).
			async( a3, b3 ).
				then(function ( arrayOfResults ) {
					// ...
				})


		// since .error catches current promise error, you can also configure a catch all errors
			async( a1, b1 )
				.catch(function ( err ) {
					// ...
				})

```

## Thanks

Huge thanks to [Forbes Lindesay](https://www.promisejs.org/).