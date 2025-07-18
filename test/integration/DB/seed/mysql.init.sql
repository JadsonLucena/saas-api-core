CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
	name VARCHAR(255) NOT NULL,
	age INT,
	isValid BOOLEAN,
	amount BIGINT,
	birthdate DATETIME,
	data BLOB
);

INSERT INTO users (name) VALUES
	('John Doe'),
	('Jane Doe');
