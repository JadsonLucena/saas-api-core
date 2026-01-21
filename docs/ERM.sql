CREATE SCHEMA IF NOT EXISTS IAM;
CREATE SCHEMA IF NOT EXISTS ecommerce;

CREATE TYPE IAM."consent_channel" AS ENUM (
  'EMAIL',
  'SMS',
  'PHONE_MESSAGE',
  'PUSH_NOTIFICATION'
);

CREATE TYPE IAM."otp_digest_algorithm" AS ENUM (
  'SHA1',
  'SHA256',
  'SHA512'
);

CREATE TYPE IAM."otp_type" AS ENUM (
  'HOTP',
  'TOTP'
);

CREATE TYPE IAM."http_method" AS ENUM (
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

CREATE TYPE IAM."oauth_type" AS ENUM (
  'PRIVATE',
  'PUBLIC'
);

CREATE TYPE ecommerce."operation_type" AS ENUM (
  'SUBTRACTION',
  'PERCENTAGE'
);

CREATE TYPE ecommerce."card_brand" AS ENUM (
  'AMEX',
  'HIPERCARD',
  'DINERS',
  'VISA',
  'MASTERCARD', 
  'AMERICAN_EXPRESS',
  'DISCOVER',
  'ELO',
  'MAESTRO'
);

CREATE TYPE ecommerce."currency" AS ENUM(
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ANG',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BOV',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYR',
  'BZD',
  'CAD',
  'CDF',
  'CHE',
  'CHF',
  'CHW',
  'CLF',
  'CLP',
  'CNY',
  'COP',
  'COU',
  'CRC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'ECS',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GEL',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'IMP',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KPW',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LTL',
  'LVL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRO',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MXV',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLL',
  'SOS',
  'SRD',
  'STN',
  'SVC',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'USN',
  'USS',
  'UYI',
  'UYU',
  'UZS',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XAG',
  'XAU',
  'XBA',
  'XBB',
  'XBC',
  'XBD',
  'XCD',
  'XDR',
  'XFU',
  'XOF',
  'XPD',
  'XPF',
  'XPT',
  'XTS',
  'XXX',
  'YER',
  'ZAR',
  'ZMW',
  'ZWL'
);

CREATE TYPE ecommerce."product_type" AS ENUM (
  'SIMPLE',
  'GROUPED',
  'VIRTUAL',
  'DOWNLOADABLE',
  'EXTERNAL',
  'VARIABLE',
  'CREDIT'
);

CREATE TYPE ecommerce."payment_method_type" AS ENUM (
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_ACCOUNT'
);

CREATE TYPE ecommerce."split_type" AS ENUM (
  'FIXED',
  'PERCENTAGE'
);

CREATE TYPE ecommerce."payment_status" AS ENUM (
  'CREATED',
  'PAID',
  'EXPIRED',
  'FAILED',
  'FRAUD_DETECTED',
  'FRAUD_UNDER_REVIEW',
  'FRAUD_CONFIRMED'
);

CREATE TYPE ecommerce."dispute_status" AS ENUM (
  'OPEN',
  'UNDER_REVIEW',
  'WON',
  'LOST',
  'CANCELLED'
);

CREATE TYPE ecommerce."discount_rule_type" AS ENUM (
  'PAYMENT_METHOD',
  'FIRST_PURCHASE',
  'MIN_ITEMS',
  'MIN_AMOUNT',
  'MAX_ITEMS',
  'MAX_AMOUNT',
  'PRODUCT_INCLUDED',
  'PRODUCT_EXCLUDED',
  'PRODUCT_CATEGORY',
  'DATE_RANGE',
  'CUSTOMER_SEGMENT',
  'CUSTOMER_SINCE',
  'CURRENCY',
  'COUNTRY',
  'INSTALLMENT_COUNT',
  'DAY_OF_WEEK',
  'TIME_OF_DAY',
  'CUSTOM_EXPRESSION'
);

CREATE TYPE ecommerce."invoice_type" AS ENUM (
  -- 'ADJUSTMENT',
  'ONE_TIME',
  'SUBSCRIPTION_CYCLE'
);

CREATE TYPE ecommerce."invoice_adjustment_type" AS ENUM (
  'ADJUSTMENT',
  'DISCOUNT',
  'FEE',
  'OTHER',
  'WRITE_OFF'
);

CREATE TYPE ecommerce."payment_gateway_webhook_event_status" AS ENUM (
  'CREATED',
  'PROCESSED',
  'FAILED'
);

--------------------------------------------------

CREATE TABLE IAM."user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" varchar(255) NOT NULL,
  "last_name" varchar(255) NOT NULL,
  "username" varchar(255) NOT NULL UNIQUE,
  "picture" text,
  "totp_secret" TEXT NOT NULL,
  "mfa_enabled" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."user_consent_event" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "channel" IAM."consent_channel" NOT NULL,
  "accepted" boolean NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX ON IAM."user_consent_event" ("user_id", "purpose", "channel", "event_at" DESC);


CREATE TABLE IAM."password" (
  "user_id" uuid NOT NULL,
  "hash" text NOT NULL,
  "algorithm" varchar(255) NOT NULL,
  "iterations" int NOT NULL,
  "salt" text NOT NULL,
  "secret_manager_version" VARCHAR(255),
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  PRIMARY KEY ("user_id", "hash", "algorithm", "iterations", "salt", "secret_manager_version"),

  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."phone" (
  "user_id" uuid NOT NULL,
  "number" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp,
  "disabled_at" timestamp,

  PRIMARY KEY ("user_id", "number"),

  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."phone_message_provider" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "name" varchar(255) NOT NULL UNIQUE,
  "picture" text,
  "client_id" varchar(255) NOT NULL, -- external vendor credentials
  "client_secret" varchar(255) NOT NULL, -- external vendor credentials
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."phone_messager" (
  "phone_message_provider_id" int NOT NULL,
  "user_id" uuid NOT NULL,
  "phone" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  PRIMARY KEY ("phone_message_provider_id", "user_id", "phone"),

  FOREIGN KEY ("phone_message_provider_id") REFERENCES IAM."phone_message_provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("user_id", "phone") REFERENCES IAM."phone" ("user_id", "number") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."email" (
  "user_id" uuid NOT NULL,
  "address" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp,
  "disabled_at" timestamp,

  PRIMARY KEY ("user_id", "address"),

  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."otp" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "secret" varchar(255) NOT NULL,
  "digestAlgorithm" IAM.otp_digest_algorithm NOT NULL,
  "length" int NOT NULL,
  "variation" int NOT NULL,
  "type" IAM.otp_type NOT NULL,
  "user_id" uuid NOT NULL,
  "confirmed_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("secret", "digestAlgorithm", "length", "type"),

  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(length > 0),
  CHECK(variation >= 0),
  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."passkey" (
  "credential_id" text NOT NULL, -- external vendor credentials
  "public_key" text NOT NULL UNIQUE, -- external vendor credentials
  "device_name" varchar(255) NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  PRIMARY KEY ("user_id", "device_name"),

  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."identity_provider" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "name" varchar(255) NOT NULL UNIQUE,
  "picture" text NOT NULL,
  "client_id" varchar(255) NOT NULL, -- external vendor credentials
  "client_secret" varchar(255) NOT NULL, -- external vendor credentials
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."sign_in_with" (
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
  "disabled_at" timestamp,

  PRIMARY KEY ("identity_provider_id", "user_id", "username"),
  UNIQUE ("identity_provider_id", "username"),

  FOREIGN KEY ("identity_provider_id") REFERENCES IAM."identity_provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(expires_in > created_at),
  CHECK(refresh_token_expires_in > created_at),
  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."account" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "picture" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,
  "deleted_at" timestamp,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at),
  CHECK(deleted_at > created_at)
);

CREATE TABLE IAM."scope" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "label" VARCHAR(255) NOT NULL UNIQUE,
  "uri" varchar(255),
  "method" IAM.http_method,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("uri", "method"),

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."role" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "title" varchar(255) NOT NULL,
  "description" text,
  "account_id" uuid NOT NULL,
  "user_id" uuid, -- the creator
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("title", "account_id"),

  FOREIGN KEY ("account_id") REFERENCES IAM."account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."role_acl" (
  "role_id" int NOT NULL,
  "scope_id" int NOT NULL,
  "created_at" timestamp DEFAULT now(),

  PRIMARY KEY ("role_id", "scope_id"),

  FOREIGN KEY ("role_id") REFERENCES IAM."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("scope_id") REFERENCES IAM."scope" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IAM."member" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role_id" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "confirmed_at" timestamp,
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("account_id", "user_id"),

  FOREIGN KEY ("account_id") REFERENCES IAM."account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES IAM."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("role_id") REFERENCES IAM."role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(confirmed_at > created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."api_token" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" text NOT NULL UNIQUE,
  "member_id" uuid NOT NULL,
  "role_id" int NOT NULL,
  "starts_in" timestamp NOT NULL,
  "expires_in" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("member_id") REFERENCES IAM."member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("role_id") REFERENCES IAM."role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(starts_in >= created_at),
  CHECK(expires_in > starts_in),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."oauth" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "picture" text,
  "homepage_url" text NOT NULL,
  "privacy_policy_url" text NOT NULL,
  "terms_of_service_url" text NOT NULL,
  "redirect_url" text NOT NULL,
  "type" IAM.oauth_type NOT NULL,
  "member_id" uuid NOT NULL,
  "role_id" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("name", "member_id"),

  FOREIGN KEY ("member_id") REFERENCES IAM."member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("role_id") REFERENCES IAM."role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."oauth_access_token" (
  "token" varchar(255) PRIMARY KEY NOT NULL,
  "oauth_id" uuid NOT NULL UNIQUE,
  "expires_in" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("oauth_id") REFERENCES IAM."oauth" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(expires_in > created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE IAM."oauth_refresh_token" (
  "token" varchar(255) PRIMARY KEY NOT NULL,
  "oauth_id" uuid NOT NULL UNIQUE,
  "expires_in" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("oauth_id") REFERENCES IAM."oauth" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(expires_in > created_at),
  CHECK(disabled_at > created_at)
);

--------------------------------------------------

CREATE TABLE ecommerce."address" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "country" varchar(255) NOT NULL,
  "postal_code" varchar(255) NOT NULL,
  "region" varchar(255) NOT NULL,
  "city" varchar(255) NOT NULL,
  "locality" varchar(255) NOT NULL,
  "street" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."customer" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "tax_id" varchar(255) NOT NULL,
  "is_legal_person" boolean NOT NULL,
  "default_customer_address_id" int,
  "default_payment_method_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("account_id", "tax_id"),

  FOREIGN KEY ("account_id") REFERENCES IAM."account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."customer_address" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "customer_id" uuid NOT NULL,
  "address_id" int NOT NULL,
  "number" varchar(255) NOT NULL,
  "note" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("customer_id", "address_id", "number"),

  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("address_id") REFERENCES ecommerce."address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

ALTER TABLE ecommerce."customer" 
  ADD CONSTRAINT fk_customer_default_customer_address 
    FOREIGN KEY ("default_customer_address_id") REFERENCES ecommerce."customer_address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE ecommerce."payment_gateway" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "picture" TEXT NOT NULL,
  "endpoint" VARCHAR(255) NOT NULL,
  "client_id" VARCHAR(255) NOT NULL,
  "client_secret" TEXT NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp	
);

CREATE TABLE ecommerce."credit_card" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL,
  "payment_gateway_id" uuid NOT NULL,
  "fingerprint" VARCHAR(128),
  "token" text NOT NULL,
  "network_token" VARCHAR(256),
  "brand" ecommerce.card_brand NOT NULL,
  "last_four_digits" varchar(4) NOT NULL,
  "holder_name" varchar(255) NOT NULL,
  "expiration_month" int NOT NULL,
  "expiration_year" int NOT NULL,
  "is_ephemeral" boolean NOT NULL DEFAULT false,
  "expires_in" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("customer_id", "payment_gateway_id", "fingerprint"),

  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("payment_gateway_id") REFERENCES ecommerce."payment_gateway" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(expiration_month BETWEEN 1 AND 12),
  CHECK(expiration_year >= EXTRACT(YEAR FROM now())),
  CHECK(expires_in > created_at),
  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."discount" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "title" varchar(255) NOT NULL,
  "description" text,
  "percent" DECIMAL(10,2),
  "cap_amount" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "is_cumulative" boolean DEFAULT false,
  "quantity" int NOT NULL,
  "max_use_per_order" int, -- maximum number of uses in cycles per order/subscription
  "max_use_per_customer" int,
  "starts_in" timestamp NOT NULL DEFAULT now(),
  "expires_in" timestamp,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(percent >= 0 AND percent <= 1),
  CHECK(cap_amount >= 0),
  CHECK(quantity >= 1),
  CHECK(max_use_per_order >= 1),
  CHECK(max_use_per_customer >= 1),
  CHECK(starts_in >= created_at),
  CHECK(expires_in > starts_in),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."discount_rule" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "discount_id" int NOT NULL,
  "type" ecommerce.discount_rule_type NOT NULL,
  "value" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("discount_id") REFERENCES ecommerce."discount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."coupon" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "discount_id" int NOT NULL,
  "code" varchar(255) NOT NULL UNIQUE,

  FOREIGN KEY ("discount_id") REFERENCES ecommerce."discount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE ecommerce."product" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(255) NOT NULL,
  "description" text,
  "picture" text,
  "type" ecommerce.product_type NOT NULL,
  "sku" varchar(255) UNIQUE,
  "quantity" int,
  "renewal_period_in_days" int NOT NULL DEFAULT 0, -- is subscription if greater than 0
  "max_renewal_use" int NOT NULL DEFAULT 1, -- maximum number of renewals
  "cancellation_window_in_days" int NOT NULL DEFAULT 0,
  "data" text,
  "starts_in" timestamp NOT NULL DEFAULT now(),
  "expires_in" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(quantity >= 1),
  CHECK(renewal_period_in_days >= 0),
  CHECK(max_renewal_use >= 1),
  CHECK(cancellation_window_in_days >= 0),
  CHECK(starts_in >= created_at),
  CHECK(expires_in > starts_in),
  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."price" (
  "id" int PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "product_id" uuid NOT NULL,
  "amount" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "created_at" timestamp DEFAULT now(),

  FOREIGN KEY ("product_id") REFERENCES ecommerce."product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(amount >= 0)
);

CREATE TABLE ecommerce."product_discount" (
  "product_id" uuid NOT NULL,
  "discount_id" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  PRIMARY KEY ("product_id", "discount_id"),

  FOREIGN KEY ("product_id") REFERENCES ecommerce."product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("discount_id") REFERENCES ecommerce."discount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."product_permission" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "title" varchar(255) NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."product_permission_acl" (
  "product_permission_id" int NOT NULL,
  "scope_id" int NOT NULL,
  "created_at" timestamp DEFAULT now(),

  PRIMARY KEY ("product_permission_id", "scope_id"),

  FOREIGN KEY ("product_permission_id") REFERENCES ecommerce."product_permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("scope_id") REFERENCES IAM."scope" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE ecommerce."product_permission_bundle" (
  product_id  int NOT NULL,
  product_permission_id   uuid NOT NULL,
  created_at  timestamp NOT NULL DEFAULT now(),

  PRIMARY KEY (product_id, product_permission_id),

  FOREIGN KEY (product_id) REFERENCES ecommerce."product"(id) ON DELETE CASCADE,
  FOREIGN KEY (product_permission_id)  REFERENCES ecommerce."product_permission"(id) ON DELETE RESTRICT
);

CREATE TABLE ecommerce."split" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "assume_fee" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("account_id", "title"),

  FOREIGN KEY ("account_id") REFERENCES IAM."account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ecommerce."split_receiver" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "split_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "type" ecommerce.split_type NOT NULL,
  "value" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "note" TEXT,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("split_id") REFERENCES ecommerce."split" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(
    (type = 'PERCENTAGE' AND value BETWEEN 0 AND 1)
    OR
    (type = 'FIXED' AND value >= 0)
  )
);

-- [TODO] deve mudar, pq será um crédito no extrato da wallet do customer
CREATE TABLE ecommerce."voucher" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "discount_id" int NOT NULL,
  "customer_id" uuid NOT NULL,
  "code" varchar(255) NOT NULL UNIQUE,

  FOREIGN KEY ("discount_id") REFERENCES ecommerce."discount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ecommerce."invoice" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- "order_id" uuid,
  -- "amount" INT NOT NULL,
  -- "tax_amount" INT NOT NULL,
  -- "shipping_amount" INT NOT NULL DEFAULT 0,
  "type" ecommerce.invoice_type NOT NULL,
  "note" text,
  "parent_invoice_id" uuid, -- Used by up-selling
  "starts_in" timestamp NOT NULL,
  "expires_in" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),

  -- FOREIGN KEY ("order_id") REFERENCES ecommerce."order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("parent_invoice_id") REFERENCES ecommerce."invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(starts_in >= created_at),
  CHECK(expires_in > starts_in)
);

CREATE TABLE ecommerce."order" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL,
  "coupon_id" uuid,
  "voucher_id" uuid UNIQUE,
  "split_id" uuid,
  "invoice_id" uuid NOT NULL UNIQUE,
  "note" text,
  "created_at" timestamp DEFAULT now(),

  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("coupon_id") REFERENCES ecommerce."coupon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("voucher_id") REFERENCES ecommerce."voucher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("split_id") REFERENCES ecommerce."split" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("invoice_id") REFERENCES ecommerce."invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE ecommerce."invoice" 
  ADD CONSTRAINT fk_invoice_order 
    FOREIGN KEY ("order_id") REFERENCES ecommerce."order" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE ecommerce."order_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "price_id" int NOT NULL,
  "is_prorated" boolean NOT NULL DEFAULT false,
  "quantity" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("order_id", "product_id"),

  FOREIGN KEY ("order_id") REFERENCES ecommerce."order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES ecommerce."product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("price_id") REFERENCES ecommerce."price" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(quantity >= 1),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."order_item_discount" (
  "order_item_id" uuid NOT NULL,
  "discount_id" int NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  PRIMARY KEY ("order_item_id", "discount_id"),

  FOREIGN KEY ("order_item_id") REFERENCES ecommerce."order_item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("discount_id") REFERENCES ecommerce."discount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."checkout_session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL,
  "coupon_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("coupon_id") REFERENCES ecommerce."coupon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."checkout_session_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "checkout_session_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "quantity" int NOT NULL,
  "is_prorated" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  FOREIGN KEY ("checkout_session_id") REFERENCES ecommerce."checkout_session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES ecommerce."product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(quantity >= 1),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."subscription" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "renewal_period_in_days" int NOT NULL DEFAULT 0,
  "max_renewal_use" int,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."subscription_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscription_id" uuid NOT NULL,
  "order_item_id" uuid NOT NULL,
  "starts_in" timestamp NOT NULL,
  "expires_in" timestamp,
  "created_at" timestamp DEFAULT now(),

  UNIQUE ("subscription_id", "order_item_id"),

  FOREIGN KEY ("subscription_id") REFERENCES ecommerce."subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("order_item_id") REFERENCES ecommerce."order_item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(starts_in >= created_at),
  CHECK(expires_in > starts_in)
);

CREATE TABLE ecommerce."subscription_cycle" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscription_id" uuid NOT NULL,
  "invoice_id" uuid NOT NULL UNIQUE,
  "starts_in" timestamp NOT NULL,
  "expires_in" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),

  FOREIGN KEY ("subscription_id") REFERENCES ecommerce."subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("invoice_id") REFERENCES ecommerce."invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(expires_in > starts_in),
  CHECK(updated_at >= created_at)
);

CREATE TABLE ecommerce."subscription_pause_status" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscription_cycle_id" uuid NOT NULL,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp, -- when the pause is disabled before the paused_at
  "paused_at" timestamp NOT NULL, -- starts in subscription_cycle.expires_in
  "resumed_at" timestamp,

  FOREIGN KEY ("subscription_cycle_id") REFERENCES ecommerce."subscription_cycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(disabled_at > created_at),
  CHECK(paused_at >= created_at),
  CHECK(resumed_at >= paused_at)
);

