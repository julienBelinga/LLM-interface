from flask import render_template, request, jsonify
from app.main import bp
from app.utils.ollama import OllamaClient
from app.models import Conversation, Message
from app import db
import markdown

@bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt')
    model = data.get('model')
    conversation_id = data.get('conversation_id')
    
    if not prompt:
        return jsonify({'error': 'Prompt requis'}), 400
        
    # Créer ou récupérer la conversation
    if conversation_id:
        conversation = Conversation.query.get(conversation_id)
    else:
        conversation = Conversation()
        db.session.add(conversation)
        
    # Sauvegarder le message de l'utilisateur
    user_message = Message(
        content=prompt,
        is_user=True,
        conversation=conversation,
        model_used=model
    )
    db.session.add(user_message)
    
    # Obtenir la réponse d'Ollama
    client = OllamaClient()
    response, error = client.generate_response(prompt, model)
    
    if error:
        return jsonify({'error': str(error)}), 500
        
    # Sauvegarder la réponse
    assistant_message = Message(
        content=response,
        is_user=False,
        conversation=conversation,
        model_used=model
    )
    db.session.add(assistant_message)
    db.session.commit()
    
    # Formater la réponse en HTML via Markdown
    formatted_response = markdown.markdown(response)
    
    return jsonify({
        'response': formatted_response,
        'conversation_id': conversation.id
    }) 