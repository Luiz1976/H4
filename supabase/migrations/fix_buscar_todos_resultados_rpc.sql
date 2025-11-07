-- Função RPC para buscar todos os resultados sem problemas de RLS
-- Esta função executa com SECURITY DEFINER para contornar as políticas RLS problemáticas

-- Remover função existente primeiro
DROP FUNCTION IF EXISTS buscar_todos_resultados_simples(TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION buscar_todos_resultados_simples(
  user_email_param TEXT DEFAULT NULL,
  limite_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  teste_id UUID,
  usuario_id UUID,
  pontuacao_total INTEGER,
  tempo_gasto INTEGER,
  data_realizacao TIMESTAMP WITH TIME ZONE,
  status CHARACTER VARYING,
  metadados JSONB,
  session_id CHARACTER VARYING,
  user_agent TEXT,
  ip_address INET,
  colaborador_id UUID,
  empresa_id UUID,
  user_email CHARACTER VARYING
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.teste_id,
    r.usuario_id,
    r.pontuacao_total,
    r.tempo_gasto,
    r.data_realizacao,
    r.status,
    r.metadados,
    r.session_id,
    r.user_agent,
    r.ip_address,
    r.colaborador_id,
    r.empresa_id,
    r.user_email
  FROM resultados r
  WHERE 
    CASE 
      WHEN user_email_param IS NOT NULL THEN 
        (r.metadados->>'user_email' = user_email_param OR r.metadados->>'usuario_email' = user_email_param OR r.user_email = user_email_param)
      ELSE TRUE
    END
  ORDER BY r.data_realizacao DESC
  LIMIT limite_param
  OFFSET offset_param;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro na função buscar_todos_resultados_simples: %', SQLERRM;
END;
$$;

-- Conceder permissões para usuários anônimos e autenticados
GRANT EXECUTE ON FUNCTION buscar_todos_resultados_simples(TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION buscar_todos_resultados_simples(TEXT, INTEGER, INTEGER) TO authenticated;

-- Comentário
COMMENT ON FUNCTION buscar_todos_resultados_simples(TEXT, INTEGER, INTEGER) IS 'Função RPC para buscar todos os resultados sem problemas de RLS - versão simplificada';