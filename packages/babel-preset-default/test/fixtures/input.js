describe( 'Babel preset default', () => {
	async function* foo() {
		await 1;
		yield 2;
	}

	test( 'support for async generator functions', async () => {
		const generator = foo();

		expect( await generator.next() ).toEqual( {
			done: false,
			value: 2,
		} );
	} );

	test( 'support for optional chaining', () => {
		const obj = {
			foo: {
				bar: 42,
			},
		};

		expect( obj?.foo?.bar ).toEqual( 42 );
		expect( obj?.foo?.baz ).toEqual( undefined );
	} );
} );
