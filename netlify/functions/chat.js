exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [{ text: 'ERROR: GROQ_API_KEY no configurada en Netlify.' }] })
      };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `Sos un asistente experto en armado y componentes de PCs para la plataforma PcBuild3D. 
Respondé siempre en español, de forma clara y concisa.
Ayudás a los usuarios con elección de componentes, compatibilidad, armado de PCs, diagnóstico de problemas y recomendaciones según presupuesto.
Sé directo y práctico. Recordá mencionar que para modificaciones importantes conviene consultar con un técnico.`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [{ text: 'Error Groq: ' + JSON.stringify(data) }] })
      };
    }

    const text = data.choices[0]?.message?.content || 'Respuesta vacía.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ text }] })
    };

  } catch(err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ text: 'Error: ' + err.message }] })
    };
  }
};
