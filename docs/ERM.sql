CREATE TYPE "otp_digest_algorithm" AS ENUM (
  'sha1',
  'sha256',
  'sha512'
);

CREATE TYPE "otp_type" AS ENUM (
  'hotp',
  'totp'
);

CREATE TYPE "http_method" AS ENUM (
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH'
);

CREATE TYPE "oauth_type" AS ENUM (
  'private',
  'public'
);

CREATE TYPE "operation_type" AS ENUM (
  'subtraction',
  'percentage'
);

CREATE TYPE "order_state" AS ENUM (
  'cancelled',
  'completed',
  'created',
  'failure',
  'refused',
  'pending',
  'autorized'
);

CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" varchar(255) NOT NULL,
  "last_name" varchar(255) NOT NULL,
  "username" varchar(255) NOT NULL,
  "password" text NOT NULL,
  "picture" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at)
);

CREATE TABLE "phone" (
  "user_id" uuid NOT NULL,
  "phone" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),
  
  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at),
  PRIMARY KEY ("user_id", "phone"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

CREATE TABLE "phone_message_provider" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "name" varchar(255) NOT NULL UNIQUE,
  "picture" text,
  "client_id" varchar(255) NOT NULL,
  "client_secret" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at)
);

CREATE TABLE "phone_message" (
  "phone_message_provider_id" int NOT NULL,
  "user_id" uuid NOT NULL,
  "phone" varchar(255) NOT NULL,
  "mfa" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at),
  PRIMARY KEY ("phone_message_provider_id", "phone"),
  FOREIGN KEY ("phone_message_provider_id") REFERENCES "phone_message_provider" ("id"),
  FOREIGN KEY ("user_id", "phone") REFERENCES "phone" ("user_id", "phone")
);

CREATE TABLE "email" (
  "user_id" uuid NOT NULL,
  "email" varchar(255) NOT NULL,
  "mfa" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at),
  PRIMARY KEY ("user_id", "email"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

CREATE TABLE "otp" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "secret" varchar(255) NOT NULL,
  "digestAlgorithm" otp_digest_algorithm NOT NULL,
  "length" int NOT NULL,
  "variation" int NOT NULL,
  "type" otp_type NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(length > 0),
  CHECK(variation >= 0),
  CHECK(disabled_at > created_at),
  UNIQUE ("secret", "digestAlgorithm", "length", "type"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

CREATE TABLE "passkey" (
  "credential_id" text PRIMARY KEY NOT NULL,
  "public_key" text NOT NULL UNIQUE,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

CREATE TABLE "identity_provider" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "name" varchar(255) NOT NULL UNIQUE,
  "picture" text NOT NULL,
  "client_id" varchar(255) NOT NULL,
  "client_secret" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at)
);

CREATE TABLE "sign_in_with" (
  "identity_provider_id" int NOT NULL,
  "user_id" uuid NOT NULL,
  "username" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "picture" text,
  "access_token" varchar(255) NOT NULL,
  "expires_in" timestamp NOT NULL,
  "refresh_token" varchar(255) NOT NULL,
  "refresh_token_expires_in" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),
  
  CHECK(expires_in > now()),
  CHECK(refresh_token_expires_in > now()),
  CHECK(disabled_at > created_at),
  UNIQUE ("identity_provider_id", "username"),
  PRIMARY KEY ("identity_provider_id", "user_id", "username"),
  FOREIGN KEY ("identity_provider_id") REFERENCES "identity_provider" ("id"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

CREATE TABLE "account" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "picture" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at)
);

CREATE TABLE "scope" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "uri" varchar(255),
  "method" http_method,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at)
);

CREATE TABLE "role" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "account_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at),
  UNIQUE ("name", "account_id", "user_id"),
  FOREIGN KEY ("account_id") REFERENCES "account" ("id"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

CREATE TABLE "acl" (
  "role_id" uuid NOT NULL,
  "scope_id" int NOT NULL,

  PRIMARY KEY ("role_id", "scope_id"),
  FOREIGN KEY ("role_id") REFERENCES "role" ("id"),
  FOREIGN KEY ("scope_id") REFERENCES "scope" ("id")
);

CREATE TABLE "member" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at),
  UNIQUE ("account_id", "user_id"),
  FOREIGN KEY ("account_id") REFERENCES "account" ("id"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
  FOREIGN KEY ("role_id") REFERENCES "role" ("id")
);

CREATE TABLE "token" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" text NOT NULL UNIQUE,
  "member_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "expires_in" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(expires_in > now()),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("member_id") REFERENCES "member" ("id"),
  FOREIGN KEY ("role_id") REFERENCES "role" ("id")
);