CREATE TABLE ecommerce."receiver_gateway" (
  "customer_id" uuid NOT NULL,
  "payment_gateway_id" uuid NOT NULL,
  "split_receiver_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp,

  PRIMARY KEY ("customer_id", "payment_gateway_id", "split_receiver_id"),

  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("payment_gateway_id") REFERENCES ecommerce."payment_gateway" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("split_receiver_id") REFERENCES ecommerce."split_receiver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

CREATE TABLE ecommerce."payment_method" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "customer_id" uuid NOT NULL,
  "payment_gateway_id" uuid NOT NULL,
  "payment_gateway_external_id" VARCHAR(255) NOT NULL,
  "grace_period_in_days" int NOT NULL,
  "type" ecommerce.payment_method_type NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp,

  UNIQUE ("customer_id", "payment_gateway_id", "payment_gateway_external_id"),
  UNIQUE ("customer_id", "title"),

  FOREIGN KEY ("customer_id") REFERENCES ecommerce."customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("payment_gateway_id") REFERENCES ecommerce."payment_gateway" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(grace_period_in_days >= 0),
  CHECK(updated_at >= created_at),
  CHECK(disabled_at > created_at)
);

ALTER TABLE ecommerce."customer" 
  ADD CONSTRAINT fk_customer_default_payment_method 
    FOREIGN KEY ("default_payment_method_id") REFERENCES ecommerce."payment_method" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE ecommerce."invoice_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_id" uuid NOT NULL,
  "order_item_id" uuid NOT NULL,
  "amount" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "tax_amount" INT NOT NULL DEFAULT 0,
  "shipping_amount" INT NOT NULL DEFAULT 0,
  "is_prorated" boolean NOT NULL DEFAULT false,
  "quantity" int NOT NULL DEFAULT 1,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),

  UNIQUE ("invoice_id", "order_item_id"),

  FOREIGN KEY ("invoice_id") REFERENCES ecommerce."invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("order_item_id") REFERENCES ecommerce."order_item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(amount >= 0),
  CHECK(tax_amount >= 0),
  CHECK(shipping_amount >= 0)
);

