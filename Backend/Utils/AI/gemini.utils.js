const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const allowedTypes = ['multiple_choice', 'true_false', 'short_answer'];
const allowedDifficulties = ['easy', 'medium', 'hard'];

const buildExtractionPrompt = (fileName = '') => `
You are Quizzle's question extraction engine.

Read the uploaded file${fileName ? ` named "${fileName}"` : ''} and extract every usable quiz or exam question.

Return ONLY raw JSON. Do not include markdown, code fences, comments, explanations, or surrounding text.

The JSON must be an array. Every item must match this exact shape:
[
  {
    "questionText": "string",
    "type": "multiple_choice | true_false | short_answer",
    "options": [
      { "label": "A", "text": "string", "isCorrect": false },
      { "label": "B", "text": "string", "isCorrect": true }
    ],
    "answer": "string",
    "difficulty": "easy | medium | hard"
  }
]

Rules:
- Use "multiple_choice" when choices are present.
- Use "true_false" only for true/false questions.
- Use "short_answer" for open-ended or fill-in questions.
- For multiple_choice, include all visible choices in options and mark exactly one correct option when the file provides or implies the answer. Set answer to the correct option label or text.
- For true_false, options must be an empty array and answer must be "true" or "false".
- For short_answer, options must be an empty array and answer must be the expected answer if available, otherwise an empty string.
- Infer difficulty as easy, medium, or hard from the question complexity.
- Exclude unusable, duplicated, or incomplete questions.
`;

const cleanJsonText = (content) => {
  const trimmed = String(content || '').trim().replace(/```json|```/g, '').trim();
  const jsonMatch = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
  return jsonMatch ? jsonMatch[0] : trimmed;
};

const normalizeDifficulty = (difficulty) => {
  const value = String(difficulty || '').toLowerCase().trim();
  return allowedDifficulties.includes(value) ? value : 'medium';
};

const normalizeType = (type, options = []) => {
  const value = String(type || '').toLowerCase().trim();
  if (allowedTypes.includes(value)) return value;
  return Array.isArray(options) && options.length > 0 ? 'multiple_choice' : 'short_answer';
};

const normalizeOptions = (options, type) => {
  if (type !== 'multiple_choice') return [];

  return (Array.isArray(options) ? options : [])
    .filter((option) => option && (option.text || option.label))
    .map((option, index) => ({
      label: String(option.label || String.fromCharCode(65 + index)).trim(),
      text: String(option.text || '').trim(),
      isCorrect: Boolean(option.isCorrect)
    }));
};

const normalizeQuestion = (question) => {
  const type = normalizeType(question?.type, question?.options);
  const options = normalizeOptions(question?.options, type);

  return {
    questionText: String(question?.questionText || question?.content || '').trim(),
    type,
    options,
    answer: String(question?.answer || '').trim(),
    difficulty: normalizeDifficulty(question?.difficulty)
  };
};

const parseGeminiQuestions = (content) => {
  const cleanedContent = cleanJsonText(content);
  const parsed = JSON.parse(cleanedContent);

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response must be a JSON array');
  }

  return parsed
    .map(normalizeQuestion)
    .filter((question) => question.questionText && allowedTypes.includes(question.type));
};

export const extractQuestionsWithGemini = async ({ apiKey, fileBuffer, mimeType, fileName }) => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  if (!fileBuffer) {
    throw new Error('A file buffer is required');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildExtractionPrompt(fileName) },
            {
              inline_data: {
                mime_type: mimeType || 'application/octet-stream',
                data: fileBuffer.toString('base64')
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Gemini API error: ${errorMessage}`);
  }

  const content = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!content) {
    throw new Error('Gemini returned an empty response');
  }

  return parseGeminiQuestions(content);
};
