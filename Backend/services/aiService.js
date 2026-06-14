const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

exports.generateDocumentSummary = async (filePath) => {
    // 1. Upload the physical PDF file directly to Gemini's secure server
    const uploadResponse = await fileManager.uploadFile(filePath, {
        mimeType: "application/pdf",
        displayName: "Study Document",
    });

    // 2. Ask Gemini to read the file and summarize it
    const prompt = `
    Analyze this educational document and provide a structured summary.
    Format your response strictly with these headings:
    
    KEY POINTS:
    - [Point 1]
    
    IMPORTANT CONCEPTS:
    - [Concept 1]
    
    QUICK REVISION NOTES:
    - [Note 1]
    `;

    const result = await model.generateContent([
        {
            fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri
            }
        },
        prompt
    ]);

    // 3. Immediately clean up and delete the file from Google's servers
    await fileManager.deleteFile(uploadResponse.file.name);

    return result.response.text();
};

exports.explainConcept = async (concept) => {
    const prompt = `
    You are an expert tutor. Explain the concept "${concept}".
    Format your response strictly with these headings:
    
    DEFINITION:
    [Clear definition]
    
    EXPLANATION:
    [Simple, intuitive explanation]
    
    EXAMPLES:
    - [Example 1]
    
    PRACTICAL USE CASES:
    - [Use case 1]
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
};