CREATE TABLE ecommerce."invoice_adjustment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_id" uuid NOT NULL,
  "amount" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "is_prorated" boolean NOT NULL DEFAULT false,
  "type" ecommerce.invoice_adjustment_type NOT NULL,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),

  FOREIGN KEY ("invoice_id") REFERENCES ecommerce."invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(amount != 0)
);

CREATE TABLE ecommerce."payment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_id" uuid NOT NULL,
  "payment_method_id" uuid NOT NULL,
  "amount" INT NOT NULL,
  "installments" int NOT NULL DEFAULT 1,
  "currency" ecommerce.currency NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),

  FOREIGN KEY ("invoice_id") REFERENCES ecommerce."invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("payment_method_id") REFERENCES ecommerce."payment_method" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(amount >= 0),
  CHECK(installments >= 1)
);

CREATE TABLE ecommerce."payment_status_transition" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_id" uuid NOT NULL,
  "transaction_id" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "status" ecommerce.payment_status NOT NULL DEFAULT 'CREATED',
  "created_at" timestamp NOT NULL DEFAULT now(),

  UNIQUE ("payment_id", "transaction_id"),

  FOREIGN KEY ("payment_id") REFERENCES ecommerce."payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ecommerce."payment_refund" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_id" uuid NOT NULL,
  "amount" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),

  FOREIGN KEY ("payment_id") REFERENCES ecommerce."payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(amount >= 0)
);

