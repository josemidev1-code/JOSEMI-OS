// src/worker/messages.js: fuente de JOSEMI-OS.
function cleanMessages(input) {
  if (!Array.isArray(input)) return [];
  const cleaned = [];
  let pending = new Set();
  const allowed = new Set(TOOLS.map((t) => t.function.name));

  for (const m of input.slice(-16)) {
    if (!m || typeof m !== "object") continue;
    if (m.role === "user" && typeof m.content === "string" && m.content.trim()) {
      cleaned.push({ role: "user", content: m.content.slice(0, 500) });
      pending = new Set();
    } else if (m.role === "assistant") {
      const message = {
        role: "assistant",
        content: typeof m.content === "string" ? m.content.slice(0, 3000) : null,
      };
      if (Array.isArray(m.tool_calls)) {
        const calls = m.tool_calls
          .slice(0, 2)
          .filter(
            (c) =>
              typeof c?.id === "string" &&
              c.id.length <= 100 &&
              allowed.has(c?.function?.name) &&
              typeof c.function.arguments === "string",
          )
          .map((c) => ({
            id: c.id,
            type: "function",
            function: { name: c.function.name, arguments: c.function.arguments.slice(0, 600) },
          }));
        if (calls.length) {
          message.tool_calls = calls;
          pending = new Set(calls.map((c) => c.id));
        }
      }
      if (message.content !== null || message.tool_calls) cleaned.push(message);
    } else if (m.role === "tool" && pending.has(m.tool_call_id) && typeof m.content === "string") {
      cleaned.push({
        role: "tool",
        tool_call_id: m.tool_call_id,
        content: m.content.slice(0, 3500),
      });
      pending.delete(m.tool_call_id);
    }
  }
  return cleaned;
}
