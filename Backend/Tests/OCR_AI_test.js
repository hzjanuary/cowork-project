import { extractTextFromImage } from '../Utils/OCR/OCR.utils.js'
import { openAIGenerateQuestionsFromText } from '../Utils/AI/openAI.utils.js'
import { ollamaGenerateQuestionsFromText } from '../Utils/AI/ollamaAI.utils.js'

const testOCRAndAI = async () => {
    try {
        // const imgPath = './Tests/example.png';
        // const imgPath1 = './Tests/example1.jpg';
        const imgPath2 = './Tests/example2.jpg';
        // const imgPath3 = './Tests/example3.jpg';

        console.log("🔍 Running OCR...");
        // const text = await extractTextFromImage(imgPath);
        // const text1 = await extractTextFromImage(imgPath1);
        const text2 = await extractTextFromImage(imgPath2);
        // const text3 = await extractTextFromImage(imgPath3);

        console.log("\n===== OCR RESULT =====\n");
        // console.log(text);
        // console.log(text1);
        console.log(text2);
        // console.log(text3);

        // console.log("\n🤖 Sending to OpenAI...\n");
        // const openaiQuestions = await openAIGenerateQuestionsFromText(text);

        // console.log("\n🤖 Sending to Ollama...\n");
        // const questions = await ollamaGenerateQuestionsFromText(text);

        // console.log("\n===== AI QUESTIONS =====\n");
        // console.log(JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testOCRAndAI()