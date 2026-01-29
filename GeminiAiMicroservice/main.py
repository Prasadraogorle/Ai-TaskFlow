# main.py (Enhanced)
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from models import LearningPlanRequest, TaskItem, LearningPlanResponse
from learning_plan_generator import LearningPlanGenerator
import traceback

app = FastAPI(
    title="Enhanced Learning Plan Generator API",
    description="Generate highly personalized, progressive learning plans using AI",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced request model with user context
class EnhancedLearningPlanRequest(BaseModel):
    goal: str
    duration: str
    skill_level: Optional[str] = "beginner"  # beginner, intermediate, advanced
    learning_style: Optional[str] = "practical"  # practical, theoretical, project-based, exam-focused
    daily_time: Optional[str] = "1-2 hours"  # 30 minutes, 1-2 hours, 2-3 hours, 3+ hours
    specific_interests: Optional[List[str]] = []  # e.g., ["web development", "machine learning"]
    practical_goals: Optional[List[str]] = []  # e.g., ["job interviews", "freelancing", "personal projects"]

generator = None

@app.on_event("startup")
async def startup_event():
    global generator
    api_key = "AIzaSyACQpqQ7QE0hq5O_yONiixRfEiUOPItaPA"
    if not api_key:
        raise Exception("GEMINI_API_KEY environment variable not set")
    
    generator = LearningPlanGenerator(api_key)
    print("Enhanced Learning Plan Generator with personalization initialized successfully")

@app.get("/")
async def root():
    return {
        "message": "Enhanced Learning Plan Generator API v3.0",
        "features": [
            "Personalized learning plans based on skill level and learning style",
            "Ultra-specific, actionable daily tasks",
            "Intelligent fallback system with curriculum knowledge",
            "Dynamic task progression and complexity adaptation"
        ]
    }

# Legacy endpoint for backward compatibility
@app.post("/generate-plan", response_model=LearningPlanResponse)
async def generate_plan(request: LearningPlanRequest):
    """Legacy endpoint - converts to enhanced format internally"""
    if not generator:
        raise HTTPException(status_code=500, detail="Generator not initialized")
    
    if not request.goal.strip():
        raise HTTPException(status_code=400, detail="Goal cannot be empty")
    
    if not request.duration.strip():
        raise HTTPException(status_code=400, detail="Duration cannot be empty")
    
    try:
        # Convert legacy request to enhanced format
        user_context = {
            "skill_level": "beginner",
            "learning_style": "practical",
            "daily_time": "1-2 hours",
            "specific_interests": [],
            "practical_goals": []
        }
        
        plan = generator.generate_learning_plan(request.goal, request.duration, user_context)
        
        response = LearningPlanResponse(
            goalTitle=plan["goalTitle"],
            totalDays=plan["totalDays"],
            monthlyTasks=[TaskItem(**task) for task in plan["monthlyTasks"]],
            weeklyTasks=[TaskItem(**task) for task in plan["weeklyTasks"]],
            dailyTasks=[TaskItem(**task) for task in plan["dailyTasks"]],
        )
        return response
        
    except Exception as e:
        print("\n🔥 SERVER CRASHED WITH ERROR:")
        print(str(e))
        traceback.print_exc()   # full error details
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)