-- Create Tables
CREATE TABLE UserLogins (
    login_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Uploads (
    upload_id SERIAL PRIMARY KEY,
    login_id BIGINT NOT NULL,
    filename VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (login_id) REFERENCES UserLogins(login_id)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    purchase_date DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    user_id INT NOT NULL,
    upload_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (upload_id) REFERENCES Uploads(upload_id)
);

CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    value DECIMAL(10, 2) NOT NULL,
    order_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

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

-- Índices
CREATE INDEX idx_uploads_login_id ON Uploads(login_id);
CREATE INDEX idx_orders_user_id ON Orders(user_id);
CREATE INDEX idx_orders_upload_id ON Orders(upload_id);
CREATE INDEX idx_products_order_id ON Products(order_id);

-- Criar sequências para uso opcional quando não for especificado um ID
CREATE SEQUENCE users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE orders_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Definir valores padrão para colunas que usam sequências
ALTER TABLE Users ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq'::regclass);
ALTER TABLE Orders ALTER COLUMN order_id SET DEFAULT nextval('orders_order_id_seq'::regclass);

-- Ajustar a tabela Orders para incluir um índice único na combinação (order_id, user_id)
CREATE UNIQUE INDEX idx_unique_order_user ON Orders(order_id, user_id);