-- Create Tables
CREATE TABLE UserLogins (
    login_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modified Users table with email
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    login_id BIGINT REFERENCES UserLogins(login_id)
);

-- New table for favorite products
CREATE TABLE FavoriteProducts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_external_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_external_id)
);

-- Cache table for external product data
CREATE TABLE ProductCache (
    product_external_id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    description TEXT,
    category VARCHAR(255),
    rating_rate DECIMAL(3, 2),
    rating_count INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_favorite_products_user_id ON FavoriteProducts(user_id);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_login_id ON Users(login_id);

-- Trigger to update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_userlogins_updated_at
BEFORE UPDATE ON UserLogins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update the ProductCache last_updated field
CREATE TRIGGER update_product_cache_last_updated
BEFORE UPDATE ON ProductCache
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();