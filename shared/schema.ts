import { pgTable, uuid, varchar, text, timestamp, boolean, integer, real, decimal, jsonb, inet, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nome: varchar('nome', { length: 255 }).notNull(),
  senha: varchar('senha', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_admins_email').on(table.email),
}));

export const empresas = pgTable('empresas', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nomeEmpresa: varchar('nome_empresa', { length: 255 }).notNull(),
  emailContato: varchar('email_contato', { length: 255 }).notNull().unique(),
  senha: varchar('senha', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 18 }),
  endereco: text('endereco'),
  setor: varchar('setor', { length: 255 }),
  numeroColaboradores: integer('numero_colaboradores'),
  diasAcesso: integer('dias_acesso'),
  dataExpiracao: timestamp('data_expiracao', { withTimezone: true }),
  adminId: uuid('admin_id').references(() => admins.id),
  configuracoes: jsonb('configuracoes').default({}),
  ativa: boolean('ativa').default(true),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  plano: varchar('plano', { length: 50 }),
  statusAssinatura: varchar('status_assinatura', { length: 50 }).default('inativo'),
  tokenConvite: varchar('token_convite', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  adminIdx: index('idx_empresas_admin_id').on(table.adminId),
  emailIdx: index('idx_empresas_email').on(table.emailContato),
  ativaIdx: index('idx_empresas_ativa').on(table.ativa),
  stripeCustomerIdx: index('idx_empresas_stripe_customer').on(table.stripeCustomerId),
  dataExpiracaoIdx: index('idx_empresas_data_expiracao').on(table.dataExpiracao),
}));

export const colaboradores = pgTable('colaboradores', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  senha: varchar('senha', { length: 255 }).notNull(),
  cargo: varchar('cargo', { length: 255 }),
  departamento: varchar('departamento', { length: 255 }),
  avatar: text('avatar'),
  empresaId: uuid('empresa_id').references(() => empresas.id, { onDelete: 'cascade' }),
  permissoes: jsonb('permissoes').default({}),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  empresaIdx: index('idx_colaboradores_empresa_id').on(table.empresaId),
  emailIdx: index('idx_colaboradores_email').on(table.email),
  ativoIdx: index('idx_colaboradores_ativo').on(table.ativo),
}));

export const testes = pgTable('testes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  categoria: varchar('categoria', { length: 100 }),
  tempoEstimado: integer('tempo_estimado'),
  instrucoes: text('instrucoes'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nomeIdx: index('idx_testes_nome').on(table.nome),
  categoriaIdx: index('idx_testes_categoria').on(table.categoria),
}));

export const resultados = pgTable('resultados', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  testeId: uuid('teste_id').references(() => testes.id, { onDelete: 'cascade' }),
  usuarioId: uuid('usuario_id'),
  pontuacaoTotal: real('pontuacao_total'),
  tempoGasto: integer('tempo_gasto'),
  dataRealizacao: timestamp('data_realizacao', { withTimezone: true }).defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('concluido').notNull(),
  metadados: jsonb('metadados'),
  sessionId: varchar('session_id', { length: 255 }),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  colaboradorId: uuid('colaborador_id').references(() => colaboradores.id),
  empresaId: uuid('empresa_id').references(() => empresas.id),
  userEmail: varchar('user_email', { length: 255 }),
}, (table) => ({
  testeIdx: index('idx_resultados_teste_id').on(table.testeId),
  usuarioDataIdx: index('idx_resultados_usuario_data').on(table.usuarioId, table.dataRealizacao),
  statusIdx: index('idx_resultados_status').on(table.status),
}));

export type Admin = typeof admins.$inferSelect;
export type Empresa = typeof empresas.$inferSelect;
export type Colaborador = typeof colaboradores.$inferSelect;
export type Teste = typeof testes.$inferSelect;
export type Resultado = typeof resultados.$inferSelect;

export const insertAdminSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(1),
  senha: z.string().min(8),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export const insertEmpresaSchema = z.object({
  nomeEmpresa: z.string().min(1),
  emailContato: z.string().email(),
  senha: z.string().min(8),
  adminId: z.string().uuid().optional().nullable(),
  configuracoes: z.any().optional(),
  ativa: z.boolean().optional(),
});

export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;

export const insertColaboradorSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
  cargo: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  empresaId: z.string().uuid().optional().nullable(),
  permissoes: z.any().optional(),
  ativo: z.boolean().optional(),
});

