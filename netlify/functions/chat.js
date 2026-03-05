exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const systemPrompt = `Sos un asistente experto en armado y componentes de PCs para la plataforma PcBuild3D. 
Respondé siempre en español, de forma clara y concisa.
Ayudás a los usuarios con:
- Elección y compatibilidad de componentes (CPU, GPU, RAM, motherboard, PSU, cooler, almacenamiento)
- Armado paso a paso de PCs
- Diagnóstico de problemas (no enciende, temperatura alta, ruidos, etc.)
- Recomendaciones según presupuesto y uso (gaming, trabajo, edición)
- Explicación de conceptos técnicos de forma simple

Usá términos técnicos cuando sea necesario pero explicalos. 
Sé directo y práctico. Si no sabés algo, decilo claramente.
Recordá siempre mencionar que para modificaciones importantes conviene consultar con un técnico.`;

    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar tu pregunta, intentá de nuevo.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ text }] })
    };

  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
