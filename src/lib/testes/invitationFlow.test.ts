// src/lib/testes/invitationFlow.test.ts
import { describe, it, expect, vi } from 'vitest';

// Mock das dependências antes de qualquer importação
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

import { invitationService } from '@/services/invitationService';
import { supabase } from '@/lib/supabase';

describe('Fluxo de Validação de Convites - Teste de Integração', () => {

  it('Deve retornar sucesso para um token válido e não expirado', async () => {
    // Arrange: Configuração do Mock
    const tokenValido = 'token-valido-123';
    const agora = new Date();
    const dataValidade = new Date(agora.setDate(agora.getDate() + 7)); // Válido por 7 dias

    const mockConvite = {
      token: tokenValido,
      status: 'pendente',
      validade: dataValidade.toISOString(),
      nome_empresa: 'Empresa Teste',
      email_contato: 'teste@empresa.com',
    };

    // Simula o retorno do Supabase
    vi.mocked(supabase.from('convites_empresa').select().eq('token', tokenValido).single)
      .mockResolvedValue({ data: mockConvite, error: null });

    // Act: Execução da lógica
    const resultado = await invitationService.buscarConvitePorToken(tokenValido, 'empresa');

    // Assert: Verificação
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Convite válido.');
    expect(resultado.convite).toEqual(mockConvite);
  });

  it('Deve retornar falha para um token inválido', async () => {
    // Arrange
    const tokenInvalido = 'token-que-nao-existe';
    
    vi.mocked(supabase.from('convites_empresa').select().eq('token', tokenInvalido).single)
      .mockResolvedValue({ data: null, error: { message: 'not found', details: '', hint: '', code: '404' } });

    // Act
    const resultado = await invitationService.buscarConvitePorToken(tokenInvalido, 'empresa');

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Convite não encontrado.');
  });

  it('Deve retornar falha para um convite já utilizado', async () => {
    // Arrange
    const tokenUsado = 'token-usado-456';
    const agora = new Date();
    const dataValidade = new Date(agora.setDate(agora.getDate() + 7));

    const mockConvite = {
      token: tokenUsado,
      status: 'usado', // Status que indica que já foi utilizado
      validade: dataValidade.toISOString(),
    };

    vi.mocked(supabase.from('convites_empresa').select().eq('token', tokenUsado).single)
      .mockResolvedValue({ data: mockConvite, error: null });

    // Act
    const resultado = await invitationService.buscarConvitePorToken(tokenUsado, 'empresa');

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Convite expirado ou já utilizado.');
  });

  it('Deve retornar falha para um convite expirado', async () => {
    // Arrange
    const tokenExpirado = 'token-expirado-789';
    const agora = new Date();
    const dataValidade = new Date(agora.setDate(agora.getDate() - 1)); // Data no passado

    const mockConvite = {
      token: tokenExpirado,
      status: 'pendente',
      validade: dataValidade.toISOString(),
    };

    vi.mocked(supabase.from('convites_empresa').select().eq('token', tokenExpirado).single)
      .mockResolvedValue({ data: mockConvite, error: null });

    // Act
    const resultado = await invitationService.buscarConvitePorToken(tokenExpirado, 'empresa');

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Convite expirado ou já utilizado.');
  });
});