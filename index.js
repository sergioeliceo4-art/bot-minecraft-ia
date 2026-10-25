const bedrock = require('bedrock-protocol');
const { GoogleGenAI } = require('@google/genai');

// Inicializamos la IA de Gemini usando la variable de entorno de Render
const ai = new GoogleGenAI();

// Configuración del cliente de Minecraft Bedrock
const client = bedrock.createClient({
  host: process.env.MC_HOST || '127.0.0.1',
  port: parseInt(process.env.MC_PORT || '19132'),
  username: 'BotIA',
  offline: true
});

client.on('spawn', () => {
  console.log('¡El bot se ha conectado al mundo de Minecraft!');
});

// Escuchar los mensajes del chat dentro del juego
client.on('text', async (packet) => {
  // Evitamos que el bot se responda a sí mismo
  if (packet.source_name === 'BotIA') return;
  
  console.log(`[Chat recibido] ${packet.source_name}: ${packet.message}`);

  // Si alguien le habla al bot, le preguntamos a Gemini qué responder
  if (packet.message.includes('BotIA') || packet.message.startsWith('!ia')) {
    try {
      const promptText = `Eres un NPC inteligente y un compañero ayudante dentro de un juego de Minecraft Bedrock. Responde de forma muy corta, útil y amigable en español al siguiente mensaje de un jugador: "${packet.message}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
      });

      const respuestaIA = response.text || '¡Hola! Estoy listo para ayudarte.';

      // Enviamos la respuesta de la IA al chat de Minecraft
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: 'BotIA',
        message: respuestaIA,
        xuid: '',
        platform_chat_id: ''
      });

    } catch (error) {
      console.error('Error al consultar a Gemini:', error);
    }
  }
});
