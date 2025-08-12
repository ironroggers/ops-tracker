// Lightweight chat API shim. Replace the internals later with a real fetch
// without changing the call sites.

/**
 * Send the user's prompt to the assistant.
 * @param {string} prompt - The user's input text.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ messages: Array<{ role: 'assistant' | 'user', text: string }> }>}
 */
export async function sendActionPrompt(prompt, options = {}) {
  const { signal } = options;

  // Simulate a small network/processing delay
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 600);
    if (signal) {
      const onAbort = () => {
        clearTimeout(timer);
        const abortError = new DOMException("Aborted", "AbortError");
        reject(abortError);
      };
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });

  // Return a deterministic assistant response for now
  const assistantText =
    "Let me do a deep dive into the month on month increased maintenance cost. As soon as my analysis is complete, I'll let you know";

  return {
    messages: [{ role: "assistant", text: assistantText }],
  };
}
