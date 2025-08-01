-- Create Tables
CREATE TABLE UserLogins (
    login_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,                -- ID interno (chave primária)
    user_id INT NOT NULL,                 -- Código de negócio (não único)
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Uploads (
    id SERIAL PRIMARY KEY,
    login_id BIGINT NOT NULL,
    filename VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (login_id) REFERENCES UserLogins(login_id)
);

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,                -- ID interno (chave primária)
    order_id INT NOT NULL,                -- Código de negócio (não único)
    purchase_date DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    upload_id INT NOT NULL,
    user_table_id INT NOT NULL,           -- Referência ao id da tabela Users (não ao user_id)
    FOREIGN KEY (user_table_id) REFERENCES Users(id),
    FOREIGN KEY (upload_id) REFERENCES Uploads(id)
);

CREATE TABLE Products (
    id SERIAL PRIMARY KEY,                -- ID interno (chave primária)
    product_id INT NOT NULL,              -- Código de negócio (não único)
    value DECIMAL(10, 2) NOT NULL,
    order_table_id INT NOT NULL,          -- Referência ao id da tabela Orders (não ao order_id)
    FOREIGN KEY (order_table_id) REFERENCES Orders(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX idx_order_business ON Orders(order_id, user_table_id);
CREATE INDEX idx_uploads_login_id ON Uploads(login_id);
CREATE INDEX idx_orders_user_table_id ON Orders(user_table_id);
CREATE INDEX idx_orders_upload_id ON Orders(upload_id);
CREATE INDEX idx_products_order_table_id ON Products(order_table_id);
CREATE INDEX idx_products_product_id ON Products(product_id);
CREATE INDEX idx_users_user_id ON Users(user_id);  -- Adicionado para otimizar buscas por user_id

-- Trigger para atualizar automaticamente o updated_at
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