CREATE DATABASE test;
GO

USE test;
GO

CREATE TABLE users (
	id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
	name NVARCHAR(255) NOT NULL,
	age INT,
	isValid BIT,
	amount BIGINT,
	birthdate DATETIME2,
	data VARBINARY(MAX)
);

INSERT INTO users (name) VALUES 
	('John Doe'),
	('Jane Doe');