CREATE TABLE ecommerce."payment_dispute" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_id" uuid NOT NULL,
  "status" ecommerce.dispute_status NOT NULL DEFAULT 'OPEN',
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),

  FOREIGN KEY ("payment_id") REFERENCES ecommerce."payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE ecommerce."payment_chargeback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "dispute_id" uuid NOT NULL,
  "amount" INT NOT NULL,
  "currency" ecommerce.currency NOT NULL,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),

  FOREIGN KEY ("dispute_id") REFERENCES ecommerce."payment_dispute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(amount >= 0)
);

CREATE TABLE ecommerce."payment_gateway_webhook_event" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_id" uuid NOT NULL,
  "event_id" text NOT NULL,
  "payload" text NOT NULL,
  "is_signature_valid" boolean NOT NULL,
  "status" ecommerce.payment_gateway_webhook_event_status NOT NULL DEFAULT 'CREATED',
  "error_message" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "processed_at" timestamp,

  UNIQUE ("payment_id", "event_id"),

  FOREIGN KEY ("payment_id") REFERENCES ecommerce."payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  CHECK(updated_at >= created_at),
  CHECK(processed_at >= created_at)
);

CREATE TABLE ecommerce."catalog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "picture" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "disabled_at" timestamp
);

CREATE TABLE ecommerce."catalog_item" (
  "catalog_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),

  PRIMARY KEY ("catalog_id", "product_id"),

  FOREIGN KEY ("catalog_id") REFERENCES ecommerce."catalog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES ecommerce."product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CHECK(quantity >= 1),
  CHECK(updated_at >= created_at)
);

