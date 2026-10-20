-- Importa os produtos que já existiam no site (copiados do antigo js/script.js, sem alterações).
INSERT INTO produtos (id,nome,descricao,imagem,nome_destaque,destaque_ordem,ordem) VALUES
('morango','Morango Fresco Selecionado','Fresquinho – colhido diariamente
Doce e suculento – sabor irresistível
Rico em vitamina C – fortalece sua imunidade
Seleção premium – qualidade garantida','imagens/morango.jpg',NULL,NULL,0),
('uva_gota_mel','Uva Thompson Gota de Mel','Sem sementes – prática e fácil de consumir, 100% sem sementes
Super doce – sabor naturalmente doce, como gota de mel
Crocante – textura crocante e fresquinha
Rica em vitaminas C e K e antioxidantes','imagens/uva_gota_mel.jpg',NULL,0,1),
('limao','Limão Tahiti','100% natural – produto fresco, sem conservantes e agrotóxicos
Rico em vitamina C – fortalece a imunidade e a saúde diariamente
Suco abundante – polpa suculenta ideal para sucos refrescantes
Ideal para sucos e temperos – perfeito para culinária, drinks e pratos gourmet','imagens/limao.jpg',NULL,1,2),
('banana','Banana Nanica','Rica em potássio – auxilia no equilíbrio e na saúde muscular
Energia natural – fonte de energia rápida e natural para o dia
Fonte de fibras – contribui para a digestão e saciedade
Ideal para o dia a dia – perfeita para lanche saudável a qualquer hora','imagens/banana.jpg',NULL,2,3),
('kiwi','Kiwi Gold Zespri Sungold','Rico em vitamina C – imunidade
100% natural e suculento
Fonte de fibras e energia
Sabor doce e refrescante','imagens/kiwi.jpg',NULL,3,4),
('pera','Pêra Williams Espanhola','Suculenta e super doce
Rica em fibras e vitaminas
Baixa em calorias – leve e saudável
Textura macia que derrete na boca','imagens/pera.jpg',NULL,4,5),
('laranja','Laranja Bahia do Uruguai','Polpa doce e sem sementes
Rica em vitamina C
Fonte de fibras
Ideal para suco natural','imagens/laranja.jpg',NULL,5,6),
('jabuticaba','Jabuticaba Fresca','Rica em antioxidantes e vitamina C
Fonte de ferro e fibras
Sabor doce e suculento
Ajuda na imunidade e digestão','imagens/jabuticaba_450.jpg','Jabuticaba 450g',6,7),
('acerola','Acerola Fresca','Super fonte de vitamina C – 30x mais que a laranja
Rica em antioxidantes e vitamina A
Fortalece imunidade e pele
Poucas calorias – ideal para sucos','imagens/acerola.jpg',NULL,7,8),
('abacaxi','Abacaxi Pérola','Polpa doce e suculenta – sabor tropical
Rico em vitamina C e bromelina
Auxilia na digestão e imunidade
Poucas calorias e refrescante','imagens/abacaxi.jpg',NULL,NULL,9),
('atemoia','Atemoia do Chico Bento','Polpa branca doce e cremosa – sabor de fruta-do-conde com cherimoia
Rica em vitaminas C, B6, fibras e potássio
Fonte de energia natural – baixa caloria
Auxilia digestão e saciedade – fruta nobre','imagens/atemoia.jpg',NULL,NULL,10),
('blueberry','Blueberry Peruano Super Jumbo','Super Jumbo – frutos grandes e doces
Rico em antioxidantes (antocianinas) e vitamina C
Fonte de fibras e vitamina K – baixa caloria
Auxilia memória, imunidade e visão','imagens/blueberry.jpg',NULL,NULL,11),
('caju','Caju Fresco','Rico em vitamina C – 5x mais que a laranja
Fonte de ferro, cálcio e antioxidantes
Fortalece imunidade e energia
Polpa suculenta – ideal para sucos e doces','imagens/caju.jpg',NULL,NULL,12),
('carambola','Carambola Fresca','Polpa doce e refrescante – formato estrela
Rica em vitamina C, A e antioxidantes
Fonte de potássio e fibras
Baixa caloria – auxilia hidratação e imunidade','imagens/carambola.jpg',NULL,NULL,13),
('coco','Água de Coco Natural','100% natural e hidratante – isotônico natural
Rica em eletrólitos e potássio
Refresca e revigora – baixa caloria
Pronta para beber – com canudo, aperte aqui','imagens/coco.jpg',NULL,NULL,14),
('goiaba','Goiaba do Chico Bento','Polpa doce e aromática – rica em licopeno
Fonte de vitamina C – 4x mais que a laranja
Rica em fibras e potássio – auxilia digestão
Baixa caloria – ideal para sucos e doces','imagens/goiaba.jpg',NULL,NULL,15),
('maca','Maçã Gala (Turma da Mônica – Fischer)','Doce e crocante – pré-lavada, pronta para consumo
Rica em fibras, pectina e vitaminas
Fonte de antioxidantes – auxilia saciedade e digestão
Ideal para o lanche das crianças – selo qualidade Fischer','imagens/maca.jpg',NULL,NULL,16),
('mamao_formosa','Mamão Formosa (Turma da Mônica)','Polpa generosa e doce – rico em papaína
Fonte de vitamina A, C, fibras e licopeno
Auxilia digestão e fortalece imunidade
Grande e econômico – ideal para família','imagens/mamao_formosa.jpg',NULL,NULL,17),
('mamao_papaia','Mamão Papaia','Polpa doce e macia – rico em papaína
Fonte de vitamina A, C e fibras
Auxilia digestão e imunidade
Poucas calorias – ideal para café da manhã','imagens/mamao_papaia.jpg',NULL,NULL,18),
('manga','Manga Palmer','Polpa doce e sem fiapos – textura macia
Rica em vitamina A, C, manganês e antioxidantes
Fonte de fibras e potássio
Auxilia imunidade e digestão – baixa caloria','imagens/manga.jpg',NULL,NULL,19),
('melancia','Melancia Pingo Doce','Polpa vermelha super doce
Hidratação natural – 92% água
Rica em licopeno e vitamina C
Refrescante e poucas calorias','imagens/melancia.jpg',NULL,NULL,20),
('melao','Melão Amarelo (Turma da Mônica)','Polpa doce e suculenta – sabor refrescante
Rico em vitamina A, C e hidratação
Fonte de potássio e fibras
Poucas calorias e refrescante','imagens/melao.jpg',NULL,NULL,21),
('nespera','Néspera Fresca (Chico Bento)','Polpa doce e suculenta – sabor único
Rica em vitamina A, C e fibras
Fonte de potássio e antioxidantes
Auxilia digestão e imunidade – baixa caloria','imagens/nespera.jpg',NULL,NULL,22),
('nozes','Nozes','Nozes crocantes e saborosas – seleção premium
Rica em ômega 3 e gorduras boas – saúde do coração
Fonte de vitaminas E, B6, magnésio e antioxidantes
Energia natural – auxilia memória e saciedade','imagens/nozes.jpg',NULL,NULL,23),
('pessego','Pêssego Amarelo Espanhol','Super doce e suculento
Rico em vitaminas A e C
Fonte de fibras – digestão leve
Polpa macia que derrete na boca','imagens/pessego.jpg',NULL,NULL,24),
('pitaya','Pitaya Vermelha (Turma da Mônica)','Polpa vermelha doce e suave – rica em betacianina antioxidante
Fonte de vitamina C, fibras e minerais – ferro e magnésio
Baixa caloria – auxilia digestão e saciedade
Super alimento – fortalece imunidade e beleza da pele','imagens/pitaya.jpg',NULL,NULL,25),
('roma','Romã','Rica em antioxidantes – combate radicais livres
Fonte de vitamina C, K e potássio
Auxilia coração e imunidade
Sementes doces e refrescantes','imagens/roma.jpg',NULL,NULL,26),
('sweetgrape','Sweet Grape (Tomate Doce)','Super doce como mel
Fonte de licopeno – saúde do coração
Rica em antioxidantes
Crocante e suculenta','imagens/sweetgrape.jpg',NULL,NULL,27),
('tamara','Tâmara Medjoul de Israel','Doçura natural de caramelo – natural sugar
Rica em fibras, potássio, magnésio e ferro
Fonte de energia natural – vegan e gluten free
Rica em antioxidantes – auxilia digestão','imagens/tamara.jpg',NULL,NULL,28),
('uva_cotton_candy','Uva Cotton Candy Algodão Doce','Sabor algodão doce – aroma único irresistível
Sem sementes – prática para comer
Super doce e crocante – explosão de doçura a cada mordida
Seleção Premium Vale do São Francisco','imagens/uva_cotton_candy.jpg',NULL,NULL,29),
('uva_thompson','Uva Thompson Nacional (Sugar Crisp)','Doce e crocante – sem sementes
Fonte de fibras e potássio – hidratação natural
Rica em antioxidantes (resveratrol) e vitaminas
Ideal para lancheira e sobremesa – praticidade','imagens/uva_thompson.jpg',NULL,NULL,30),
('uva_vitoria','Uva Vitória Sem Semente (CAJ Gold)','Uva Vitória doce intensa e crocante – sem sementes
Rica em antioxidantes (resveratrol) – beleza e longevidade
Fonte de vitaminas, ferro e fibras – energia natural
Ideal para lancheira e sobremesa – praticidade total','imagens/uva_vitoria.jpg',NULL,NULL,31);

INSERT INTO opcoes (produto_id,rotulo,preco_centavos,imagem,ordem) VALUES
('morango','1 cumbuca (250g)',1500,NULL,0),
('uva_gota_mel','500g (1 cumbuca)',1999,NULL,0),
('limao','6 unidades',599,NULL,0),
('banana','Meia dúzia',599,NULL,0),
('kiwi','1 cumbuca',2499,NULL,0),
('pera','2 unidades',799,NULL,0),
('laranja','3 unidades',1000,NULL,0),
('jabuticaba','Bandeja 450g',1399,'imagens/jabuticaba_450.jpg',0),
('jabuticaba','Caixa 1kg',3199,'imagens/jabuticaba_1kg.jpg',1),
('acerola','300g',999,NULL,0),
('abacaxi','1 unidade',1299,NULL,0),
('abacaxi','Fatiado',1499,NULL,1),
('atemoia','400g',1399,NULL,0),
('blueberry','200g',3399,NULL,0),
('caju','300g',999,NULL,0),
('carambola','500g',2499,NULL,0),
('coco','1 unidade',1999,NULL,0),
('goiaba','400g',1199,NULL,0),
('maca','1kg',1699,NULL,0),
('mamao_formosa','1 unidade',1399,NULL,0),
('mamao_formosa','Fatiado',1599,NULL,1),
('mamao_papaia','1 unidade',499,NULL,0),
('mamao_papaia','Fatiado',699,NULL,1),
('manga','1 unidade',699,NULL,0),
('manga','Fatiada',899,NULL,1),
('melancia','1 unidade',2499,NULL,0),
('melancia','Fatiada',2699,NULL,1),
('melao','1 unidade',1799,NULL,0),
('melao','Fatiado',1999,NULL,1),
('nespera','450g',2999,NULL,0),
('nozes','350g',2999,NULL,0),
('pessego','2 unidades',899,NULL,0),
('pitaya','500g',2299,NULL,0),
('roma','1 unidade',1599,NULL,0),
('sweetgrape','180g',1199,NULL,0),
('tamara','200g',1999,NULL,0),
('uva_cotton_candy','500g (1 cumbuca)',2499,NULL,0),
('uva_thompson','1 cumbuca',1399,NULL,0),
('uva_vitoria','1 cumbuca',1299,NULL,0);
