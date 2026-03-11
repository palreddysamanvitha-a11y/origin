import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface StylingResult {
  skinTone: string;
  recommendations: string;
  shoppingLinks: {
    title: string;
    price: string;
    retailer: string;
    url: string;
    image: string;
  }[];
  trends: string[];
}

export const getStylingAdvice = async (
  imageBuffer: string,
  gender: string,
  detectedSkinTone?: string
): Promise<StylingResult> => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    You are StyleAI, an elite fashion consultant. Analyze the uploaded photo.
    
    CONTEXT:
    - User Gender: ${gender}
    - Detected Skin Tone (Algorithm): ${detectedSkinTone || "To be determined"}
    
    TASK:
    1. Confirm or refine the skin tone category (Fair, Medium, Olive, or Deep).
    2. Provide a masterclass in personal styling for this individual.
    3. Include sections for:
       - **Dress Codes**: Specific advice for Formal, Business, Casual, and Party settings.
       - **The Outfit**: Detailed descriptions of tops, bottoms, and footwear.
       - **Grooming & Hair**: Hairstyle and maintenance tips that suit their face and tone.
       - **Accessories**: Curated selection of jewelry, watches, and eyewear.
       - **Color Theory**: A palette of Primary, Secondary, and Accent colors with explanations of why they work.
    4. Generate 4 REALISTIC shopping item suggestions. Use names that sound like actual products from Myntra, Amazon.in, or Zara.
    5. List 3 current fashion trends (2024-2025) that this user should adopt.
    
    OUTPUT FORMAT (JSON):
    {
      "skinTone": "Category Name",
      "recommendations": "Markdown formatted styling advice",
      "shoppingLinks": [
        {
          "title": "Product Name",
          "price": "Price in INR",
          "retailer": "Retailer Name",
          "url": "Search URL or direct link",
          "image": "https://picsum.photos/seed/fashion-item/400/400"
        }
      ],
      "trends": ["Trend 1", "Trend 2", "Trend 3"]
    }
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBuffer.split(",")[1],
    },
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [imagePart, { text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const text = response.text || "{}";
    // Clean potential markdown code blocks from JSON
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("StyleAI is currently busy. Please try again in a moment.");
  }
};
