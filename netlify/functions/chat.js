exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `Sos un asistente experto en armado y componentes de PCs para la plataforma PcBuild3D. 
Respondé siempre en español, de forma clara y concisa.
Ayudás a los usuarios con:
- Elección y compatibilidad de componentes (CPU, GPU, RAM, motherboard, PSU, cooler, almacenamiento)
- Armado paso a paso de PCs
- Diagnóstico de problemas (no enciende, temperatura alta, ruidos, etc.)
- Recomendaciones según presupuesto y uso (gaming, trabajo, edición)
- Explicación de conceptos técnicos de forma simple

Usá términos técnicos cuando sea necesario pero explicalos. 
Sé directo y práctico. Si no sabés algo, decilo claramente.
Recordá siempre mencionar que para modificaciones importantes conviene consultar con un técnico.`,
        messages: messages
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
