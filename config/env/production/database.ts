export default ({ env }) => ({
	connection: {
		client: 'postgres',
		connection: {
		host: env('DATABASE_HOST', 'localhost'),
			port: env.int('DATABASE_PORT', 5432),
			database: env('DATABASE_NAME', 'take-a-seat'),
			user: env('DATABASE_USERNAME', 'take-a-seat'),
			password: env('DATABASE_PASSWORD', 'take-a-seat'),
			ssl: env.bool('DATABASE_SSL', false)
		}
	}
});
