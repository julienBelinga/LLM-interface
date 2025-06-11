
from flask import Flask, request, render_template_string
import requests
import markdown

app = Flask(__name__)

HTML_TEMPLATE = """
<!doctype html>
<html>
<head>
    <title>Ollama Chat (local)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2em; background: #1e1e1e; color: #eaeaea; }
        textarea, input[type=text] { width: 100% ; font-size: 1em; margin-top: 1em; background: #2d2d2d; color: #fff; border: none; padding: 1em; border-radius: 8px; }
        pre { background: #2d2d2d; padding: 1em; border-radius: 8px; overflow-x: auto; }
        code { color: #c5a5c5; }
        button { background-color: #007acc; color: white; border: none; padding: 10px 20px; margin-top: 1em; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h2>💬 Assistant IA Local (Ollama)</h2>
    <form method="post">
        <textarea name="prompt" rows="4" placeholder="Pose ta question ici...">{{ prompt }}</textarea>
        <button type="submit">Envoyer</button>
    </form>
    <div>{{ response|safe }}</div>
</body>
</html>
"""

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"  # Tu peux changer pour "mistral", "codellama", etc.

@app.route("/", methods=["GET", "POST"])
def chat():
    prompt = ""
    formatted_response = ""
    if request.method == "POST":
        prompt = request.form["prompt"]
        data = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
        try:
            res = requests.post(OLLAMA_URL, json=data, timeout=60)
            res.raise_for_status()
            result = res.json()
            output = result.get("response", "")
            formatted_response = markdown.markdown(f"**Réponse :**\n\n{output}")
        except Exception as e:
            formatted_response = f"<p style='color:red;'>Erreur : {e}</p>"

    return render_template_string(HTML_TEMPLATE, prompt=prompt, response=formatted_response)

if __name__ == "__main__":
    app.run(debug=True)
