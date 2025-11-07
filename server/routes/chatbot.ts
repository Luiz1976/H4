import express from 'express';
import { generateChatResponse, generateWelcomeMessage } from '../services/chatbotService';
import { z } from 'zod';

const router = express.Router();

const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

router.post('/message', async (req, res) => {
  try {
    const validationResult = chatMessageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validationResult.error.issues 
      });
    }

    const { message, chatHistory } = validationResult.data;

    const response = await generateChatResponse(message, chatHistory);

    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no chatbot:', error);
    res.status(500).json({ 
      error: 'Erro ao processar mensagem',
      response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
    });
  }
});

router.get('/welcome', async (req, res) => {
  try {
    const welcomeMessage = await generateWelcomeMessage();
    res.json({ message: welcomeMessage });
  } catch (error) {
    console.error('Erro ao gerar mensagem de boas-vindas:', error);
    res.status(500).json({ error: 'Erro ao gerar mensagem de boas-vindas' });
  }
});

export default router;
