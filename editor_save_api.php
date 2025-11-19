<?php
/**
 * API PHP - Exemple de sauvegarde du contenu de l'éditeur IFEN
 * 
 * Fichier à placer dans : /export/hosting/men/ifen/htdocs-learningsphere/ifen_html/activity_element/
 * 
 * Usage depuis JavaScript :
 * fetch('/ifen_html/activity_element/editor_save_api.php', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ element_id: 123, content: '<p>Mon contenu</p>' })
 * });
 */

// ==========================================
// CONFIGURATION
// ==========================================

// Activer les erreurs en développement (désactiver en production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// CONNEXION À LA BASE DE DONNÉES
// ==========================================

// Informations de connexion (À ADAPTER selon votre configuration)
define('DB_HOST', 'mysql.restena.lu');
define('DB_NAME', 'ifenlmsmain1db');
define('DB_USER', 'ifen');
define('DB_PASS', '5Qmeytvw9JTyNMnL');

// Connexion MySQLi
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Vérifier la connexion
if ($mysqli->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion à la base de données',
        'details' => $mysqli->connect_error
    ]);
    exit();
}

// Définir le charset UTF-8
$mysqli->set_charset('utf8mb4');

// ==========================================
// RÉCUPÉRER LES DONNÉES DE LA REQUÊTE
// ==========================================

// Récupérer le JSON envoyé
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Vérifier que les données sont valides
if (!$data || !is_array($data)) {
    echo json_encode([
        'success' => false,
        'error' => 'Données JSON invalides'
    ]);
    exit();
}

// ==========================================
// VALIDATION DES DONNÉES
// ==========================================

// Vérifier les champs obligatoires
$element_id = isset($data['element_id']) ? intval($data['element_id']) : 0;
$content = isset($data['content']) ? trim($data['content']) : '';

if ($element_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'ID de l\'élément manquant ou invalide'
    ]);
    exit();
}

if (empty($content)) {
    echo json_encode([
        'success' => false,
        'error' => 'Contenu vide'
    ]);
    exit();
}

// ==========================================
// NETTOYAGE ET SÉCURISATION DU HTML
// ==========================================

/**
 * Nettoyer le HTML pour éviter les failles XSS
 * Garde uniquement les balises autorisées par l'éditeur
 */
function cleanHTML($html) {
    // Balises autorisées (conformes à l'éditeur)
    $allowed_tags = '<strong><em><u><span><ul><ol><li><a><p><div><br>';
    
    // Nettoyer les balises
    $html = strip_tags($html, $allowed_tags);
    
    // Nettoyer les attributs dangereux (onclick, onerror, etc.)
    $html = preg_replace('/on\w+\s*=\s*["\'][^"\']*["\']/i', '', $html);
    
    // Nettoyer les javascript: dans les href
    $html = preg_replace('/href\s*=\s*["\']javascript:[^"\']*["\']/i', 'href="#"', $html);
    
    return $html;
}

// Nettoyer le contenu
$content = cleanHTML($content);

// Échapper pour MySQL
$content = $mysqli->real_escape_string($content);

// ==========================================
// SAUVEGARDER DANS LA BASE DE DONNÉES
// ==========================================

/**
 * OPTION 1 : Créer une nouvelle table pour le contenu de l'éditeur
 * 
 * Structure de table recommandée :
 * 
 * CREATE TABLE mdl_editor_content (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   element_id INT NOT NULL,
 *   content LONGTEXT NOT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   user_id INT,
 *   course_id INT,
 *   INDEX idx_element_id (element_id)
 * );
 */

// Vérifier si l'élément existe déjà
$check_query = "SELECT id FROM mdl_editor_content WHERE element_id = $element_id";
$check_result = $mysqli->query($check_query);

if ($check_result && $check_result->num_rows > 0) {
    // UPDATE : L'élément existe déjà
    $update_query = "UPDATE mdl_editor_content 
                     SET content = '$content', 
                         updated_at = NOW() 
                     WHERE element_id = $element_id";
    
    if ($mysqli->query($update_query)) {
        echo json_encode([
            'success' => true,
            'message' => 'Contenu mis à jour avec succès',
            'element_id' => $element_id,
            'content_length' => strlen($content),
            'action' => 'update'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Erreur lors de la mise à jour',
            'details' => $mysqli->error
        ]);
    }
} else {
    // INSERT : Nouvel élément
    $insert_query = "INSERT INTO mdl_editor_content (element_id, content, created_at, updated_at) 
                     VALUES ($element_id, '$content', NOW(), NOW())";
    
    if ($mysqli->query($insert_query)) {
        $new_id = $mysqli->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Contenu créé avec succès',
            'element_id' => $element_id,
            'id' => $new_id,
            'content_length' => strlen($content),
            'action' => 'insert'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Erreur lors de la création',
            'details' => $mysqli->error
        ]);
    }
}

/**
 * OPTION 2 : Utiliser une table existante
 * 
 * Si vous avez déjà une table (ex: mdl_accordion_items),
 * adaptez la requête :
 */

/*
// Exemple avec mdl_accordion_items
$update_query = "UPDATE mdl_accordion_items 
                 SET content = '$content', 
                     timemodified = " . time() . " 
                 WHERE id = $element_id";

if ($mysqli->query($update_query)) {
    echo json_encode([
        'success' => true,
        'message' => 'Contenu mis à jour',
        'element_id' => $element_id
    ]);
}
*/

// Fermer la connexion
$mysqli->close();

?>