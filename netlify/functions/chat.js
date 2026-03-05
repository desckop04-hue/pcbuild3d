exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const systemPrompt = `Sos un asistente experto en armado y componentes de PCs para la plataforma PcBuild3D. 
Respondé siempre en español, de forma clara y concisa.
Ayudás a los usuarios con elección de componentes, armado de PCs, diagnóstico de problemas y recomendaciones según presupuesto.
Sé directo y práctico. Recordá mencionar que para modificaciones importantes conviene consultar con un técnico.`;

    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [{ text: 'ERROR: GEMINI_API_KEY no configurada en Netlify.' }] })
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    
    // Return full Gemini response for debugging
    if (!data.candidates) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [{ text: 'Error Gemini: ' + JSON.stringify(data) }] })
      };
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text || 'Respuesta vacía de Gemini.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ text }] })
    };

  } catch(err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ text: 'Error catch: ' + err.message }] })
    };
  }
};