export type InsertColaborador = z.infer<typeof insertColaboradorSchema>;

export const insertTesteSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  tempoEstimado: z.number().optional().nullable(),
  instrucoes: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
});

export type InsertTeste = z.infer<typeof insertTesteSchema>;

export const insertResultadoSchema = z.object({
  testeId: z.string().uuid(),
  usuarioId: z.string().uuid().optional().nullable(),
  pontuacaoTotal: z.number().optional().nullable(),
  tempoGasto: z.number().optional().nullable(),
  status: z.string().optional(),
  metadados: z.any().optional(),
  sessionId: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  colaboradorId: z.string().uuid().optional().nullable(),
  empresaId: z.string().uuid().optional().nullable(),
  userEmail: z.string().optional().nullable(),
});

export type InsertResultado = z.infer<typeof insertResultadoSchema>;

export const convitesEmpresa = pgTable('convites_empresa', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  token: varchar('token', { length: 255 }).notNull().unique(),
  nomeEmpresa: varchar('nome_empresa', { length: 255 }).notNull(),
  emailContato: varchar('email_contato', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 18 }),
  numeroColaboradores: integer('numero_colaboradores'),
  diasAcesso: integer('dias_acesso'),
  adminId: uuid('admin_id').references(() => admins.id),
  validade: timestamp('validade', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 50 }).default('pendente').notNull(),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenIdx: index('idx_convites_empresa_token').on(table.token),
  statusIdx: index('idx_convites_empresa_status').on(table.status),
  validadeIdx: index('idx_convites_empresa_validade').on(table.validade),
}));

export const convitesColaborador = pgTable('convites_colaborador', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  token: varchar('token', { length: 255 }).notNull().unique(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  cargo: varchar('cargo', { length: 255 }),
  departamento: varchar('departamento', { length: 255 }),
  empresaId: uuid('empresa_id').references(() => empresas.id, { onDelete: 'cascade' }),
  validade: timestamp('validade', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 50 }).default('pendente').notNull(),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenIdx: index('idx_convites_colaborador_token').on(table.token),
  empresaIdx: index('idx_convites_colaborador_empresa_id').on(table.empresaId),
  statusIdx: index('idx_convites_colaborador_status').on(table.status),
}));

export const perguntas = pgTable('perguntas', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  testeId: uuid('teste_id').references(() => testes.id, { onDelete: 'cascade' }).notNull(),
  texto: text('texto').notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  opcoes: jsonb('opcoes'),
  escalaMin: integer('escala_min'),
  escalaMax: integer('escala_max'),
  obrigatoria: boolean('obrigatoria').default(true),
  ordem: integer('ordem').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  testeIdx: index('idx_perguntas_teste_id').on(table.testeId),
}));

export const respostas = pgTable('respostas', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  resultadoId: uuid('resultado_id').references(() => resultados.id, { onDelete: 'cascade' }).notNull(),
  perguntaId: uuid('pergunta_id').references(() => perguntas.id, { onDelete: 'cascade' }).notNull(),
  valor: text('valor').notNull(),
  pontuacao: integer('pontuacao'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  resultadoIdx: index('idx_respostas_resultado_id').on(table.resultadoId),
  perguntaIdx: index('idx_respostas_pergunta_id').on(table.perguntaId),
}));

export type ConviteEmpresa = typeof convitesEmpresa.$inferSelect;
export type ConviteColaborador = typeof convitesColaborador.$inferSelect;
export type Pergunta = typeof perguntas.$inferSelect;
export type Resposta = typeof respostas.$inferSelect;

export const insertConviteEmpresaSchema = z.object({
  token: z.string(),
  nomeEmpresa: z.string().min(1),
  emailContato: z.string().email(),
  cnpj: z.string().optional().nullable(),
  numeroColaboradores: z.number().optional().nullable(),
  diasAcesso: z.number().optional().nullable(),
  adminId: z.string().uuid().optional().nullable(),
  validade: z.date(),
  status: z.string().optional(),
  metadados: z.any().optional(),
});

export type InsertConviteEmpresa = z.infer<typeof insertConviteEmpresaSchema>;

export const insertConviteColaboradorSchema = z.object({
  token: z.string(),
  nome: z.string().min(1),
  email: z.string().email(),
  cargo: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  empresaId: z.string().uuid().optional().nullable(),
  validade: z.date(),
  status: z.string().optional(),
  metadados: z.any().optional(),
});

