<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Configuração do banco
$host = "localhost";
$db   = "cadastro";     // altere se o nome for outro
$user = "root";          // seu usuário do MySQL
$pass = "senai508";              // senha do MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Pega histórico (limitei em 50 linhas mais recentes)
    $stmt = $pdo->query("
        SELECT 
            id,
            cidade,
            estado,
            medicao_em,
            temperatura_ar,
            umidade_ar,
            precipitacao,
            velocidade_vento,
            direcao_vento,
            ph_solo,
            umidade_solo,
            nitrogenio,
            fosforo,
            potassio
        FROM medicoes
        ORDER BY medicao_em DESC
        LIMIT 50
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}