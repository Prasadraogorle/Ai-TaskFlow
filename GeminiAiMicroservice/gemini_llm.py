from typing import Optional, List
from langchain.llms.base import LLM
import requests

class GeminiLLM(LLM):
    api_key: str
    model: str = "gemini-1.5-flash"  # You can change this to gemini-1.5-pro
    temperature: float = 0.8
    max_tokens: int = 8000

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
        # ✅ Use v1 endpoint (not v1beta)
        url = f"https://generativelanguage.googleapis.com/v1/models/{self.model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": self.api_key}

        request_body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_tokens
            }
        }

        try:
            response = requests.post(url, headers=headers, params=params, json=request_body, timeout=60)
            response.raise_for_status()
            result = response.json()

            if "candidates" in result and result["candidates"]:
                content = result["candidates"][0].get("content", {})
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
