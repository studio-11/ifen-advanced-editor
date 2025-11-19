<?php
/**
 * API PHP - Exemple de chargement du contenu de l'éditeur IFEN
 * 
 * Fichier à placer dans : /export/hosting/men/ifen/htdocs-learningsphere/ifen_html/activity_element/
 * 
 * Usage depuis JavaScript :
 * fetch('/ifen_html/activity_element/editor_load_api.php?element_id=123')
 *   .then(response => response.json())
 *   .then(data => {
 *     if (data.success) {
 *       editor.setValue(data.content);
 *     }
 *   });
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
// RÉCUPÉRER LES PARAMÈTRES
// ==========================================

// Récupérer l'ID de l'élément depuis les paramètres GET
$element_id = isset($_GET['element_id']) ? intval($_GET['element_id']) : 0;

// Vérifier l'ID
if ($element_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'ID de l\'élément manquant ou invalide'
    ]);
    exit();
}

// ==========================================
// CHARGER LE CONTENU DEPUIS LA BDD
// ==========================================

// Requête pour récupérer le contenu
$query = "SELECT content, created_at, updated_at 
          FROM mdl_editor_content 
          WHERE element_id = $element_id 
          LIMIT 1";

$result = $mysqli->query($query);

if (!$result) {
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la requête',
        'details' => $mysqli->error
    ]);
    exit();
}

// Vérifier si l'élément existe
if ($result->num_rows === 0) {
    echo json_encode([
        'success' => true,
        'content' => '', // Contenu vide si l'élément n'existe pas encore
        'exists' => false,
        'message' => 'Aucun contenu trouvé pour cet élément'
    ]);
    exit();
}

// Récupérer les données
$row = $result->fetch_assoc();

// Retourner le contenu
echo json_encode([
    'success' => true,
    'content' => $row['content'],
    'exists' => true,
    'created_at' => $row['created_at'],
    'updated_at' => $row['updated_at'],
    'content_length' => strlen($row['content'])
]);

// Fermer la connexion
$mysqli->close();

?>