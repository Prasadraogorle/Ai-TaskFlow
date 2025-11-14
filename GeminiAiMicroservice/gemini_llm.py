from typing import Optional, List
from langchain.llms.base import LLM
import requests


class GeminiLLM(LLM):
    api_key: str
    model: str = "gemini-flash-latest"   # ✅ Current latest model
    temperature: float = 0.7
    max_tokens: int = 8192

    @property
    def _llm_type(self) -> str:
        return "gemini"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager=None,
        **kwargs,
    ) -> str:
        # ✅ Use official Gemini 2.5 API endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

        # ✅ Use correct header for Gemini API
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

        request_body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_tokens,
                "topK": 40,
                "topP": 0.95,
                "candidateCount": 1,
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ],
        }

        try:
            response = requests.post(url, headers=headers, json=request_body, timeout=60)
            response.raise_for_status()
            result = response.json()

            # ✅ Extract text safely
            if "candidates" in result and result["candidates"]:
                candidate = result["candidates"][0]
                content = candidate.get("content", {})
                parts = content.get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"].strip()

            return "Error: Could not extract response from Gemini API"

        except requests.exceptions.Timeout:
            return "Error: Request to Gemini API timed out"
        except requests.exceptions.RequestException as e:
            return f"Error calling Gemini API: {str(e)}"
        except Exception as e:
            return f"Error processing response: {str(e)}"
