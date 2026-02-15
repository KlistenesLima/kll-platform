-- KLL Platform - Initialize databases
-- This script runs when PostgreSQL first starts

CREATE DATABASE kll_pay;
CREATE DATABASE kll_logistics;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE kll_store TO kll;
GRANT ALL PRIVILEGES ON DATABASE kll_pay TO kll;
GRANT ALL PRIVILEGES ON DATABASE kll_logistics TO kll;

-- Connect to kll_store and create schema
\c kll_store kll
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to kll_pay and create schema
\c kll_pay kll
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to kll_logistics and create schema
\c kll_logistics kll
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
