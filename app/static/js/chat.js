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
    // D'abord, traiter les blocs avec des noms de fichiers explicites
    content = content.replace(
      /\*\*([\w.-]+)\*\*(.*?)```([\s\S]*?)```/g,
      (match, filename, description, code) => {
        const language =
          this.detectLanguageFromFilename(filename) ||
          this.detectLanguage(code.trim());
        return `**${filename}**${description}<pre><code class="language-${language}">${this.escapeHtml(
          code.trim()
        )}</code></pre>`;
      }
    );

    // Ensuite, traiter les blocs normaux avec ```
    content = content.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (match, declaredLang, code) => {
        let language = declaredLang.trim();
        const cleanCode = code.trim();

        // Si pas de langage déclaré, détecter automatiquement
        if (!language) {
          language = this.detectLanguage(cleanCode);
        }

        return `<pre><code class="language-${language}">${this.escapeHtml(
          cleanCode
        )}</code></pre>`;
      }
    );

    // Traiter les blocs sans langage spécifié mais avec du contenu
    content = content.replace(/```([\s\S]*?)```/g, (match, codeBlock) => {
      const cleanCode = codeBlock.trim();
      const language = this.detectLanguage(cleanCode);
      return `<pre><code class="language-${language}">${this.escapeHtml(
        cleanCode
      )}</code></pre>`;
    });

    return content;
  }

  detectLanguageFromFilename(filename) {
    const extension = filename.split(".").pop().toLowerCase();
    const extensions = {
      html: "html",
      htm: "html",
      css: "css",
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      dart: "dart",
      json: "json",
      sh: "bash",
      bash: "bash",
    };
    return extensions[extension];
  }

  detectLanguage(code) {
    // Détection simple du langage basée sur des motifs
    const patterns = {
      html: /^<!DOCTYPE|^<html|^<head|^<body/i,
      css: /^[.#]?[\w-]+\s*\{|^body\s*\{|^@media|color\s*:|font-size\s*:|text-align\s*:/i,
      jsx: /^import React|JSX\.Element|<\w+.*>/m,
      javascript: /^(const|let|var|function|import|export)\s|^\s*\/\//m,
      typescript: /^(interface|type|enum)\s|:\s*(string|number|boolean)/m,
      python: /^(import|from|def|class)\s|^\s*@/m,
      json: /^[\[{]/,
      bash: /^(\$|#)\s/,
      dart: /^(import|class|void|final|const|var|Function)\s|^\s*@[A-Z]/m,
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
