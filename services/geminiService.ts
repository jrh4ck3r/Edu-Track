
import { GoogleGenAI, Type } from "@google/genai";
import { Mark, Feedback } from "../types";
import { SUBJECTS_LIST } from "../constants";

export const getAcademicInsights = async (marks: Mark[], feedback: Feedback[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const marksSummary = marks.map(m => {
    const subject = SUBJECTS_LIST.find(s => s.id === m.subjectId)?.name || 'Unknown';
    return `${subject}: ${m.score}/${m.maxScore} (${m.assessmentType})`;
  }).join(", ");

  const feedbackSummary = feedback.map(f => f.comment).join("; ");

  const prompt = `
    Analyze the following student performance data:
    Grades: ${marksSummary}
    Teacher Comments: ${feedbackSummary}

    Please provide:
    1. A short encouraging summary (max 2 sentences).
    2. 3 specific, actionable study tips based on the subjects where scores are lower.
    3. A brief prediction of future performance if the student follows the tips.

    Format as a structured summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Unable to generate AI insights at this time. Please check your network or try again later.";
  }
};

export const getGradePrediction = async (marks: Mark[], feedback: Feedback[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const performanceContext = marks.map(m => {
    const subject = SUBJECTS_LIST.find(s => s.id === m.subjectId)?.name || 'Unknown';
    return `${subject}: current score ${m.score}/${m.maxScore} in ${m.assessmentType}`;
  }).join("\n");

  const feedbackContext = feedback.map(f => f.comment).join("\n");

  const prompt = `Based on the following historical performance and teacher feedback, predict the potential Final Exam scores (out of 100) for each subject. 
  
  Current Data:
  ${performanceContext}
  
  Feedback:
  ${feedbackContext}
  
  Be realistic. If a student is struggling, the prediction should reflect that unless feedback suggests high potential. Provide a JSON-like list with subject name, current score, predicted score, and a brief "Why" reasoning.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  currentScore: { type: Type.NUMBER },
                  predictedScore: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING }
                },
                required: ["subject", "currentScore", "predictedScore", "reasoning"]
              }
            }
          },
          required: ["predictions"]
        }
      }
    });
    
    return JSON.parse(response.text).predictions;
  } catch (error) {
    console.error("Grade Prediction Error:", error);
    throw error;
  }
};
