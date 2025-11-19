# 📘 GUIDE D'INTÉGRATION - IFEN Advanced Editor

**Document pour intégrer l'éditeur IFEN dans votre projet**

---

## 📦 INFORMATIONS GÉNÉRALES

### Nom du composant
**IFEN Advanced Editor** - Éditeur de texte WYSIWYG

### Version
**1.0.0** (Novembre 2025)

### Type
Éditeur de texte riche standalone (JavaScript vanilla ES6+)

### Compatibilité
- **Plateforme** : Moodle 4.4.9+ (mais utilisable partout)
- **Navigateurs** : Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Base de données** : MariaDB / MySQL 5.7+
- **PHP** : 7.4+

---

## 🔗 DÉPENDANCES

### Aucune dépendance externe
✅ **Standalone** - Pas de jQuery, Bootstrap, ou autre librairie requise  
✅ **CSS intégré** - Style injecté automatiquement  
✅ **Font incluse** - Barlow Semi Condensed chargée automatiquement

---

## 📂 FICHIERS À INCLURE

### Fichiers JavaScript (1 fichier)
```
ifen-advanced-editor.js (29 KB)
```

**Emplacement sur le serveur IFEN :**
```
/export/hosting/men/ifen/htdocs-learningsphere/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js
```

**URL publique :**
```
https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js
```

---

### Fichiers PHP (2 fichiers - optionnels)
Si vous voulez sauvegarder/charger depuis la base de données :

```
editor_save_api.php (6.5 KB)
editor_load_api.php (3.4 KB)
```

**Emplacement sur le serveur IFEN :**
```
/export/hosting/men/ifen/htdocs-learningsphere/ifen_html/ifen-advanced-editor/editor_save_api.php
/export/hosting/men/ifen/htdocs-learningsphere/ifen_html/ifen-advanced-editor/editor_load_api.php
```

**URLs publiques :**
```
https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/editor_save_api.php
https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/editor_load_api.php
```

---

## 💻 INTÉGRATION DANS VOTRE PROJET

### Étape 1 : Inclure le script JavaScript

```html
<!-- Dans le <head> ou avant </body> -->
<script src="https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js"></script>
```

**Ou en chemin relatif si dans le même domaine :**
```html
<script src="/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js"></script>
```

---

### Étape 2 : Créer un container HTML

```html
<!-- Container pour l'éditeur -->
<div id="mon-editeur"></div>
```

---

### Étape 3 : Initialiser l'éditeur

```javascript
// Initialisation simple
const editor = IFENAdvancedEditor.create('#mon-editeur');
```

**Avec options :**
```javascript
const editor = IFENAdvancedEditor.create('#mon-editeur', {
  placeholder: 'Entrez votre texte ici...',
  minHeight: '300px',
  maxHeight: '600px',
  showCharCount: true
});
```

---

## 🎛️ API PUBLIQUE

### Méthodes disponibles

#### `getValue()`
Obtenir le contenu HTML.
```javascript
const html = editor.getValue();
// Retourne: '<strong>Texte</strong> avec <span style="color:#00b2bb;">couleur</span>'
```

#### `setValue(content)`
Définir le contenu HTML.
```javascript
editor.setValue('<strong>Mon contenu</strong>');
```

#### `getPlainText()`
Obtenir le texte brut sans HTML.
```javascript
const text = editor.getPlainText();
// Retourne: 'Mon contenu sans balises'
```

#### `clear()`
Vider l'éditeur.
```javascript
editor.clear();
```

#### `focus()`
Donner le focus à l'éditeur.
```javascript
editor.focus();
```

#### `disable()` / `enable()`
Désactiver ou réactiver l'éditeur.
```javascript
editor.disable();  // Lecture seule
editor.enable();   // Éditable
```

#### `destroy()`
Détruire l'éditeur et nettoyer le DOM.
```javascript
editor.destroy();
```

---

## ⚙️ OPTIONS DE CONFIGURATION

```javascript
{
  // Texte affiché quand l'éditeur est vide
  placeholder: 'Entrez votre texte ici...',
  
  // Hauteur minimale de la zone d'édition
  minHeight: '300px',
  
  // Hauteur maximale (scroll si dépassé)
  maxHeight: '600px',
  
  // Afficher le compteur de caractères
  showCharCount: true,
  
  // Palette de couleurs personnalisée (optionnel)
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
}
```

---

## ✨ FONCTIONNALITÉS

| Fonctionnalité | Description | Raccourci |
|----------------|-------------|-----------|
| **Bold** | Texte en gras | `Ctrl+B` |
| **Italic** | Texte en italique | `Ctrl+I` |
| **Couleurs** | 8 couleurs palette IFEN | Bouton |
| **Listes** | À puces et numérotées | Bouton |
| **Alignement** | Gauche, centre, droite, justifié | Bouton |
| **Liens** | Insertion avec modal | `Ctrl+K` |
| **Coller** | Texte brut uniquement (nettoyage auto) | `Ctrl+V` |
| **Compteur** | Nombre de caractères | Auto |

