// src/worker/chat.js: fuente de JOSEMI-OS.
async function chat(payload, env, origin) {
  if (!env.GROQ_API_KEY)
    return json({ error: "Milo no está disponible temporalmente." }, 503, origin);
  const messages = cleanMessages(payload.messages);
  if (!messages.some((m) => m.role === "user")) {
    return json({ error: "Falta el mensaje del usuario" }, 400, origin);
  }

  const enabledTools = env.TAVILY_API_KEY
    ? TOOLS
    : TOOLS.filter((t) => t.function.name !== "web_search");

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: {
        Authorization: "Bearer " + env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
        tools: enabledTools,
        tool_choice: "auto",
        parallel_tool_calls: false,
        temperature: 0.4,
        max_completion_tokens: 1400,
        reasoning_effort: "low",
      }),
    });
    if (!r.ok) {
      console.error("Groq HTTP", r.status);
      return json(
        { error: "El proveedor de IA no ha respondido correctamente", provider_status: r.status },
        502,
        origin,
      );
    }
    const data = await r.json();
    const upstream = data.choices?.[0]?.message;
    if (!upstream) return json({ error: "Respuesta vacía del modelo" }, 502, origin);
    // No exposem camps interns del proveïdor (p. ex. reasoning).
    // El frontend sols necessita contingut i crides a ferramentes.
    const message = {
      role: "assistant",
      content: typeof upstream.content === "string" ? upstream.content : null,
    };
    if (Array.isArray(upstream.tool_calls)) {
      const valid = upstream.tool_calls
        .slice(0, 2)
        .filter(
          (call) =>
            typeof call?.id === "string" &&
            TOOLS.some((t) => t.function.name === call?.function?.name) &&
            typeof call?.function?.arguments === "string",
        )
        .map((call) => ({
          id: call.id,
          type: "function",
          function: {
            name: call.function.name,
            arguments: call.function.arguments,
          },
        }));
      if (valid.length) message.tool_calls = valid;
    }
    return json({ message }, 200, origin);
  } catch (error) {
    console.error("Groq network failure", error?.name);
    if (timedOut(error))
      return json(
        { error: "La consulta de IA ha tardado demasiado. Inténtalo de nuevo." },
        504,
        origin,
      );
    return json({ error: "No se puede conectar con el modelo de IA" }, 502, origin);
  }
}
