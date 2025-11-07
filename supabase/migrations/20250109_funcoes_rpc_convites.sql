CREATE OR REPLACE FUNCTION get_convite_status_by_email(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM public.convites_colaborador
  WHERE email = p_email
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN v_status;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_convite_status(p_email TEXT, p_status TEXT)
RETURNS TABLE (id UUID, email TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  UPDATE public.convites_colaborador
  SET status = p_status
  WHERE email = p_email
  RETURNING convites_colaborador.id, convites_colaborador.email, convites_colaborador.status;
END;
$$ LANGUAGE plpgsql;