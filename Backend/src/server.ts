import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { time } from "console";
import Recommendation from "./models/Movie";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI || "", {})
.then(() => {
  console.log("✅ Connected to MongoDB");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Type for movie recommendation object
interface MovieRecommendation {
  title: string;
  year: string;
  director: string;
  genre: string;
  reason: string;
}


// POST /api/recommend
app.post("/api/recommend", async (req: Request, res: Response) => {
 
  try {
    
    const { userInput } = req.body as { userInput?: string };

    // Validate input
    if (!userInput || typeof userInput !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "userInput is required and must be a string",
      });
    }

    if (userInput.trim().length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userInput cannot be empty",
      });
    }

    const existing = await Recommendation.findOne({
      user_input: userInput.trim()
    });

    if(existing){
      return res.json({
        success: true,
        recommendations: existing.recommended_movies,
        timestamp: existing.timestamp.toISOString(),
      });
    }
  

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Configuration Error",
        message: "GEMINI_API_KEY is not configured",
      });
    }

    // Create prompt for Gemini
    const prompt = `Based on the following user preference, recommend 5 movies. For each movie, provide:
- Title
- Year
- Director
- Genre
- A brief reason why it matches their preference

User preference: "${userInput}"

Format your response as a JSON array with objects containing: title, year, director, genre, and reason fields.`;

    
    const result = await model.generateContent(prompt);
    
    const response = result.response;
    
    let text = response.text();

   
     text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let recommendations: MovieRecommendation[];
  
    try {
      
      recommendations = JSON.parse(text);
     
      if(!Array.isArray(recommendations)) {
        throw new Error("Parsed response is not an array");
      }

    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      return res.status(500).json({
        error: "Parse Error",
        message: "Per minute limit exceeded",
        rawResponse: text,
      });
    }
    
    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Backend Error:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to get movie recommendations",
    });
  }
});

// Save recommendations to database
app.post("/api/save", async (req: Request, res: Response) => {
  try {
    const { userInput, recommendations } = req.body as {
      userInput: string;
      recommendations: MovieRecommendation[];
    };
    if (!userInput || !Array.isArray(recommendations)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userInput and recommendations are required",
      });
    }
    const newEntry = new Recommendation({
      user_input: userInput,
      recommended_movies: recommendations,
      timestamp: new Date(),
    });
    await newEntry.save();
    res.json({ success: true, message: "Recommendations saved successfully" });
  } catch (error: any) {
    console.error("Save Error:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to save recommendations",
    });
  }
});

// Legacy GET endpoint
app.get("/api/movies", async (req: Request, res: Response) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({
      message: "Query is required. Please use POST /api/recommend instead.",
    });
  }

  res.status(301).json({
    message: "This endpoint is deprecated. Please use POST /api/recommend",
    newEndpoint: "/api/recommend",
    example: {
      method: "POST",
      body: { userInput: query },
    },
  });
});

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running successfully 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});



export default app;