export type InsertConviteColaborador = z.infer<typeof insertConviteColaboradorSchema>;

export const insertPerguntaSchema = z.object({
  testeId: z.string().uuid(),
  texto: z.string().min(1),
  tipo: z.string().min(1),
  opcoes: z.any().optional().nullable(),
  escalaMin: z.number().optional().nullable(),
  escalaMax: z.number().optional().nullable(),
  obrigatoria: z.boolean().optional(),
  ordem: z.number(),
});

export type InsertPergunta = z.infer<typeof insertPerguntaSchema>;

export const insertRespostaSchema = z.object({
  resultadoId: z.string().uuid(),
  perguntaId: z.string().uuid(),
  valor: z.string(),
  pontuacao: z.number().optional().nullable(),
});

export type InsertResposta = z.infer<typeof insertRespostaSchema>;

export const erpConfigurations = pgTable('erp_configurations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  empresaId: uuid('empresa_id').references(() => empresas.id, { onDelete: 'cascade' }).notNull(),
  erpType: varchar('erp_type', { length: 100 }).notNull(),
  apiUrl: text('api_url').notNull(),
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret'),
  configuracoes: jsonb('configuracoes').default({}),
  ativo: boolean('ativo').default(true),
  ultimaSincronizacao: timestamp('ultima_sincronizacao', { withTimezone: true }),
  statusConexao: varchar('status_conexao', { length: 50 }).default('nao_testado'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  empresaIdx: index('idx_erp_configurations_empresa_id').on(table.empresaId),
  erpTypeIdx: index('idx_erp_configurations_erp_type').on(table.erpType),
}));

export type ErpConfiguration = typeof erpConfigurations.$inferSelect;

export const insertErpConfigurationSchema = z.object({
  empresaId: z.string().uuid(),
  erpType: z.string().min(1),
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  apiSecret: z.string().optional().nullable(),
  configuracoes: z.any().optional(),
  ativo: z.boolean().optional(),
})

export type InsertErpConfiguration = z.infer<typeof insertErpConfigurationSchema>;

export const testeDisponibilidade = pgTable('teste_disponibilidade', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  colaboradorId: uuid('colaborador_id').references(() => colaboradores.id, { onDelete: 'cascade' }).notNull(),
  testeId: uuid('teste_id').references(() => testes.id, { onDelete: 'cascade' }).notNull(),
  empresaId: uuid('empresa_id').references(() => empresas.id, { onDelete: 'cascade' }).notNull(),
  disponivel: boolean('disponivel').default(true).notNull(),
  periodicidadeDias: integer('periodicidade_dias'),
  ultimaLiberacao: timestamp('ultima_liberacao', { withTimezone: true }),
  proximaDisponibilidade: timestamp('proxima_disponibilidade', { withTimezone: true }),
  historicoLiberacoes: jsonb('historico_liberacoes').default([]),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  colaboradorIdx: index('idx_teste_disp_colaborador_id').on(table.colaboradorId),
  testeIdx: index('idx_teste_disp_teste_id').on(table.testeId),
  empresaIdx: index('idx_teste_disp_empresa_id').on(table.empresaId),
  disponibilidadeIdx: index('idx_teste_disp_disponivel').on(table.disponivel),
  uniqueColabTeste: uniqueIndex('idx_teste_disp_colab_teste_unique').on(table.colaboradorId, table.testeId),
}));

export type TesteDisponibilidade = typeof testeDisponibilidade.$inferSelect;

export const insertTesteDisponibilidadeSchema = z.object({
  colaboradorId: z.string().uuid(),
  testeId: z.string().uuid(),
  empresaId: z.string().uuid(),
  disponivel: z.boolean().optional(),
  periodicidadeDias: z.number().optional().nullable(),
  ultimaLiberacao: z.date().optional().nullable(),
  proximaDisponibilidade: z.date().optional().nullable(),
  historicoLiberacoes: z.any().optional(),
  metadados: z.any().optional(),
});

export type InsertTesteDisponibilidade = z.infer<typeof insertTesteDisponibilidadeSchema>;

export const updateTesteDisponibilidadeSchema = z.object({
  disponivel: z.boolean().optional(),
  periodicidadeDias: z.number().optional().nullable(),
  ultimaLiberacao: z.date().optional().nullable(),
  proximaDisponibilidade: z.date().optional().nullable(),
  historicoLiberacoes: z.any().optional(),
  metadados: z.any().optional(),
});

