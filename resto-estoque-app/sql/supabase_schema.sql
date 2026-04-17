-- =========================================================================
-- ENTREGA 03 - Script de Criação e População para SUPABASE (PostgreSQL)
-- Sistema: resto_estoque (Caso 11 - Restaurante)
-- =========================================================================

-- No Supabase, você não precisa criar o banco de dados com "CREATE DATABASE",
-- ele já cria o esquema "public" por padrão. Vamos apenas criar as tabelas.

-- 1. Tabela de Usuários (Mock para login simples no protótipo)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Tabela principal de Ingredientes/Produtos (Entrega 06)
CREATE TABLE ingredientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    unidade VARCHAR(10) NOT NULL,
    quantidade_atual DECIMAL(10,2) DEFAULT 0.00,
    estoque_minimo DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Movimentações de Estoque (Entrega 07)
CREATE TABLE movimentacoes (
    id SERIAL PRIMARY KEY,
    ingrediente_id INTEGER NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) CHECK (tipo IN ('Entrada', 'Saída')) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- POPULAÇÃO INICIAL DE DADOS
-- =========================================================================

INSERT INTO usuarios (nome, login, senha_hash) VALUES 
('Administrador', 'admin', '1234');

INSERT INTO ingredientes (nome, categoria, unidade, quantidade_atual, estoque_minimo) VALUES 
('Arroz Branco',         'Grãos',   'kg', 25.00, 10.00),
('Feijão Carioca',       'Grãos',   'kg',  8.00, 10.00),
('Carne Bovina (Alcatra)','Carnes', 'kg', 15.00, 15.00),
('Cebola',               'Legumes', 'kg',  3.00,  5.00),
('Óleo de Soja',         'Insumos', 'L',  20.00, 10.00);

INSERT INTO movimentacoes (ingrediente_id, usuario_id, tipo, quantidade) VALUES 
(1, 1, 'Entrada', 25.00),
(2, 1, 'Entrada', 15.00),
(2, 1, 'Saída',    7.00);
