from flask import jsonify
from app.api import bp
from app.utils.ollama import OllamaClient

@bp.route('/models', methods=['GET'])
def get_models():
    """Récupère la liste des modèles disponibles."""
    client = OllamaClient()
    models, error = client.list_models()
    
    if error:
        return jsonify({'error': str(error)}), 500
        
    return jsonify({'models': models}) 