// Tabela de Progresso de Cursos
export const cursoProgresso = pgTable('curso_progresso', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  colaboradorId: uuid('colaborador_id').references(() => colaboradores.id, { onDelete: 'cascade' }).notNull(),
  cursoId: varchar('curso_id', { length: 100 }).notNull(),
  cursoSlug: varchar('curso_slug', { length: 255 }).notNull(),
  modulosCompletados: jsonb('modulos_completados').default([]).notNull(),
  totalModulos: integer('total_modulos').notNull(),
  progressoPorcentagem: integer('progresso_porcentagem').default(0).notNull(),
  avaliacaoFinalRealizada: boolean('avaliacao_final_realizada').default(false).notNull(),
  avaliacaoFinalPontuacao: integer('avaliacao_final_pontuacao'),
  tentativasAvaliacao: integer('tentativas_avaliacao').default(0).notNull(),
  dataInicio: timestamp('data_inicio', { withTimezone: true }).defaultNow().notNull(),
  dataUltimaAtualizacao: timestamp('data_ultima_atualizacao', { withTimezone: true }).defaultNow().notNull(),
  dataConclusao: timestamp('data_conclusao', { withTimezone: true }),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  colaboradorIdx: index('idx_curso_progresso_colaborador_id').on(table.colaboradorId),
  cursoIdx: index('idx_curso_progresso_curso_id').on(table.cursoId),
  uniqueColabCurso: uniqueIndex('idx_curso_progresso_colab_curso_unique').on(table.colaboradorId, table.cursoId),
}));

export type CursoProgresso = typeof cursoProgresso.$inferSelect;

export const insertCursoProgressoSchema = z.object({
  colaboradorId: z.string().uuid(),
  cursoId: z.string(),
  cursoSlug: z.string(),
  modulosCompletados: z.any().optional(),
  totalModulos: z.number(),
  progressoPorcentagem: z.number().optional(),
  avaliacaoFinalRealizada: z.boolean().optional(),
  avaliacaoFinalPontuacao: z.number().optional().nullable(),
  tentativasAvaliacao: z.number().optional(),
  dataConclusao: z.date().optional().nullable(),
  metadados: z.any().optional(),
});

export type InsertCursoProgresso = z.infer<typeof insertCursoProgressoSchema>;

// Tabela de Certificados de Cursos
export const cursoCertificados = pgTable('curso_certificados', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  colaboradorId: uuid('colaborador_id').references(() => colaboradores.id, { onDelete: 'cascade' }).notNull(),
  cursoId: varchar('curso_id', { length: 100 }).notNull(),
  cursoSlug: varchar('curso_slug', { length: 255 }).notNull(),
  cursoTitulo: varchar('curso_titulo', { length: 500 }).notNull(),
  colaboradorNome: varchar('colaborador_nome', { length: 255 }).notNull(),
  cargaHoraria: varchar('carga_horaria', { length: 50 }).notNull(),
  dataEmissao: timestamp('data_emissao', { withTimezone: true }).defaultNow().notNull(),
  codigoAutenticacao: varchar('codigo_autenticacao', { length: 100 }).notNull().unique(),
  qrCodeUrl: text('qr_code_url'),
  assinaturaDigital: text('assinatura_digital'),
  validado: boolean('validado').default(true).notNull(),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  colaboradorIdx: index('idx_curso_certificados_colaborador_id').on(table.colaboradorId),
  cursoIdx: index('idx_curso_certificados_curso_id').on(table.cursoId),
  codigoIdx: index('idx_curso_certificados_codigo').on(table.codigoAutenticacao),
  uniqueColabCurso: uniqueIndex('idx_curso_certificados_colab_curso_unique').on(table.colaboradorId, table.cursoId),
}));

export type CursoCertificado = typeof cursoCertificados.$inferSelect;

export const insertCursoCertificadoSchema = z.object({
  colaboradorId: z.string().uuid(),
  cursoId: z.string(),
  cursoSlug: z.string(),
  cursoTitulo: z.string(),
  colaboradorNome: z.string(),
  cargaHoraria: z.string(),
  codigoAutenticacao: z.string(),
  qrCodeUrl: z.string().optional().nullable(),
  assinaturaDigital: z.string().optional().nullable(),
  validado: z.boolean().optional(),
  metadados: z.any().optional(),
});

