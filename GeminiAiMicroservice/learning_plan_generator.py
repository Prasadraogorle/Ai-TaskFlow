# learning_plan_generator.py
import json
from typing import Dict, Any
from gemini_llm import GeminiLLM
from templates import get_enhanced_personalized_prompt
from LearningPlanComponents.utils import DurationParser, ResponseCleaner, PlanValidator
from LearningPlanComponents.subject_detector import SubjectDetector
from LearningPlanComponents.task_generator import TaskGenerator
from LearningPlanComponents.fallback_plan_generator import FallbackPlanGenerator

class LearningPlanGenerator:
    
    def __init__(self, gemini_api_key: str):
        self.llm = GeminiLLM(api_key=gemini_api_key)
        
        # Initialize components
        self.duration_parser = DurationParser()
        self.response_cleaner = ResponseCleaner()
        self.plan_validator = PlanValidator()
        self.subject_detector = SubjectDetector()
        self.task_generator = TaskGenerator()
        self.fallback_generator = FallbackPlanGenerator()
    
    def generate_learning_plan(self, goal: str, duration: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        
        print(f"Generating plan for goal: {goal}, duration: {duration}")
        duration_dict = self.duration_parser.parse_duration(duration)
        totals = self.duration_parser.calculate_totals(duration_dict)
        
        # Detect subject category for intelligent processing
        subject_category = self.subject_detector.detect_subject_category(goal)
        print(f"Detected subject category: {subject_category}")
        
        # Set default user context if not provided
        if user_context is None:
            user_context = self._infer_user_context(goal, subject_category)
        
        print(f"Parsed duration: {duration_dict}")
        print(f"Calculated totals: {totals}")
        print(f"User context: {user_context}")
        
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Use the enhanced personalized prompt
                formatted_prompt = get_enhanced_personalized_prompt(
                    goal=goal,
                    duration=duration,
                    total_days=totals["total_days"],
                    total_weeks=totals["total_weeks"],
                    total_months=totals["total_months"],
                    subject_category=subject_category,
                    user_context=user_context,
                    attempt_number=attempt + 1
                )
                
                print(f"Attempt {attempt + 1}: Calling Gemini API with enhanced prompt...")
                raw_response = self.llm.invoke(formatted_prompt)
                
                if raw_response.startswith("Error:"):
                    print(f"LLM error on attempt {attempt + 1}: {raw_response}")
                    continue
                
                print(f"Raw response received, length: {len(raw_response)}")
                json_response = self.response_cleaner.clean_json_response(raw_response)
                print(f"Cleaned JSON length: {len(json_response)}")
                
                try:
                    plan = json.loads(json_response)
                    print("JSON parsing successful!")
                    if (isinstance(plan, dict) and 
                        len(plan.get('dailyTasks', [])) == totals["total_days"] and
                        len(plan.get('weeklyTasks', [])) == totals["total_weeks"] and
                        len(plan.get('monthlyTasks', [])) == totals["total_months"]):
                        
                        print(f"Plan validated: {len(plan['dailyTasks'])} daily, {len(plan['weeklyTasks'])} weekly, {len(plan['monthlyTasks'])} monthly tasks")
                        return self.plan_validator.validate_plan_structure(plan)
                    else:
                        print(f"Plan structure invalid - Expected: {totals['total_days']} daily, {totals['total_weeks']} weekly, {totals['total_months']} monthly")
                        
                except json.JSONDecodeError as e:
                    print(f"JSON parsing failed on attempt {attempt + 1}: {e}")
                    
            except Exception as e:
                print(f"Error on attempt {attempt + 1}: {e}")
        
        print("All LLM attempts failed, using intelligent fallback with user context")
        return self.fallback_generator.create_intelligent_fallback_plan(goal, duration, user_context)
    
    def _infer_user_context(self, goal: str, subject_category: str) -> Dict[str, Any]:
        """Infer user context from goal and subject"""
        context = {
            "skill_level": "beginner",
            "learning_style": "practical",
            "daily_time": "1-2 hours",
            "specific_interests": [],
            "practical_goals": []
        }
        
        goal_lower = goal.lower()
        
        # Infer skill level
        if any(word in goal_lower for word in ["advanced", "master", "expert", "professional"]):
            context["skill_level"] = "advanced"
        elif any(word in goal_lower for word in ["intermediate", "improve", "enhance"]):
            context["skill_level"] = "intermediate"
        
        # Infer learning style
        if any(word in goal_lower for word in ["project", "build", "create", "develop"]):
            context["learning_style"] = "project-based"
        elif any(word in goal_lower for word in ["theory", "concept", "understand"]):
            context["learning_style"] = "theoretical"
        
        # Subject-specific interests
        if subject_category == "dsa":
            if "leetcode" in goal_lower:
                context["specific_interests"].append("competitive programming")
            if "interview" in goal_lower:
                context["practical_goals"].append("job interviews")
        elif subject_category in ["react", "python"]:
            if "web" in goal_lower:
                context["specific_interests"].append("web development")
            if "ai" in goal_lower or "ml" in goal_lower:
                context["specific_interests"].append("machine learning")
        elif subject_category in ["gate", "jee", "upsc"]:
            context["practical_goals"].append("exam preparation")
            context["learning_style"] = "exam-focused"
        
        return context