CREATE TABLE "oauth" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "picture" text,
  "allow_origin" text NOT NULL,
  "homepage_url" text NOT NULL,
  "privacy_policy_url" text NOT NULL,
  "terms_of_service_url" text NOT NULL,
  "redirect_url" text NOT NULL,
  "type" oauth_type NOT NULL,
  "access_token" varchar(255) NOT NULL,
  "refresh_token" varchar(255) NOT NULL,
  "member_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at),
  UNIQUE ("name", "member_id"),
  FOREIGN KEY ("member_id") REFERENCES "member" ("id"),
  FOREIGN KEY ("role_id") REFERENCES "role" ("id")
);

CREATE TABLE "oauth_access_token" (
  "token" varchar(255) PRIMARY KEY NOT NULL,
  "expires_in" timestamp NOT NULL,
  "oauth_id" uuid NOT NULL,
  "member_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(expires_in > NOW()),
  CHECK(disabled_at > created_at),
  UNIQUE ("oauth_id", "member_id"),
  FOREIGN KEY ("oauth_id") REFERENCES "oauth" ("id"),
  FOREIGN KEY ("member_id") REFERENCES "member" ("id"),
  FOREIGN KEY ("role_id") REFERENCES "role" ("id")
);

CREATE TABLE "oauth_refresh_token" (
  "token" varchar(255) PRIMARY KEY NOT NULL,
  "expires_in" timestamp NOT NULL,
  "oauth_id" uuid NOT NULL,
  "member_id" uuid NOT NULL,
  "oauth_access_token" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(expires_in > NOW()),
  CHECK(disabled_at > created_at),
  UNIQUE ("oauth_id", "member_id", "oauth_access_token"),
  FOREIGN KEY ("oauth_id") REFERENCES "oauth" ("id"),
  FOREIGN KEY ("member_id") REFERENCES "member" ("id"),
  FOREIGN KEY ("oauth_access_token") REFERENCES "oauth_access_token" ("token")
);

CREATE TABLE "customer" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "member_id" uuid NOT NULL UNIQUE,
  "tax_id" varchar(255) NOT NULL,
  "is_legal_person" boolean NOT NULL,
  "birthdate" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at),
  FOREIGN KEY ("member_id") REFERENCES "member" ("id")
);

CREATE TABLE "credit_card" (
  "customer_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "number" varchar(255) NOT NULL,
  "expires_in" timestamp NOT NULL,
  "cvv" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(expires_in > now()),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("customer_id") REFERENCES "customer" ("id")
);

CREATE TABLE "address" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "country" varchar(255) NOT NULL,
  "postal_code" varchar(255) NOT NULL,
  "state" varchar(255) NOT NULL,
  "city" varchar(255) NOT NULL,
  "street" varchar(255) NOT NULL,
  "note" text,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(disabled_at > created_at)
);

CREATE TABLE "customer_address" (
  "customer_id" uuid NOT NULL,
  "address_id" uuid NOT NULL,
  "number" varchar(255),

  FOREIGN KEY ("customer_id") REFERENCES "customer" ("id"),
  FOREIGN KEY ("address_id") REFERENCES "address" ("id")
);

CREATE TABLE "consumption" (
  "account_id" uuid NOT NULL,
  "data" text NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(amount >= 0),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("account_id") REFERENCES "account" ("id")
);

CREATE TABLE "discount" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "description" text,
  "amount" numeric(15, 2) NOT NULL,
  "type" operation_type NOT NULL,
  "quantity" int NOT NULL,
  "cumulative" boolean DEFAULT false,
  "starts_in" timestamp NOT NULL DEFAULT now(),
  "expires_in" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(amount >= 0),
  CHECK(quantity > 0),
  CHECK(expires_in > now()),
  CHECK(disabled_at > created_at)
);

CREATE TABLE "coupon" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "discount_id" uuid NOT NULL,
  "starts_in" timestamp DEFAULT now(),
  "expires_in" timestamp NOT NULL,
  "code" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(expires_in > now()),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("discount_id") REFERENCES "discount" ("id")
);

CREATE TABLE "product" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "discount_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "picture" text,
  "sku" varchar(255),
  "price" numeric(15, 2) NOT NULL,
  "quantity" int NOT NULL,
  "expires_in" timestamp NOT NULL,
  "data" text,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(price >= 0),
  CHECK(quantity > 0),
  CHECK(expires_in > now()),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("discount_id") REFERENCES "discount" ("id")
);

CREATE TABLE "order" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "coupon_id" uuid NOT NULL,
  "detail" text,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("account_id") REFERENCES "account" ("id"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
  FOREIGN KEY ("coupon_id") REFERENCES "coupon" ("id")
);

CREATE TABLE "order_status" (
  "order_id" uuid NOT NULL,
  "data" text NOT NULL,
  "token" text NOT NULL,
  "state" order_state NOT NULL,
  "created_at" timestamp DEFAULT now(),

  FOREIGN KEY ("order_id") REFERENCES "order" ("id")
);

CREATE TABLE "item" (
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "quantity" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp DEFAULT now(),

  CHECK(quantity >= 1),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("order_id") REFERENCES "order" ("id"),
  FOREIGN KEY ("product_id") REFERENCES "product" ("id")
);