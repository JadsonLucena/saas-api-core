CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	name VARCHAR(255) NOT NULL,
	age INTEGER,
	isValid BOOLEAN,
	amount BIGINT,
	birthdate TIMESTAMP,
	data BYTEA
);

INSERT INTO users (name) VALUES
	('John Doe'),
	('Jane Doe');