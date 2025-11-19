/**
 * IFEN Advanced Text Editor - Éditeur WYSIWYG standalone
 * Version 1.0
 * 
 * Éditeur avancé avec Bold, Italic, Couleurs, Listes, Alignement, Liens
 * Nettoyage automatique du code parasite (Word, HTML, etc.)
 * Style IFEN intégré
 * 
 * Usage:
 * const editor = IFENAdvancedEditor.create(container, options);
 * const content = editor.getValue(); // HTML
 * editor.setValue(content);
 */

const IFENAdvancedEditor = (function() {
  'use strict';

  // ==========================================
  // CONFIGURATION PAR DÉFAUT
  // ==========================================
  const DEFAULT_OPTIONS = {
    placeholder: 'Entrez votre texte ici...',
    minHeight: '300px',
    maxHeight: '600px',
    showCharCount: true,
    // Couleurs IFEN disponibles
    colors: [
      { name: 'Violet IFEN', value: '#1F154d' },
      { name: 'Turquoise IFEN', value: '#00b2bb' },
      { name: 'Gris foncé', value: '#333333' },
      { name: 'Noir', value: '#000000' },
      { name: 'Rouge alerte', value: '#d32f2f' },
      { name: 'Vert', value: '#00FF00' },
      { name: 'Bleu', value: '#0056b3' },
      { name: 'Défaut', value: '' }
    ]
  };

  // ==========================================
  // NETTOYAGE DE TEXTE
  // ==========================================

  /**
   * Nettoyer le texte collé (enlever tout le code parasite)
   */
  function cleanPastedText(text) {
    // Enlever les balises HTML
    text = text.replace(/<[^>]*>/g, '');
    
    // Enlever les entités HTML
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#\d+;/g, '');
    
    // Enlever les caractères spéciaux de Word
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width spaces
    text = text.replace(/[\u2018\u2019]/g, "'"); // Smart quotes simples
    text = text.replace(/[\u201C\u201D]/g, '"'); // Smart quotes doubles
    text = text.replace(/[\u2013\u2014]/g, '-'); // Em/En dashes
    text = text.replace(/\u2026/g, '...'); // Ellipsis
    
    // Enlever les retours à la ligne multiples
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Enlever les espaces multiples
    text = text.replace(/ {2,}/g, ' ');
    
    // Trim
    text = text.trim();
    
    return text;
  }

  /**
   * Nettoyer le HTML de sortie (enlever attributs inutiles, styles inline sauf color)
   */
  function cleanHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Fonction récursive pour nettoyer les nœuds
    function cleanNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Listes de balises autorisées
        const allowedTags = ['strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'span', 'p', 'div', 'br'];
        const tagName = node.tagName.toLowerCase();
        
        if (!allowedTags.includes(tagName)) {
          // Remplacer par le contenu
          const parent = node.parentNode;
          while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
          }
          parent.removeChild(node);
          return;
        }
        
        // Nettoyer les attributs (garder seulement href, style avec color, text-align)
        const attributes = Array.from(node.attributes);
        attributes.forEach(attr => {
          if (attr.name === 'href') {
            // Garder href pour les liens
          } else if (attr.name === 'style') {
            // Garder seulement color et text-align
            const style = node.style;
            const color = style.color;
            const textAlign = style.textAlign;
            node.removeAttribute('style');
            if (color) node.style.color = color;
            if (textAlign) node.style.textAlign = textAlign;
          } else {
            node.removeAttribute(attr.name);
          }
        });
        
        // Nettoyer les enfants
        Array.from(node.childNodes).forEach(cleanNode);
      }
    }
    
    cleanNode(temp);
    return temp.innerHTML;
  }

  // ==========================================
  // CRÉATION DE L'ÉDITEUR
  // ==========================================

  /**
   * Créer une instance d'éditeur
   */
  function createEditor(container, options = {}) {
    // Fusionner les options
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    // Vérifier le container
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) {
      throw new Error('IFENAdvancedEditor: Container not found');
    }
    
    // Générer les boutons de couleur
    const colorButtonsHTML = config.colors.map((color, index) => {
      const style = color.value ? `background-color: ${color.value};` : 'background: linear-gradient(135deg, #ccc 0%, #999 100%);';
      const title = color.name;
      return `<button type="button" class="ifen-editor-color-btn" data-color="${color.value}" title="${title}" style="${style}"></button>`;
    }).join('');
    
    // Créer la structure HTML
    const editorHTML = `
      <div class="ifen-advanced-editor">
        <div class="ifen-editor-toolbar">
          <!-- Formatage de texte -->
          <div class="ifen-toolbar-group">
            <button type="button" class="ifen-editor-btn" data-command="bold" title="Gras (Ctrl+B)">
              <strong>B</strong>
            </button>
            <button type="button" class="ifen-editor-btn" data-command="italic" title="Italique (Ctrl+I)">
              <em>I</em>
            </button>
          </div>
          
          <!-- Sélecteur de couleur -->
          <div class="ifen-toolbar-group">
            <button type="button" class="ifen-editor-btn ifen-editor-color-picker-btn" title="Couleur du texte">
              <span class="color-icon">A</span>
            </button>
            <div class="ifen-editor-color-picker" style="display: none;">
              ${colorButtonsHTML}
            </div>
          </div>
          
          <!-- Listes -->
          <div class="ifen-toolbar-group">
            <button type="button" class="ifen-editor-btn" data-command="insertUnorderedList" title="Liste à puces">
              • Liste
            </button>
            <button type="button" class="ifen-editor-btn" data-command="insertOrderedList" title="Liste numérotée">
              1. Liste
            </button>
          </div>
          
          <!-- Alignement -->
          <div class="ifen-toolbar-group">
            <button type="button" class="ifen-editor-btn" data-command="justifyLeft" title="Aligner à gauche">
              ⬅
            </button>
            <button type="button" class="ifen-editor-btn" data-command="justifyCenter" title="Centrer">
              ↔
            </button>
            <button type="button" class="ifen-editor-btn" data-command="justifyRight" title="Aligner à droite">
              ➡
            </button>
            <button type="button" class="ifen-editor-btn" data-command="justifyFull" title="Justifier">
              ⬌
            </button>
          </div>
          
          <!-- Lien -->
          <div class="ifen-toolbar-group">
            <button type="button" class="ifen-editor-btn" data-command="createLink" title="Insérer un lien">
              🔗 Lien
            </button>
            <button type="button" class="ifen-editor-btn" data-command="unlink" title="Supprimer le lien">
              🔗✗
            </button>
          </div>
          
          <!-- Coller texte brut -->
          <div class="ifen-toolbar-group">
            <button type="button" class="ifen-editor-btn" data-command="paste" title="Coller texte brut">
              📋 Coller
            </button>
          </div>
        </div>
        
        <div class="ifen-editor-content" contenteditable="true" data-placeholder="${config.placeholder}"></div>
        
        ${config.showCharCount ? '<div class="ifen-editor-footer"><span class="ifen-editor-charcount">0 caractères</span></div>' : ''}
      </div>
      
      <!-- Modal pour insérer un lien -->
      <div class="ifen-link-modal" style="display: none;">
        <div class="ifen-link-modal-content">
          <div class="ifen-link-modal-header">
            <h3>Insérer un lien</h3>
            <button type="button" class="ifen-link-modal-close">✕</button>
          </div>
          <div class="ifen-link-modal-body">
            <label>
              <strong>Texte du lien :</strong>
              <input type="text" class="ifen-link-text" placeholder="Texte à afficher" />
            </label>
            <label>
              <strong>URL :</strong>
              <input type="url" class="ifen-link-url" placeholder="https://exemple.com" />
            </label>
            <label>
              <input type="checkbox" class="ifen-link-newtab" checked />
              Ouvrir dans un nouvel onglet
            </label>
          </div>
          <div class="ifen-link-modal-footer">
            <button type="button" class="ifen-link-modal-cancel">Annuler</button>
            <button type="button" class="ifen-link-modal-insert">Insérer</button>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = editorHTML;
    
    // Récupérer les éléments
    const editorEl = container.querySelector('.ifen-advanced-editor');
    const contentEl = container.querySelector('.ifen-editor-content');
    const charCountEl = container.querySelector('.ifen-editor-charcount');
    const colorPickerBtn = container.querySelector('.ifen-editor-color-picker-btn');
    const colorPicker = container.querySelector('.ifen-editor-color-picker');
    const linkModal = container.querySelector('.ifen-link-modal');
    
    // Appliquer les styles
    contentEl.style.minHeight = config.minHeight;
    contentEl.style.maxHeight = config.maxHeight;
    
    // ==========================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ==========================================
    
    // Boutons de la toolbar
    editorEl.querySelectorAll('.ifen-editor-btn[data-command]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.dataset.command;
        
        if (command === 'paste') {
          pasteAsPlainText();
        } else if (command === 'createLink') {
          showLinkModal();
        } else if (command === 'unlink') {
          document.execCommand('unlink', false, null);
          contentEl.focus();
        } else {
          document.execCommand(command, false, null);
          contentEl.focus();
        }
      });
    });
    
    // Sélecteur de couleur - Toggle
    colorPickerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isVisible = colorPicker.style.display !== 'none';
      colorPicker.style.display = isVisible ? 'none' : 'flex';
    });
    
    // Fermer le color picker si on clique ailleurs
    document.addEventListener('click', (e) => {
      if (!colorPickerBtn.contains(e.target) && !colorPicker.contains(e.target)) {
        colorPicker.style.display = 'none';
      }
    });
    
    // Boutons de couleur
    colorPicker.querySelectorAll('.ifen-editor-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        if (color) {
          document.execCommand('foreColor', false, color);
        } else {
          // Retirer la couleur (défaut)
          document.execCommand('removeFormat', false, null);
        }
        colorPicker.style.display = 'none';
        contentEl.focus();
      });
    });
    
    // Paste event - Toujours coller en texte brut
    contentEl.addEventListener('paste', (e) => {
      e.preventDefault();
      
      // Récupérer le texte du presse-papiers
      const text = (e.clipboardData || window.clipboardData).getData('text');
      
      // Nettoyer le texte
      const cleanText = cleanPastedText(text);
      
      // Insérer le texte nettoyé
      document.execCommand('insertText', false, cleanText);
      
      updateCharCount();
    });
    
    // Compteur de caractères
    function updateCharCount() {
      if (charCountEl) {
        const text = contentEl.innerText || '';
        const count = text.trim().length;
        charCountEl.textContent = `${count} caractère${count !== 1 ? 's' : ''}`;
      }
    }
    
    contentEl.addEventListener('input', updateCharCount);
    
    // Raccourcis clavier
    contentEl.addEventListener('keydown', (e) => {
      // Ctrl+B pour Bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false, null);
      }
      
      // Ctrl+I pour Italic
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false, null);
      }
      
      // Ctrl+K pour lien (comme dans beaucoup d'éditeurs)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        showLinkModal();
      }
    });
    
    // ==========================================
    // GESTION DES LIENS
    // ==========================================
    
    let savedSelection = null;
    
    function saveSelection() {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        savedSelection = sel.getRangeAt(0);
      }
    }
    
    function restoreSelection() {
      if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
    }
    
    function showLinkModal() {
      saveSelection();
      
      const linkTextInput = linkModal.querySelector('.ifen-link-text');
      const linkUrlInput = linkModal.querySelector('.ifen-link-url');
      const linkNewTabInput = linkModal.querySelector('.ifen-link-newtab');
      
      // Récupérer le texte sélectionné
      const selectedText = window.getSelection().toString();
      linkTextInput.value = selectedText || '';
      linkUrlInput.value = '';
      linkNewTabInput.checked = true;
      
      linkModal.style.display = 'flex';
      linkUrlInput.focus();
    }
    
    function hideLinkModal() {
      linkModal.style.display = 'none';
    }
    
    function insertLink() {
      const linkTextInput = linkModal.querySelector('.ifen-link-text');
      const linkUrlInput = linkModal.querySelector('.ifen-link-url');
      const linkNewTabInput = linkModal.querySelector('.ifen-link-newtab');
      
      const linkText = linkTextInput.value.trim();
      const linkUrl = linkUrlInput.value.trim();
      const newTab = linkNewTabInput.checked;
      
      if (!linkUrl) {
        alert('Veuillez entrer une URL');
        return;
      }
      
      restoreSelection();
      
      // Créer le lien
      const link = document.createElement('a');
      link.href = linkUrl;
      link.textContent = linkText || linkUrl;
      if (newTab) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      
      // Insérer le lien
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(link);
        
        // Déplacer le curseur après le lien
        range.setStartAfter(link);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      
      hideLinkModal();
      contentEl.focus();
      updateCharCount();
    }
    
    // Événements du modal
    linkModal.querySelector('.ifen-link-modal-close').addEventListener('click', hideLinkModal);
    linkModal.querySelector('.ifen-link-modal-cancel').addEventListener('click', hideLinkModal);
    linkModal.querySelector('.ifen-link-modal-insert').addEventListener('click', insertLink);
    
    // Fermer le modal si on clique en dehors
    linkModal.addEventListener('click', (e) => {
      if (e.target === linkModal) {
        hideLinkModal();
      }
    });
    
    // Enter dans l'input URL = insérer
    linkModal.querySelector('.ifen-link-url').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        insertLink();
      }
    });
    
    // ==========================================
    // FONCTION COLLER TEXTE BRUT
    // ==========================================
    
    async function pasteAsPlainText() {
      try {
        const text = await navigator.clipboard.readText();
        const cleanText = cleanPastedText(text);
        document.execCommand('insertText', false, cleanText);
        contentEl.focus();
        updateCharCount();
      } catch (err) {
        console.error('Erreur lors du collage:', err);
        alert('Impossible d\'accéder au presse-papiers. Utilisez Ctrl+V pour coller.');
      }
    }
    
    // ==========================================
    // API PUBLIQUE
    // ==========================================
    
    return {
      /**
       * Obtenir le contenu HTML
       */
      getValue: function() {
        return cleanHTML(contentEl.innerHTML);
      },
      
      /**
       * Définir le contenu
       */
      setValue: function(content) {
        contentEl.innerHTML = content;
        updateCharCount();
      },
      
      /**
       * Obtenir le texte brut (sans formatage)
       */
      getPlainText: function() {
        return contentEl.innerText || '';
      },
      
      /**
       * Vider l'éditeur
       */
      clear: function() {
        contentEl.innerHTML = '';
        updateCharCount();
      },
      
      /**
       * Focus sur l'éditeur
       */
      focus: function() {
        contentEl.focus();
      },
      
      /**
       * Désactiver l'éditeur
       */
      disable: function() {
        contentEl.contentEditable = false;
        editorEl.classList.add('ifen-editor-disabled');
      },
      
      /**
       * Activer l'éditeur
       */
      enable: function() {
        contentEl.contentEditable = true;
        editorEl.classList.remove('ifen-editor-disabled');
      },
      
      /**
       * Détruire l'éditeur
       */
      destroy: function() {
        container.innerHTML = '';
      }
    };
  }

  // ==========================================
  // STYLES CSS
  // ==========================================
  
  function injectStyles() {
    if (document.getElementById('ifen-advanced-editor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ifen-advanced-editor-styles';
    style.textContent = `
      /* ===== IFEN ADVANCED TEXT EDITOR - STYLES ===== */
      
      /* Font IFEN */
      @font-face {
        font-family: 'Barlow Semi Condensed';
        src: url("https://learningpshere.ifen.lu/pluginfile.php/1/theme_boost_union/customfonts/0/BarlowSemiCondensed-Regular.ttf") format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      
      .ifen-advanced-editor {
        font-family: 'Barlow Semi Condensed', sans-serif;
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        overflow: hidden;
        background-color: #fff;
        transition: border-color 0.2s ease;
      }
      
      .ifen-advanced-editor:focus-within {
        border-color: #00b2bb;
        box-shadow: 0 0 0 3px rgba(0, 178, 187, 0.1);
      }
      
      /* Toolbar */
      .ifen-editor-toolbar {
        background: linear-gradient(135deg, #00b2bb 0%, #1F154d 100%);
        padding: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      .ifen-toolbar-group {
        display: flex;
        gap: 6px;
        align-items: center;
        position: relative;
      }
      
      .ifen-editor-btn {
        background: rgba(255, 255, 255, 0.95);
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        color: #1F154d;
        transition: all 0.2s ease;
        font-family: 'Barlow Semi Condensed', sans-serif;
        white-space: nowrap;
      }
      
      .ifen-editor-btn:hover {
        background: rgba(255, 255, 255, 1);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
      
      .ifen-editor-btn:active {
        transform: translateY(0);
      }
      
      .ifen-editor-btn strong,
      .ifen-editor-btn em {
        font-size: 16px;
        font-style: normal;
      }
      
      .ifen-editor-btn em {
        font-style: italic;
      }
      
      /* Sélecteur de couleur */
      .ifen-editor-color-picker-btn .color-icon {
        font-weight: bold;
        font-size: 16px;
        color: #1F154d;
      }
      
      .ifen-editor-color-picker {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        background: white;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        z-index: 1000;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        max-width: 280px;
      }
      
      .ifen-editor-color-btn {
        width: 32px;
        height: 32px;
        border: 2px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }
      
      .ifen-editor-color-btn:hover {
        transform: scale(1.15);
        border-color: #1F154d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      /* Zone de contenu éditable */
      .ifen-editor-content {
        padding: 20px;
        min-height: 300px;
        max-height: 600px;
        overflow-y: auto;
        font-size: 15px;
        line-height: 1.6;
        color: #333;
        outline: none;
      }
      
      .ifen-editor-content:empty:before {
        content: attr(data-placeholder);
        color: #999;
        font-style: italic;
      }
      
      /* Formatage dans le contenu */
      .ifen-editor-content strong,
      .ifen-editor-content b {
        font-weight: 700;
        color: #1F154d;
      }
      
      .ifen-editor-content em,
      .ifen-editor-content i {
        font-style: italic;
        color: #00b2bb;
      }
      
      .ifen-editor-content u {
        text-decoration: underline;
      }
      
      .ifen-editor-content a {
        color: #00b2bb;
        text-decoration: underline;
        cursor: pointer;
      }
      
      .ifen-editor-content a:hover {
        color: #1F154d;
      }
      
      /* Listes */
      .ifen-editor-content ul,
      .ifen-editor-content ol {
        margin: 10px 0;
        padding-left: 30px;
      }
      
      .ifen-editor-content ul li {
        list-style-type: disc;
        margin: 5px 0;
      }
      
      .ifen-editor-content ol li {
        list-style-type: decimal;
        margin: 5px 0;
      }
      
      /* Alignement */
      .ifen-editor-content [style*="text-align: center"] {
        text-align: center;
      }
      
      .ifen-editor-content [style*="text-align: right"] {
        text-align: right;
      }
      
      .ifen-editor-content [style*="text-align: justify"] {
        text-align: justify;
      }
      
      /* Footer avec compteur */
      .ifen-editor-footer {
        background-color: #f8f9fa;
        padding: 10px 20px;
        border-top: 1px solid #e0e0e0;
        text-align: right;
      }
      
      .ifen-editor-charcount {
        font-size: 13px;
        color: #666;
        font-family: 'Barlow Semi Condensed', sans-serif;
      }
      
      /* État désactivé */
      .ifen-editor-disabled .ifen-editor-content {
        background-color: #f5f5f5;
        cursor: not-allowed;
        color: #999;
      }
      
      .ifen-editor-disabled .ifen-editor-toolbar {
        opacity: 0.5;
        pointer-events: none;
      }
      
      /* ===== MODAL LIEN ===== */
      .ifen-link-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: 'Barlow Semi Condensed', sans-serif;
      }
      
      .ifen-link-modal-content {
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 500px;
        overflow: hidden;
      }
      
      .ifen-link-modal-header {
        background: linear-gradient(135deg, #00b2bb 0%, #1F154d 100%);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .ifen-link-modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      .ifen-link-modal-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ifen-link-modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }
      
      .ifen-link-modal-body {
        padding: 25px;
      }
      
      .ifen-link-modal-body label {
        display: block;
        margin-bottom: 15px;
      }
      
      .ifen-link-modal-body label strong {
        display: block;
        margin-bottom: 6px;
        color: #1F154d;
        font-size: 14px;
      }
      
      .ifen-link-modal-body input[type="text"],
      .ifen-link-modal-body input[type="url"] {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Barlow Semi Condensed', sans-serif;
        transition: border-color 0.2s ease;
      }
      
      .ifen-link-modal-body input[type="text"]:focus,
      .ifen-link-modal-body input[type="url"]:focus {
        outline: none;
        border-color: #00b2bb;
        box-shadow: 0 0 0 3px rgba(0, 178, 187, 0.1);
      }
      
      .ifen-link-modal-body input[type="checkbox"] {
        margin-right: 8px;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .ifen-link-modal-footer {
        padding: 20px 25px;
        background: #f8f9fa;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .ifen-link-modal-footer button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Barlow Semi Condensed', sans-serif;
      }
      
      .ifen-link-modal-cancel {
        background: #e0e0e0;
        color: #333;
      }
      
      .ifen-link-modal-cancel:hover {
        background: #d0d0d0;
      }
      
      .ifen-link-modal-insert {
        background: linear-gradient(135deg, #00b2bb 0%, #1F154d 100%);
        color: white;
      }
      
      .ifen-link-modal-insert:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 178, 187, 0.4);
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .ifen-editor-toolbar {
          padding: 10px;
          gap: 8px;
        }
        
        .ifen-toolbar-group {
          gap: 5px;
        }
        
        .ifen-editor-btn {
          padding: 6px 10px;
          font-size: 13px;
        }
        
        .ifen-editor-content {
          padding: 15px;
          font-size: 14px;
        }
        
        .ifen-link-modal-content {
          width: 95%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Injecter les styles au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // ==========================================
  // API PUBLIQUE DU MODULE
  // ==========================================
  
  return {
    /**
     * Créer une nouvelle instance d'éditeur
     * @param {string|HTMLElement} container - Sélecteur CSS ou élément DOM
     * @param {Object} options - Options de configuration
     * @returns {Object} Instance de l'éditeur
     */
    create: createEditor,
    
    /**
     * Nettoyer du texte (utilitaire public)
     * @param {string} text - Texte à nettoyer
     * @returns {string} Texte nettoyé
     */
    cleanText: cleanPastedText,
    
    /**
     * Version de l'éditeur
     */
    version: '1.0.0'
  };
})();

// Export pour utilisation en module (optionnel)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IFENAdvancedEditor;
}