export type InsertCursoCertificado = z.infer<typeof insertCursoCertificadoSchema>;

// Tabela de Avaliações Finais de Cursos
export const cursoAvaliacoes = pgTable('curso_avaliacoes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  colaboradorId: uuid('colaborador_id').references(() => colaboradores.id, { onDelete: 'cascade' }).notNull(),
  cursoId: varchar('curso_id', { length: 100 }).notNull(),
  cursoSlug: varchar('curso_slug', { length: 255 }).notNull(),
  respostas: jsonb('respostas').notNull(),
  pontuacao: integer('pontuacao').notNull(),
  totalQuestoes: integer('total_questoes').notNull(),
  aprovado: boolean('aprovado').notNull(),
  tempoGasto: integer('tempo_gasto'),
  dataRealizacao: timestamp('data_realizacao', { withTimezone: true }).defaultNow().notNull(),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  colaboradorIdx: index('idx_curso_avaliacoes_colaborador_id').on(table.colaboradorId),
  cursoIdx: index('idx_curso_avaliacoes_curso_id').on(table.cursoId),
  aprovadoIdx: index('idx_curso_avaliacoes_aprovado').on(table.aprovado),
}));

export type CursoAvaliacao = typeof cursoAvaliacoes.$inferSelect;

export const insertCursoAvaliacaoSchema = z.object({
  colaboradorId: z.string().uuid(),
  cursoId: z.string(),
  cursoSlug: z.string(),
  respostas: z.any(),
  pontuacao: z.number(),
  totalQuestoes: z.number(),
  aprovado: z.boolean(),
  tempoGasto: z.number().optional().nullable(),
  metadados: z.any().optional(),
});

export type InsertCursoAvaliacao = z.infer<typeof insertCursoAvaliacaoSchema>;

// Tabela de Disponibilidade de Cursos (Sistema de Controle de Acesso)
export const cursoDisponibilidade = pgTable('curso_disponibilidade', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  colaboradorId: uuid('colaborador_id').references(() => colaboradores.id, { onDelete: 'cascade' }).notNull(),
  cursoId: varchar('curso_id', { length: 100 }).notNull(),
  empresaId: uuid('empresa_id').references(() => empresas.id, { onDelete: 'cascade' }).notNull(),
  disponivel: boolean('disponivel').default(false).notNull(),
  periodicidadeDias: integer('periodicidade_dias'),
  ultimaLiberacao: timestamp('ultima_liberacao', { withTimezone: true }),
  proximaDisponibilidade: timestamp('proxima_disponibilidade', { withTimezone: true }),
  liberadoPor: uuid('liberado_por'),
  historicoLiberacoes: jsonb('historico_liberacoes').default([]),
  metadados: jsonb('metadados').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  colaboradorIdx: index('idx_curso_disp_colaborador_id').on(table.colaboradorId),
  cursoIdx: index('idx_curso_disp_curso_id').on(table.cursoId),
  empresaIdx: index('idx_curso_disp_empresa_id').on(table.empresaId),
  disponibilidadeIdx: index('idx_curso_disp_disponivel').on(table.disponivel),
  uniqueColabCurso: uniqueIndex('idx_curso_disp_colab_curso_unique').on(table.colaboradorId, table.cursoId),
}));

export type CursoDisponibilidade = typeof cursoDisponibilidade.$inferSelect;

export const insertCursoDisponibilidadeSchema = z.object({
  colaboradorId: z.string().uuid(),
  cursoId: z.string(),
  empresaId: z.string().uuid(),
  disponivel: z.boolean().optional(),
  periodicidadeDias: z.number().optional().nullable(),
  ultimaLiberacao: z.date().optional().nullable(),
  proximaDisponibilidade: z.date().optional().nullable(),
  liberadoPor: z.string().uuid().optional().nullable(),
  historicoLiberacoes: z.any().optional(),
  metadados: z.any().optional(),
});

export type InsertCursoDisponibilidade = z.infer<typeof insertCursoDisponibilidadeSchema>;

export const updateCursoDisponibilidadeSchema = z.object({
  disponivel: z.boolean().optional(),
  periodicidadeDias: z.number().optional().nullable(),
  ultimaLiberacao: z.date().optional().nullable(),
  proximaDisponibilidade: z.date().optional().nullable(),
  liberadoPor: z.string().uuid().optional().nullable(),
  historicoLiberacoes: z.any().optional(),
  metadados: z.any().optional(),
});
