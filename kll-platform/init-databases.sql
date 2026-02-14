-- KLL Platform - Initialize databases
CREATE DATABASE kll_pay;
CREATE DATABASE kll_logistics;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE kll_store TO kll;
GRANT ALL PRIVILEGES ON DATABASE kll_pay TO kll;
GRANT ALL PRIVILEGES ON DATABASE kll_logistics TO kll;