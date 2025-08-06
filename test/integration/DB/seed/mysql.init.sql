CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
	name VARCHAR(255) NOT NULL,
	age INT,
	is_valid BOOLEAN,
	amount BIGINT,
	birthdate DATETIME(3), -- DATETIME only does not support milliseconds
	data BLOB
);

INSERT INTO users (name) VALUES
	('John Doe'),
	('Jane Doe');
