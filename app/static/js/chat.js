class ChatInterface {
  constructor() {
    this.currentConversationId = null;
    this.loader = document.getElementById("loader");
    this.modelNameSpan = document.getElementById("modelName");
    this.promptTextarea = document.getElementById("prompt");
    this.chatHistory = document.getElementById("chatHistory");
    this.chatForm = document.getElementById("chatForm");
    this.modelSelect = document.getElementById("modelSelect");
    this.newChatButton = document.getElementById("newChat");

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Gestion de la touche Entrée
    this.promptTextarea.addEventListener("keydown", (e) =>
      this.handleEnterKey(e)
    );
    this.newChatButton.addEventListener("click", () => this.startNewChat());
    this.chatForm.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  handleEnterKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.chatForm.dispatchEvent(new Event("submit"));
    }
  }

  startNewChat() {
    this.currentConversationId = null;
    this.chatHistory.innerHTML = "";
    this.promptTextarea.value = "";
  }

  async handleSubmit(e) {
    e.preventDefault();

    const prompt = this.promptTextarea.value.trim();
    if (!prompt) return;

    // Afficher le message de l'utilisateur
    this.appendMessage(prompt, true);
    this.promptTextarea.value = "";

    // Afficher le loader
    const selectedModel = this.modelSelect.value;
    this.modelNameSpan.textContent = `${selectedModel} réfléchit...`;
    this.loader.style.display = "block";

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          conversation_id: this.currentConversationId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        this.currentConversationId = data.conversation_id;
        this.appendMessage(data.response, false);
      } else {
        throw new Error(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      this.appendMessage(`Erreur: ${error.message}`, false, true);
    } finally {
      // Cacher le loader
      this.loader.style.display = "none";
    }
  }

  appendMessage(content, isUser, isError = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `p-4 rounded-lg ${
      isUser ? "bg-gray-800" : isError ? "bg-red-900" : "bg-gray-700"
    }`;

    const header = document.createElement("div");
    header.className = "font-bold mb-2";
    header.textContent = isUser ? "👤 Vous" : "🤖 Assistant";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    // Formater le contenu avec gestion spéciale des blocs de code
    if (!isUser) {
      content = this.formatCodeBlocks(content);
    }
    contentDiv.innerHTML = content;

    messageDiv.appendChild(header);
    messageDiv.appendChild(contentDiv);
    this.chatHistory.appendChild(messageDiv);

    // Scroll to bottom
    messageDiv.scrollIntoView({ behavior: "smooth" });

    // Appliquer la coloration syntaxique
    if (!isUser) {
      Prism.highlightAllUnder(messageDiv);
    }
  }

  formatCodeBlocks(content) {
    // Remplacer les blocs de code avec la syntaxe ```
    return content.replace(/```([\s\S]*?)```/g, (match, codeBlock) => {
      // Extraire la première ligne pour le langage
      const lines = codeBlock.trim().split("\n");
      let language = lines[0].trim();
      let code = lines.slice(1).join("\n").trim();

      // Si la première ligne n'est pas un langage, c'est du code
      if (language.includes(" ") || !language) {
        code = codeBlock.trim();
        language = this.detectLanguage(code);
      }

      return `<pre><code class="language-${
        language || "plaintext"
      }">${this.escapeHtml(code)}</code></pre>`;
    });
  }

  detectLanguage(code) {
    // Détection simple du langage basée sur des motifs
    const patterns = {
      python: /^(import|from|def|class)\s|^\s*@/m,
      javascript: /^(const|let|var|function|import|export)\s|^\s*\/\//m,
      jsx: /^(import React|<\w+>|<\/\w+>)/m,
      typescript: /^(interface|type|enum)\s|:\s*(string|number|boolean)/m,
      html: /^<!DOCTYPE|^<html|^<div/i,
      css: /^(\.|#|\w+)\s*{/,
      json: /^[\[{]/,
      bash: /^(\$|#)\s/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        return lang;
      }
    }
    return "plaintext";
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialiser l'interface de chat quand le DOM est chargé
document.addEventListener("DOMContentLoaded", () => {
  new ChatInterface();
});
