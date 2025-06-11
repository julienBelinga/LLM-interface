# Interface LLM avec Ollama

Une interface web pour interagir avec des modèles de langage via Ollama.

## Prérequis

- Python 3.8+
- Ollama installé et en cours d'exécution sur le port 11434
- Le modèle llama3 chargé dans Ollama

## Installation

1. Cloner le dépôt :

```bash
git clone <votre-repo>
cd LLM-interface
```

2. Créer un environnement virtuel :

```bash
python -m venv venv
source venv/bin/activate  # Sur Linux/Mac
# ou
.\venv\Scripts\activate  # Sur Windows
```

3. Installer les dépendances :

```bash
pip install -r requirements.txt
```

4. Copier le fichier .env.example en .env et configurer les variables :

```bash
cp .env.example .env
```

## Lancement

```bash
python run.py
```

L'application sera accessible sur http://localhost:5000

## Fonctionnalités

- Interface web intuitive
- Support de Markdown dans les réponses
- Coloration syntaxique du code
- Architecture extensible pour ajouter de nouveaux modèles
- Historique des conversations (à venir)
- Export des conversations (à venir)
