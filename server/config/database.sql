-- Script para criação do banco de dados e tabelas
-- Execute este script no MySQL antes de iniciar o servidor

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS prospectdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE prospectdb;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Mensagens
CREATE TABLE IF NOT EXISTS message_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('whatsapp', 'rdstation') DEFAULT 'whatsapp',
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    contact_name VARCHAR(100),
    contact_email VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Configuração do RD Station
CREATE TABLE IF NOT EXISTS rd_station_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    api_token VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSON,
    last_sync_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_id (user_id)
);

-- Adicionar índices para melhorar a performance
CREATE INDEX idx_message_histories_user_id ON message_histories(user_id);
CREATE INDEX idx_message_histories_sent_at ON message_histories(sent_at);
CREATE INDEX idx_message_histories_type ON message_histories(type);
CREATE INDEX idx_users_email ON users(email);

-- Observação: Este script só precisa ser executado uma vez para criar o banco de dados
-- O Sequelize irá sincronizar as tabelas com base nos modelos definidos no código
