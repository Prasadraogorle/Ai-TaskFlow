import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { configDotenv } from "dotenv";
import { Roadmap } from "../models/roadmap.js";
import mongoose from 'mongoose';

configDotenv();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API,
  maxOutputTokens: 8000,
});

// Fixed structured output schema with required fields
const roadmapSchema = {
  type: "object",
  properties: {
    skill: {
      type: "string",
      description: "The skill being learned"
    },
    totalConcepts: {
      type: "integer",
      description: "Total number of concepts across all levels"
    },
    levels: {
      type: "array",
      items: {
        type: "object",
        properties: {
          level: {
            type: "string",
            description: "The skill level name (e.g., Novice Level, Beginner Level)"
          },
          description: {
            type: "string",
            description: "Brief description of what this level covers"
          },
          duration: {
            type: "string",
            description: "Estimated time to complete this level"
          },
          concepts: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Array of concepts/skills to learn at this level"
          }
        },
        required: ["level", "description", "duration", "concepts"]
      }
    },
    relatedSkills: {
      type: "object",
      properties: {
        complementary: {
          type: "array",
          items: { type: "string" },
          description: "Skills that complement this main skill"
        },
        nextLevel: {
          type: "array",
          items: { type: "string" },
          description: "Advanced skills to learn after mastering this one"
        },
        specializations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: {
                type: "string",
                description: "Job role or specialization"
              },
              averageSalary: {
                type: "object",
                properties: {
                  india: { 
                    type: "string",
                    description: "Salary range in India with ₹X-Y LPA format"
                  },
                  us: { 
                    type: "string",
                    description: "Salary range in US with $X,XXX format"
                  },
                  description: { 
                    type: "string",
                    description: "Brief description of the role"
                  }
                },
                required: ["india", "us", "description"]
              }
            },
            required: ["role", "averageSalary"]
          }
        }
      },
      required: ["complementary", "nextLevel", "specializations"]
    }
  },
  required: ["skill", "totalConcepts", "levels", "relatedSkills"]
};

// Enhanced prompt template with explicit salary structure
const roadmapPrompt = PromptTemplate.fromTemplate(`
Create a comprehensive learning latest future proof roadmap for "{skill}" using the {approachName} approach.

Approach Details:
- Focus: {approachDescription}
- Style: {roadmapStyle}

CRITICAL REQUIREMENTS - Follow this EXACTLY:

1. Generate exactly 6 levels: "Novice Level", "Beginner Level", "Competent Level", "Proficient Level", "Expert Level", "Master Level"
2. Each level should have 7-10 specific, actionable concepts
3. Provide realistic duration estimates (e.g., "4-6 weeks", "8-10 weeks")
4. Include exactly 5 complementary skills, 5 next-level skills
5. Add exactly 5 career specializations with COMPLETE salary information

For specializations, each MUST have:
- role: Job title
- averageSalary: Object with ALL three fields:
  - india: "₹X-Y LPA" (e.g., "₹6-30 LPA")
  - us: "$XX,XXX" (e.g., "$95,000")
  - description: Brief role description

Return ONLY this exact JSON structure:
{{
  "skill": "{skill}",
  "totalConcepts": 50,
  "levels": [
    {{
      "level": "Novice Level",
      "description": "Learning basic fundamentals and core concepts",
      "duration": "4-6 weeks",
      "concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5", "Concept 6", "Concept 7", "Concept 8"]
    }}
  ],
  "relatedSkills": {{
    "complementary": ["Skill A", "Skill B", "Skill C", "Skill D", "Skill E"],
    "nextLevel": ["Advanced Skill A", "Advanced Skill B", "Advanced Skill C", "Advanced Skill D", "Advanced Skill E"],
    "specializations": [
      {{
        "role": "Frontend Developer",
        "averageSalary": {{
          "india": "₹4-25 LPA",
          "us": "$85,000",
          "description": "Build user interfaces and client-side applications"
        }}
      }},
      {{
        "role": "Backend Developer", 
        "averageSalary": {{
          "india": "₹5-30 LPA",
          "us": "$95,000",
          "description": "Develop server-side applications and APIs"
        }}
      }},
      {{
        "role": "Full Stack Developer",
        "averageSalary": {{
          "india": "₹6-35 LPA",
          "us": "$102,000",
          "description": "Work on both frontend and backend development"
        }}
      }},
      {{
        "role": "Technical Lead",
        "averageSalary": {{
          "india": "₹15-50 LPA",
          "us": "$145,000",
          "description": "Lead development teams and make technical decisions"
        }}
      }},
      {{
        "role": "Senior Developer",
        "averageSalary": {{
          "india": "₹12-40 LPA",
          "us": "$120,000",
          "description": "Senior-level development with mentoring responsibilities"
        }}
      }}
    ]
  }}
}}
`);

