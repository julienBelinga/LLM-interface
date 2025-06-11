import requests
from flask import current_app

class OllamaClient:
    def __init__(self):
        self.base_url = current_app.config['OLLAMA_URL']
        self.default_model = current_app.config['DEFAULT_MODEL']

    def generate_response(self, prompt, model=None):
        """Génère une réponse via l'API Ollama."""
        model = model or self.default_model
        data = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=data,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", ""), None
        except requests.exceptions.RequestException as e:
            return None, str(e)

    def list_models(self):
        """Liste les modèles disponibles."""
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            return response.json().get("models", []), None
        except requests.exceptions.RequestException as e:
            return None, str(e) 