-- Preciso criar um wallet com extrato, onde as entradas virão de comprar de produtos tipo crédito, voucher, refund, gift card, etc. E as saídas viram de notificação de eventos do que foi consumido ou por valr fixo mensal
CREATE TABLE ecommerce."consumption" (
  "id" INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "account_id" uuid NOT NULL,
  "data" text NOT NULL,
  "amount" INT NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "disabled_at" timestamp,

  CHECK(amount >= 0),
  CHECK(disabled_at > created_at),
  FOREIGN KEY ("account_id") REFERENCES IAM."account" ("id")
);

-- business rules

CREATE OR REPLACE FUNCTION prevent_update()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Updates are not allowed on table "%"', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_update_except_disabled_at()
RETURNS trigger AS $$
BEGIN
    IF (NEW IS DISTINCT FROM OLD) THEN
        IF (NEW.* IS DISTINCT FROM (OLD.*) AND (NEW.disabled_at IS DISTINCT FROM OLD.disabled_at)) THEN
             NULL; 
        END IF;

        IF ROW(NEW.*) #= hstore('disabled_at', OLD.disabled_at::text) 
           IS DISTINCT FROM ROW(OLD.*) #= hstore('disabled_at', OLD.disabled_at::text) THEN
            RAISE EXCEPTION 'Updates are only allowed on "disabled_at" column in table %', TG_TABLE_NAME;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_update_password