---

## 🔄 FORMAT DE SORTIE

### HTML généré (propre et sécurisé)

**Balises autorisées :**
- `<strong>`, `<em>` - Formatage
- `<span>` - Couleurs (avec `style="color:..."`)
- `<ul>`, `<ol>`, `<li>` - Listes
- `<a>` - Liens (avec `href`, `target`, `rel`)
- `<p>`, `<div>` - Paragraphes (avec `style="text-align:..."`)
- `<br>` - Retours à la ligne

**Exemple de sortie :**
```html
<p><strong style="color: #1F154d;">Titre important</strong></p>
<p>Texte normal avec <em>italique</em> et 
<span style="color: #00b2bb;">turquoise</span>.</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<p style="text-align: center;">Texte centré</p>
<p><a href="https://ifen.lu" target="_blank" rel="noopener noreferrer">Lien</a></p>
```

---

## 💾 SAUVEGARDE EN BASE DE DONNÉES

### Structure de table requise

Si vous voulez sauvegarder dans la base de données IFEN :

```sql
CREATE TABLE IF NOT EXISTS mdl_editor_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  element_id INT NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT DEFAULT NULL,
  course_id INT DEFAULT NULL,
  element_type VARCHAR(50) DEFAULT NULL,
  INDEX idx_element_id (element_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Sauvegarder via API

```javascript
fetch('https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/editor_save_api.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    element_id: 123,  // ID unique de votre élément
    content: editor.getValue()
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Sauvegardé :', data.action); // 'insert' ou 'update'
  } else {
    console.error('Erreur :', data.error);
  }
});
```

### Charger via API

```javascript
fetch('https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/editor_load_api.php?element_id=123')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.content) {
      editor.setValue(data.content);
    }
  });
```

---

## 🔒 SÉCURITÉ

### Nettoyage automatique
✅ Suppression des balises dangereuses (`<script>`, `<iframe>`, etc.)  
✅ Suppression des attributs dangereux (`onclick`, `onerror`, etc.)  
✅ Nettoyage du code Word/Excel  
✅ HTML propre et sécurisé en sortie

### Protection XSS
✅ Validation côté client (JavaScript)  
✅ Validation côté serveur (PHP API)  
✅ `strip_tags()` sur les balises non autorisées  
✅ Échappement MySQL avec `mysqli_real_escape_string`

---

## 📱 RESPONSIVE

✅ **Desktop** : Toolbar sur une ligne  
✅ **Mobile** : Toolbar en colonnes  
✅ **Tactile** : Boutons optimisés  
✅ **Breakpoint** : 768px

---

## 🎨 STYLE IFEN

### Charte graphique intégrée
- **Font** : Barlow Semi Condensed (chargée automatiquement)
- **Couleurs** : Violet `#1F154d` et Turquoise `#00b2bb`
- **Gradients** : `linear-gradient(135deg, #00b2bb 0%, #1F154d 100%)`
- **Border-radius** : 15px
- **Ombres** : `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)`

**Le style est injecté automatiquement, aucun CSS externe requis.**

---

## 📊 PERFORMANCES

| Métrique | Valeur |
|----------|--------|
| Taille JS | 29 KB |
| Taille gzip | ~8 KB |
| Initialisation | < 50ms |
| Mémoire | ~2-3 MB |

---

## 💡 EXEMPLES DE CODE COMPLETS

### Exemple 1 : Intégration simple

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon projet avec éditeur IFEN</title>
</head>
<body>
    <h1>Créer du contenu</h1>
    
    <!-- Éditeur -->
    <div id="mon-editeur"></div>
    
    <!-- Boutons -->
    <button onclick="sauvegarder()">Sauvegarder</button>
    <button onclick="afficher()">Afficher HTML</button>
    
    <!-- Script -->
    <script src="https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js"></script>
    <script>
        // Créer l'éditeur
        const editor = IFENAdvancedEditor.create('#mon-editeur', {
            placeholder: 'Entrez votre contenu...',
            minHeight: '300px'
        });
        
        // Sauvegarder dans votre système
        function sauvegarder() {
            const html = editor.getValue();
            
            // Envoyer à votre API
            fetch('/votre-api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: html })
            })
            .then(response => response.json())
            .then(data => {
                alert('Sauvegardé !');
            });
        }
        
        // Afficher le HTML
        function afficher() {
            const html = editor.getValue();
            console.log('HTML:', html);
            alert(html);
        }
    </script>
</body>
</html>
```

---

### Exemple 2 : Avec chargement initial

```html
<script src="https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js"></script>

<div id="mon-editeur"></div>
<button onclick="sauvegarder()">Sauvegarder</button>