// Generate Roadmap Controller with Database Integration
export const generateRoadmapController = async (req, res) => {
  console.log(req.body);
  
  try {
    const { skill, approach, id } = req.body;
    
    // Validate required fields
    if (!skill || !approach || !id) {
      return res.status(400).json({ 
        error: "Missing required fields: skill, approach, and user id" 
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: "Invalid user ID format" 
      });
    }

    // Check if user already has roadmap for this skill and approach
    const existingRoadmap = await Roadmap.findOne({
      userId: id,
      skill: skill.toLowerCase().trim(),
      'approach.name': approach.name
    });

    if (existingRoadmap) {
      return res.status(200).json({
        success: true,
        roadmap: existingRoadmap,
        fromCache: true,
        message: "Roadmap retrieved from your previous generations"
      });
    }

    // Create the model with structured output
    const structuredModel = model.withStructuredOutput(roadmapSchema);

    // Format the prompt with the request data
    const formattedPrompt = await roadmapPrompt.format({
      skill: skill,
      approachName: approach.name,
      approachDescription: approach.description,
      roadmapStyle: approach.roadmapStyle
    });

    // Generate the structured roadmap from AI
    console.log("Generating roadmap from AI...");
    const aiResponse = await structuredModel.invoke(formattedPrompt);
    
    // Debug: Log the AI response structure
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));
    
    // Validate that specializations have complete salary data
    if (aiResponse.relatedSkills?.specializations) {
      aiResponse.relatedSkills.specializations.forEach((spec, index) => {
        if (!spec.averageSalary) {
          spec.averageSalary = {
            india: "₹5-25 LPA",
            us: "$75,000",
            description: `Professional role in ${skill}`
          };
        } else {
          // Ensure all required fields exist
          if (!spec.averageSalary.india) spec.averageSalary.india = "₹5-25 LPA";
          if (!spec.averageSalary.us) spec.averageSalary.us = "$75,000";
          if (!spec.averageSalary.description) spec.averageSalary.description = `Professional role in ${skill}`;
        }
      });
    }
    
    // Prepare roadmap data for database storage
    const roadmapData = {
      ...aiResponse,
      skill: skill.toLowerCase().trim(), // Normalize for consistent storage
      approach: {
        name: approach.name,
        description: approach.description,
        id: approach.id,
        roadmapStyle: approach.roadmapStyle
      },
      userId: id // Store as string as per your schema
    };

    // Save the generated roadmap to MongoDB
    console.log("Saving roadmap to database...");
    const savedRoadmap = await Roadmap.create(roadmapData);
    console.log("saved to database");
    
    // Return the structured response with saved roadmap
    res.status(201).json({
      success: true,
      roadmap: savedRoadmap,
      message: `Complete roadmap for ${skill} generated successfully!`,
      generatedAt: savedRoadmap.createdAt
    });

  } catch (error) {
    console.error("Error generating roadmap:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Invalid roadmap data structure",
        details: validationErrors
      });
    }
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "Roadmap with similar configuration already exists" 
      });
    }
    
    // Handle LangChain/Gemini errors
    if (error.message?.includes('structured output') || error.message?.includes('JSON')) {
      return res.status(500).json({ 
        error: "Failed to generate structured roadmap. Please try again." 
      });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongooseError') {
      return res.status(503).json({ 
        error: "Database connection error. Please try again later." 
      });
    }
    
    // Generic error handler
    res.status(500).json({ 
      error: "Internal server error while generating roadmap",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
