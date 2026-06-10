import openAICfg from "../../Configs/openai.configs.js";

export const openAIGenerateQuestionsFromText = async (ocrText) => {
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

  const response = await openAICfg.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You generate structured exam questions in strict JSON format."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  let content = response.choices[0].message.content;

  // 🔥 CLEAN RESPONSE (very important)
  content = content.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(content);

    // ✅ Optional: enforce structure safety
    return parsed.map(q => ({
      questionText: q.questionText,
      type: "multiple_choice",
      difficulty: q.difficulty || "medium",
      options: q.options?.map(opt => ({
        label: opt.label,
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect)
      })) || []
    }));

  } catch (error) {
    console.error("AI RAW OUTPUT:", content);
    throw new Error("Failed to parse AI response");
  }
};