<script>
    // Créer l'éditeur
    const editor = IFENAdvancedEditor.create('#mon-editeur');
    
    // Charger le contenu existant au démarrage
    window.addEventListener('load', function() {
        // Depuis votre API
        fetch('/votre-api/load?id=123')
            .then(response => response.json())
            .then(data => {
                if (data.content) {
                    editor.setValue(data.content);
                }
            });
    });
    
    // Sauvegarder
    function sauvegarder() {
        const html = editor.getValue();
        fetch('/votre-api/save', {
            method: 'POST',
            body: JSON.stringify({ id: 123, content: html })
        });
    }
</script>
```

---

### Exemple 3 : Dans un modal

```html
<!-- Bouton -->
<button onclick="openModal()">Éditer</button>

<!-- Modal -->
<div id="myModal" style="display:none;">
    <div class="modal-content">
        <h2>Éditer le contenu</h2>
        <div id="modal-editor"></div>
        <button onclick="saveAndClose()">Sauvegarder</button>
        <button onclick="closeModal()">Annuler</button>
    </div>
</div>

<script src="https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js"></script>
<script>
    let modalEditor = null;
    
    function openModal() {
        // Créer l'éditeur si nécessaire
        if (!modalEditor) {
            modalEditor = IFENAdvancedEditor.create('#modal-editor', {
                minHeight: '250px'
            });
        }
        
        // Charger le contenu
        fetch('/votre-api/load?id=123')
            .then(response => response.json())
            .then(data => {
                modalEditor.setValue(data.content || '');
            });
        
        // Afficher le modal
        document.getElementById('myModal').style.display = 'block';
    }
    
    function saveAndClose() {
        const html = modalEditor.getValue();
        
        fetch('/votre-api/save', {
            method: 'POST',
            body: JSON.stringify({ id: 123, content: html })
        })
        .then(() => {
            closeModal();
            location.reload(); // Recharger la page
        });
    }
    
    function closeModal() {
        document.getElementById('myModal').style.display = 'none';
    }
</script>
```

---

## 🆘 SUPPORT & DÉPANNAGE

### Problème : L'éditeur ne s'affiche pas

**Vérifier :**
1. Le script JS est bien chargé (voir onglet Network dans F12)
2. Le container existe : `<div id="mon-editeur"></div>`
3. Pas d'erreur JavaScript dans la console (F12)

**Solution :**
```javascript
// Vérifier que le script est chargé
if (typeof IFENAdvancedEditor !== 'undefined') {
    console.log('✅ Éditeur chargé');
} else {
    console.error('❌ Éditeur non chargé');
}
```

---

### Problème : Le style ne s'applique pas

**Vérifier :**
1. La font Barlow Semi Condensed se charge
2. Pas de conflit CSS avec votre projet
3. Les styles IFEN sont injectés

**Solution :**
```javascript
// Vérifier que les styles sont injectés
if (document.getElementById('ifen-advanced-editor-styles')) {
    console.log('✅ Styles injectés');
} else {
    console.error('❌ Styles non injectés');
}
```

---

### Problème : Conflit avec d'autres éditeurs

**Solution :**
L'éditeur IFEN est complètement standalone et ne devrait pas entrer en conflit. Si problème :
```javascript
// Initialiser avec un namespace unique
const monEditeurUnique = IFENAdvancedEditor.create('#editeur-unique-1');
const monAutreEditeur = IFENAdvancedEditor.create('#editeur-unique-2');
```

---

## 📞 CONTACT & RESSOURCES

### Documentation complète
Voir les fichiers :
- `INSTALLATION_ADAPTEE.md` - Guide d'installation détaillé
- `README_ADAPTE.md` - Documentation API complète

### Démo en ligne
```
https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor-demo.html
```

### URLs des fichiers
```
JS:   https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js
Demo: https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor-demo.html
API:  https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/editor_save_api.php
      https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/editor_load_api.php
```

---

## ✅ CHECKLIST D'INTÉGRATION

- [ ] Script JS inclus dans votre page
- [ ] Container HTML créé avec un ID unique
- [ ] Éditeur initialisé avec `IFENAdvancedEditor.create()`
- [ ] Options configurées (placeholder, hauteurs, etc.)
- [ ] Méthodes `getValue()` / `setValue()` testées
- [ ] Sauvegarde implémentée (votre API ou API IFEN)
- [ ] Chargement implémenté
- [ ] Testé sur desktop et mobile
- [ ] Testé sur Chrome, Firefox, Safari

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

**En 3 lignes de code :**
```html
<script src="https://learningsphere.ifen.lu/ifen_html/ifen-advanced-editor/ifen-advanced-editor.js"></script>
<div id="mon-editeur"></div>
<script>const editor = IFENAdvancedEditor.create('#mon-editeur');</script>
```

**Pour récupérer le contenu :**
```javascript
const html = editor.getValue();
```

**Pour définir le contenu :**
```javascript
editor.setValue('<strong>Mon contenu</strong>');
```

---

**Voilà ! Vous avez toutes les informations pour intégrer l'éditeur IFEN dans votre projet ! 🚀**

---

**Version 1.0 - Novembre 2025**  
**Créé pour IFEN Luxembourg 🇱🇺**
