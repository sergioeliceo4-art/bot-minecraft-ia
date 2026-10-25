const bedrock = require('bedrock-protocol');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();

function iniciarBot() {
  const hostIP = process.env.MC_HOST || '127.0.0.1';
  const portNum = parseInt(process.env.MC_PORT || '19132');

  console.log(`Intentando conectar el bot a ${hostIP}:${portNum}...`);

  const client = bedrock.createClient({
    host: hostIP,
    port: portNum,
    username: 'BotIA',
    offline: true,
    skipPing: true // Esto evita que falle buscando el servidor antes de entrar
  });

  client.on('spawn', () => {
    console.log('¡El bot se ha conectado exitosamente al servidor!');
  });

  client.on('error', (err) => {
    console.log('Aviso de conexión de Minecraft:', err.message);
  });

  client.on('text', async (packet) => {
    if (packet.source_name === 'BotIA') return;
    
    console.log(`[Chat recibido] ${packet.source_name}: ${packet.message}`);

    if (packet.message.includes('BotIA') || packet.message.startsWith('!ia')) {
      try {
        const promptText = `Eres un NPC inteligente y un compañero ayudante dentro de un juego de Minecraft. Responde de forma muy corta, útil y amigable en español al siguiente mensaje de un jugador: "${packet.message}"`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
        });

        const respuestaIA = response.text || '¡Hola! Estoy listo para ayudarte.';

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
}

iniciarBot();
