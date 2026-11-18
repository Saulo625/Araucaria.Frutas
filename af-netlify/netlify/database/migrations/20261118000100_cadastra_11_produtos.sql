
-- =====================================================
-- CADASTRA E ATUALIZA OS 11 PRODUTOS
-- =====================================================

INSERT INTO produtos
(id, nome, descricao, imagem, nome_destaque, destaque_ordem, ordem)
VALUES
(
'Lichia', 'Lichia',
'Fruta tropical de casca avermelhada e polpa branca e translúcida. Possui textura delicada, suculenta e sabor doce com aroma característico.',
'imagens/Lichia.jpg', NULL, NULL, 32
),
(
'Cereja', 'Cereja',
'Fruta de coloração vermelha, polpa suculenta e textura macia. Apresenta sabor adocicado com um leve toque de acidez.',
'imagens/Cereja.png', NULL, NULL, 33
),
(
'MelanciaAmarela', 'Melancia Amarela',
'Fruta refrescante de polpa amarela, conhecida pela textura suculenta e sabor adocicado. Uma opção deliciosa para consumir gelada.',
'imagens/Melancia-Amarela.png', NULL, NULL, 34
),
(
'Pessego kampai nacional', 'Pessego kampai nacional',
'Pêssego da variedade Kampai, com polpa macia e suculenta. Apresenta sabor adocicado e aroma agradável, ideal para consumir fresco.',
'imagens/Pessego.png', NULL, NULL, 35
),
(
'Nectarina nacional ', 'Nectarina nacional ',
'Fruta de casca lisa e polpa suculenta, com sabor doce e levemente ácido. Uma opção saborosa para consumir fresca ou em sobremesas.',
'imagens/Nectarina.png', NULL, NULL, 36
),
(
'Ameixa da Espanha ', 'Ameixa da Espanha ',
'Fruta de polpa macia e suculenta, com sabor adocicado e leve acidez. Versátil, pode ser consumida fresca ou utilizada em diversas receitas.',
'imagens/Ameixa.png', NULL, NULL, 37
),
(
'Caqui da Espanha', 'Caqui da Espanha',
'Fruta de polpa macia e sabor naturalmente doce quando madura. Possui textura agradável e é ideal para consumir fresca.',
'imagens/Caqui.jpg', NULL, NULL, 38
),
(
'Amora berry good', 'Amora berry good',
'Pequena fruta de coloração escura, formada por pequenas partes agrupadas. Possui textura delicada e sabor doce com leve acidez.',
'imagens/Amora.jpg', NULL, NULL, 39
),
(
'Framboesa berry good', 'Framboesa berry good',
'Fruta delicada de coloração avermelhada, com pequenas cavidades e textura macia. Seu sabor combina doçura e acidez em equilíbrio.',
'imagens/Framboesa.jpg', NULL, NULL, 40
),
(
'Pitaya colombiana ', 'Pitaya colombiana ',
'Fruta tropical de aparência exótica, com polpa macia e pequenas sementes comestíveis. Apresenta sabor suave e levemente adocicado.',
'imagens/PitayaColombiana.jpg', NULL, NULL, 41
),
(
'Mel ', 'Mel ',
'Alimento naturalmente produzido pelas abelhas a partir do néctar das flores. Possui sabor adocicado e pode ser utilizado para acompanhar frutas, bebidas e diversas receitas.',
'imagens/Mel.jpg', NULL, NULL, 42
)
ON CONFLICT (id) DO UPDATE SET
nome = EXCLUDED.nome,
descricao = EXCLUDED.descricao,
imagem = EXCLUDED.imagem,
ordem = EXCLUDED.ordem;


-- =====================================================
-- CADASTRA OU ATUALIZA AS OPÇÕES DOS 11 PRODUTOS
-- =====================================================

INSERT INTO opcoes
(produto_id, rotulo, preco_centavos, imagem, ordem)
VALUES
('Lichia', '1 bandeja', 4499, NULL, 0),
('Cereja', '1 bandeja', 1899, NULL, 0),
('MelanciaAmarela', '1 unidade', 3999, NULL, 0),
('MelanciaAmarela', '1/2 unidade', 2000, NULL, 1),
('Pessego kampai nacional', '500g', 999, NULL, 0),
('Nectarina nacional ', '500g', 1499, NULL, 0),
('Ameixa da Espanha ', '500g', 1399, NULL, 0),
('Caqui da Espanha', '4 unidades', 2999, NULL, 0),
('Amora berry good', '80g', 2999, NULL, 0),
('Framboesa berry good', '1 bandeja', 3499, NULL, 0),
('Pitaya colombiana ', '2 unidades', 4999, NULL, 0),
('Mel ', '275g', 2999, NULL, 0)
ON CONFLICT (produto_id, ordem) DO UPDATE SET
rotulo = EXCLUDED.rotulo,
preco_centavos = EXCLUDED.preco_centavos,
imagem = EXCLUDED.imagem;


-- =====================================================
-- ATUALIZA OPÇÕES DE MELANCIA VERMELHA E MELÃO
-- =====================================================

UPDATE opcoes
SET rotulo = '1/2 unidade',
    preco_centavos = 1245
WHERE produto_id = 'melancia' AND ordem = 1;

UPDATE opcoes
SET rotulo = '1/2 unidade',
    preco_centavos = 900
WHERE produto_id = 'melao' AND ordem = 1;
