-- Inserir perguntas do teste Clima e Bem-Estar no banco de dados
-- UUID do teste: 55fc21f9-cc10-4b4a-8765-3f5087eaf1f5

-- Inserir perguntas da dimensão Segurança Psicológica
INSERT INTO perguntas (id, teste_id, texto, tipo, ordem, obrigatoria) VALUES
('11111111-1111-1111-1111-111111111111', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto-me à vontade para expressar minhas opiniões no trabalho sem medo de represálias.', 'likert_5', 1, true),
('11111111-1111-1111-1111-111111111112', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Quando cometo erros, sinto que minha equipe me apoia para aprender com eles.', 'likert_5', 2, true),
('11111111-1111-1111-1111-111111111113', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Posso compartilhar ideias novas sem receio de ser julgado negativamente.', 'likert_5', 3, true),
('11111111-1111-1111-1111-111111111114', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Me sinto seguro(a) para questionar decisões da liderança sem medo de consequências.', 'likert_5', 4, true),
('11111111-1111-1111-1111-111111111115', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Minhas preocupações são levadas a sério pela equipe e gestores.', 'likert_5', 5, true),
('11111111-1111-1111-1111-111111111116', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A cultura do meu local de trabalho incentiva o diálogo aberto.', 'likert_5', 6, true),
('11111111-1111-1111-1111-111111111117', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sou encorajado(a) a falar sobre dificuldades emocionais ou psicológicas.', 'likert_5', 7, true),
('11111111-1111-1111-1111-111111111118', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A equipe aceita diferentes pontos de vista e opiniões divergentes.', 'likert_5', 8, true),
('11111111-1111-1111-1111-111111111119', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que posso pedir ajuda quando estou com problemas no trabalho.', 'likert_5', 9, true),
('11111111-1111-1111-1111-11111111111a', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Erros são tratados como oportunidades para melhorar, não para punir.', 'likert_5', 10, true),
('11111111-1111-1111-1111-11111111111b', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que minha saúde mental é respeitada e valorizada pela equipe.', 'likert_5', 11, true),
('11111111-1111-1111-1111-11111111111c', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Posso falar abertamente sobre minhas limitações sem sofrer preconceito.', 'likert_5', 12, true),

-- Inserir perguntas da dimensão Comunicação Interna
('11111111-1111-1111-1111-11111111111d', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'As informações importantes chegam até mim de forma clara e oportuna.', 'likert_5', 13, true),
('11111111-1111-1111-1111-11111111111e', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que posso comunicar meus problemas de saúde mental à liderança sem constrangimento.', 'likert_5', 14, true),
('11111111-1111-1111-1111-11111111111f', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Existe transparência na comunicação sobre decisões que impactam minha função.', 'likert_5', 15, true),
('11111111-1111-1111-1111-111111111120', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Recebo feedbacks frequentes e construtivos sobre meu desempenho.', 'likert_5', 16, true),
('11111111-1111-1111-1111-111111111121', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A comunicação entre diferentes departamentos é eficiente e colaborativa.', 'likert_5', 17, true),
('11111111-1111-1111-1111-111111111122', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Tenho acesso a canais adequados para expressar minhas dúvidas e preocupações.', 'likert_5', 18, true),
('11111111-1111-1111-1111-111111111123', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que as informações compartilhadas são confiáveis.', 'likert_5', 19, true),
('11111111-1111-1111-1111-111111111124', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A liderança se comunica de forma aberta e acessível.', 'likert_5', 20, true),
('11111111-1111-1111-1111-111111111125', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Recebo suporte adequado quando informo sobre dificuldades relacionadas ao trabalho.', 'likert_5', 21, true),
('11111111-1111-1111-1111-111111111126', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'As reuniões são produtivas e ajudam a esclarecer questões importantes.', 'likert_5', 22, true),
('11111111-1111-1111-1111-111111111127', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A empresa promove iniciativas que facilitam a comunicação entre colegas.', 'likert_5', 23, true),
('11111111-1111-1111-1111-111111111128', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A comunicação interna contribui para um ambiente de trabalho positivo.', 'likert_5', 24, true),

-- Inserir perguntas da dimensão Pertencimento e Inclusão
('11111111-1111-1111-1111-111111111129', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que faço parte de uma equipe que valoriza minha contribuição.', 'likert_5', 25, true),
('11111111-1111-1111-1111-11111111112a', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Me sinto conectado(a) com os valores e a missão da empresa.', 'likert_5', 26, true),
('11111111-1111-1111-1111-11111111112b', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Minha equipe me inclui nas decisões que afetam nosso trabalho.', 'likert_5', 27, true),
('11111111-1111-1111-1111-11111111112c', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que minha identidade e características pessoais são respeitadas.', 'likert_5', 28, true),
('11111111-1111-1111-1111-11111111112d', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Tenho oportunidades iguais de crescimento e desenvolvimento profissional.', 'likert_5', 29, true),
('11111111-1111-1111-1111-11111111112e', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Me sinto acolhido(a) e integrado(a) ao ambiente de trabalho.', 'likert_5', 30, true),
('11111111-1111-1111-1111-11111111112f', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Minha opinião é valorizada nas discussões e tomadas de decisão.', 'likert_5', 31, true),
('11111111-1111-1111-1111-111111111130', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto orgulho de trabalhar nesta organização.', 'likert_5', 32, true),
('11111111-1111-1111-1111-111111111131', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A diversidade é celebrada e promovida no meu ambiente de trabalho.', 'likert_5', 33, true),
('11111111-1111-1111-1111-111111111132', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Tenho relacionamentos positivos e de confiança com meus colegas.', 'likert_5', 34, true),
('11111111-1111-1111-1111-111111111133', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Me sinto motivado(a) a contribuir com o sucesso da equipe.', 'likert_5', 35, true),
('11111111-1111-1111-1111-111111111134', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que posso ser autêntico(a) no meu ambiente de trabalho.', 'likert_5', 36, true),

-- Inserir perguntas da dimensão Justiça Organizacional
('11111111-1111-1111-1111-111111111135', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'As decisões da liderança são tomadas de forma justa e transparente.', 'likert_5', 37, true),
('11111111-1111-1111-1111-111111111136', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que sou tratado(a) com equidade em relação aos meus colegas.', 'likert_5', 38, true),
('11111111-1111-1111-1111-111111111137', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Os processos de avaliação e promoção são claros e justos.', 'likert_5', 39, true),
('11111111-1111-1111-1111-111111111138', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Quando há conflitos, eles são resolvidos de maneira imparcial.', 'likert_5', 40, true),
('11111111-1111-1111-1111-111111111139', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A distribuição de tarefas e responsabilidades é equilibrada.', 'likert_5', 41, true),
('11111111-1111-1111-1111-11111111113a', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Tenho acesso às mesmas oportunidades que outros colaboradores.', 'likert_5', 42, true),
('11111111-1111-1111-1111-11111111113b', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'As políticas da empresa são aplicadas de forma consistente para todos.', 'likert_5', 43, true),
('11111111-1111-1111-1111-11111111113c', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que meu esforço e dedicação são reconhecidos adequadamente.', 'likert_5', 44, true),
('11111111-1111-1111-1111-11111111113d', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A remuneração e benefícios são justos em relação às minhas responsabilidades.', 'likert_5', 45, true),
('11111111-1111-1111-1111-11111111113e', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Existe um canal eficaz para reportar injustiças ou problemas éticos.', 'likert_5', 46, true),
('11111111-1111-1111-1111-11111111113f', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'A liderança demonstra integridade e ética em suas ações.', 'likert_5', 47, true),
('11111111-1111-1111-1111-111111111140', '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', 'Sinto que posso confiar nas decisões e direcionamentos da organização.', 'likert_5', 48, true);