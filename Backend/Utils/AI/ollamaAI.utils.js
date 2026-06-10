import 'dotenv/config';

export const ollamaGenerateQuestionsFromText = async (ocrText) => {
  const prompt = `
You are an AI that converts OCR text into structured exam questions.

IMPORTANT RULES:
- Return ONLY valid JSON (no explanation, no markdown)
- Follow EXACT schema below
- Do NOT include extra fields

SCHEMA:
[
  {
    "questionText": "string",
    "type": "multiple_choice",
    "difficulty": "easy | medium | hard",
    "options": [
      {
        "label": "A",
        "text": "string",
        "isCorrect": true
      }
    ]
  }
]

REQUIREMENTS:
- Generate 4 options (A, B, C, D) for each question
- Only ONE correct answer
- Always set type = "multiple_choice"
- Difficulty should be inferred from question complexity
- If OCR text is unclear, do your best to interpret it

TEXT:
${ocrText}
`;

  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const modelName = process.env.OLLAMA_MODEL || 'llama3:8b';

  try {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.response;

    // 🔥 CLEAN RESPONSE (very important)
    content = content.replace(/```json|```/g, "").trim();
    
    // Extract JSON from the response if it contains extra text
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Fix common JSON issues
    content = content
      .replace(/,\s*}/g, '}')  // Remove trailing commas before }
      .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
      .replace(/([{,]\s*"[^"]*":\s*)'/g, '$1"')  // Replace single quotes with double quotes in values
      .replace(/:\s*'([^']*)'/g, ': "$1"');  // Fix single-quoted values

    const parsed = JSON.parse(content);

    // ✅ Enforce structure safety
    return Array.isArray(parsed) ? parsed.map(q => ({
      questionText: String(q.questionText || '').trim(),
      type: "multiple_choice",
      difficulty: (q.difficulty || "medium").toLowerCase(),
      options: (Array.isArray(q.options) ? q.options : []).map(opt => ({
        label: String(opt.label || '').trim(),
        text: String(opt.text || '').trim(),
        isCorrect: Boolean(opt.isCorrect)
      }))
    })) : [];

  } catch (error) {
    console.error("AI RAW OUTPUT:", error.message);
    throw new Error("Failed to process Ollama response: " + error.message);
  }
};