BEFORE UPDATE ON IAM."password"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_phone
BEFORE UPDATE ON IAM."phone"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_phone_messager
BEFORE UPDATE ON IAM."phone_messager"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_email
BEFORE UPDATE ON IAM."email"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_api_token
BEFORE UPDATE ON IAM."api_token"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_oauth_access_token
BEFORE UPDATE ON IAM."oauth_access_token"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_oauth_refresh_token
BEFORE UPDATE ON IAM."oauth_refresh_token"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

--------------------------------------------------

CREATE TRIGGER trg_prevent_update_discount
BEFORE UPDATE ON ecommerce."discount"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_discount_rule
BEFORE UPDATE ON ecommerce."discount_rule"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_coupon
BEFORE UPDATE ON ecommerce."coupon"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_price
BEFORE UPDATE ON ecommerce."price"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_product_discount
BEFORE UPDATE ON ecommerce."product_discount"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_split_receiver
BEFORE UPDATE ON ecommerce."split_receiver"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_order
BEFORE UPDATE ON ecommerce."order"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_order_item
BEFORE UPDATE ON ecommerce."order_item"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_order_item_discount
BEFORE UPDATE ON ecommerce."order_item_discount"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_subscription
BEFORE UPDATE ON ecommerce."subscription"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_subscription_item
BEFORE UPDATE ON ecommerce."subscription_item"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_subscription_cycle
BEFORE UPDATE ON ecommerce."subscription_cycle"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_subscription_pause_status
BEFORE UPDATE ON ecommerce."subscription_pause_status"
FOR EACH ROW EXECUTE FUNCTION prevent_update_except_disabled_at();

