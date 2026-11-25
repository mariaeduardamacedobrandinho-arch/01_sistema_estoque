CREATE USER IF NOT EXISTS 'estoque_app'@'127.0.0.1'
IDENTIFIED BY 'ALTERE_PARA_SENHA_FORTE_DE_LABORATORIO';

GRANT SELECT ON estoque_bd.produtos_tb
TO 'estoque_app'@'127.0.0.1';

GRANT SELECT ON estoque_bd.categorias_tb
TO 'estoque_app'@'127.0.0.1';

GRANT SELECT ON estoque_bd.movimentacoes_tb
TO 'estoque_app'@'127.0.0.1';

GRANT INSERT ON estoque_bd.historico_tb
TO 'estoque_app'@'127.0.0.1';