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
      content = this.formatMarkdownAndCode(content);
    } else {
      content = this.escapeHtml(content);
    }
    contentDiv.innerHTML = content;

    messageDiv.appendChild(header);
    messageDiv.appendChild(contentDiv);
    this.chatHistory.appendChild(messageDiv);

    // Scroll to bottom
    messageDiv.scrollIntoView({ behavior: "smooth" });

    // Appliquer la coloration syntaxique après insertion dans le DOM
    if (!isUser) {
      // Attendre que l'élément soit dans le DOM puis appliquer Prism
      setTimeout(() => {
        Prism.highlightAllUnder(messageDiv);
      }, 50);
    }
  }

  formatMarkdownAndCode(content) {
    // D'abord traiter les blocs de code pour éviter qu'ils soient affectés par le formatage Markdown
    content = this.formatCodeBlocks(content);

    // Traiter le code inline (backticks simples)
    content = this.formatInlineCode(content);

    // Ensuite traiter le Markdown simple (gras, italique, liens)
    content = this.formatSimpleMarkdown(content);

    return content;
  }

  formatInlineCode(content) {
    // Traiter le code inline avec des backticks simples `code`
    // Éviter de traiter les blocs qui sont déjà dans des <pre>
    return content.replace(
      /(?<!<pre[^>]*>[\s\S]*?)`([^`\n]+)`(?![\s\S]*?<\/pre>)/g,
      '<code class="inline-code">$1</code>'
    );
  }

  formatSimpleMarkdown(content) {
    // Titres **texte** - maintenant on accepte aussi les noms de fichiers
    content = content.replace(
      /\*\*([^*\n]+)\*\*/g,
      '<h3 class="text-lg font-bold text-blue-300 mt-4 mb-2">$1</h3>'
    );

    // Italique *texte*
    content = content.replace(/\*((?![\*\n<])(?!\/?).*?)\*/g, "<em>$1</em>");

    // Liens [texte](url)
    content = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300">$1</a>'
    );

    // Sauts de ligne
    content = content.replace(/\n\n/g, "</p><p>");
    content = content.replace(/\n/g, "<br>");

    // Entourer dans des paragraphes si nécessaire
    if (!content.includes("<pre>") && !content.includes("<p>")) {
      content = "<p>" + content + "</p>";
    }

    return content;
  }

  formatCodeBlocks(content) {
    console.log("Formatage des blocs de code - input:", content);

    // Traiter les blocs avec des noms de fichiers explicites
    content = content.replace(
      /\*\*([\w.-]+)\*\*(.*?)```([\w]*)\n?([\s\S]*?)```/g,
      (match, filename, description, lang, code) => {
        console.log("Bloc avec nom de fichier trouvé:", {
          filename,
          lang,
          code,
        });
        const language =
          lang ||
          this.detectLanguageFromFilename(filename) ||
          this.detectLanguage(code);
        // Préserver l'indentation et les retours à la ligne
        const cleanCode = this.preserveCodeFormatting(code);
        console.log("Code nettoyé:", cleanCode);
        return `<strong>${filename}</strong>${description}<pre><code class="language-${language}">${this.escapeHtml(
          cleanCode
        )}</code></pre>`;
      }
    );

    // Traiter les blocs normaux avec langage spécifié
    content = content.replace(
      /```(\w+)\n([\s\S]*?)```/g,
      (match, declaredLang, code) => {
        console.log("Bloc avec langage trouvé:", { declaredLang, code });
        const language = declaredLang.trim() || this.detectLanguage(code);
        const cleanCode = this.preserveCodeFormatting(code);
        console.log("Code nettoyé:", cleanCode);
        return `<pre><code class="language-${language}">${this.escapeHtml(
          cleanCode
        )}</code></pre>`;
      }
    );

    // Traiter les blocs sans langage spécifié
    content = content.replace(/```\n?([\s\S]*?)```/g, (match, code) => {
      console.log("Bloc sans langage trouvé:", code);
      const language = this.detectLanguage(code);
      const cleanCode = this.preserveCodeFormatting(code);
      console.log("Code nettoyé:", cleanCode);
      return `<pre><code class="language-${language}">${this.escapeHtml(
        cleanCode
      )}</code></pre>`;
    });

    console.log("Formatage des blocs de code - output:", content);
    return content;
  }

  preserveCodeFormatting(code) {
    // Préserver l'indentation et les retours à la ligne
    // Enlever seulement les espaces/tabs au tout début et à la toute fin
    let lines = code.split("\n");

    // Enlever les lignes vides au début et à la fin
    while (lines.length > 0 && lines[0].trim() === "") {
      lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }

    if (lines.length === 0) return "";

    // Trouver l'indentation minimale (en ignorant les lignes vides)
    let minIndent = Infinity;
    for (let line of lines) {
      if (line.trim() !== "") {
        let indent = line.match(/^\s*/)[0].length;
        minIndent = Math.min(minIndent, indent);
      }
    }

    // Supprimer l'indentation commune de toutes les lignes
    if (minIndent > 0 && minIndent !== Infinity) {
      lines = lines.map((line) => {
        if (line.trim() === "") return line;
        return line.substring(minIndent);
      });
    }

    return lines.join("\n");
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
      javascript: /^(const|let|var|function|import|export)\s|^\s*\/\//m,
      python: /^(import|from|def|class)\s|^\s*@/m,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        return lang;
      }
    }
    return "plaintext";
  }

  escapeHtml(text) {
    // Préserver les retours à la ligne et l'indentation en remplaçant les caractères HTML dangereux
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Initialiser l'interface de chat quand le DOM est chargé
document.addEventListener("DOMContentLoaded", () => {
  new ChatInterface();
});