CREATE TRIGGER trg_prevent_update_invoice
BEFORE UPDATE ON ecommerce."invoice"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_invoice_item
BEFORE UPDATE ON ecommerce."invoice_item"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_invoice_adjustment
BEFORE UPDATE ON ecommerce."invoice_adjustment"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_payment
BEFORE UPDATE ON ecommerce."payment"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_payment_transaction
BEFORE UPDATE ON ecommerce."payment_transaction"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_payment_refund
BEFORE UPDATE ON ecommerce."payment_refund"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_payment_dispute
BEFORE UPDATE ON ecommerce."payment_dispute"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_payment_chargeback
BEFORE UPDATE ON ecommerce."payment_chargeback"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

CREATE TRIGGER trg_prevent_update_consumption
BEFORE UPDATE ON ecommerce."consumption"
FOR EACH ROW EXECUTE FUNCTION prevent_update();

--------------------------------------------------

CREATE OR REPLACE FUNCTION check_discount_exclusivity_by_context()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM ecommerce."product_discount" WHERE discount_id = NEW.discount_id)
     AND TG_TABLE_NAME = 'coupon' THEN
    RAISE EXCEPTION 'Discount % is already used by a product', NEW.discount_id;
  END IF;

  IF EXISTS (SELECT 1 FROM ecommerce."coupon" WHERE discount_id = NEW.discount_id)
     AND TG_TABLE_NAME = 'product' THEN
    RAISE EXCEPTION 'Discount % is already used by a coupon', NEW.discount_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_discount_exclusivity_by_context_product
BEFORE INSERT OR UPDATE ON ecommerce."product"
FOR EACH ROW EXECUTE FUNCTION check_discount_exclusivity_by_context();

CREATE TRIGGER trg_check_discount_exclusivity_by_context_coupon
BEFORE INSERT OR UPDATE ON ecommerce."coupon"
FOR EACH ROW EXECUTE FUNCTION check_discount_exclusivity_by_context();
