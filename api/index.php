<?php
/**
 * English Study App — PHP 后端 API
 * 
 * 路由:
 *   GET /api/articles          → 文章列表
 *   GET /api/articles/{id}     → 文章详情
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 数据目录（相对于项目根目录）
$baseDir = dirname(__DIR__);
$dataDir = $baseDir . '/data/procesed';

// 获取路由参数
$action = $_GET['action'] ?? '';
$articleId = $_GET['id'] ?? '';

switch ($action) {
    case 'list':
        getArticleList($dataDir);
        break;
    case 'detail':
        getArticleDetail($dataDir, $articleId);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action'], JSON_UNESCAPED_UNICODE);
}

/**
 * 获取文章列表
 * 扫描 data/procesed/ 目录下的 .json 文件，返回 [{id, title}]
 */
function getArticleList(string $dataDir): void
{
    $articles = [];

    if (!is_dir($dataDir)) {
        echo json_encode($articles);
        return;
    }

    $files = glob($dataDir . '/*.json');
    sort($files);

    foreach ($files as $filepath) {
        $filename = basename($filepath);
        $articleId = pathinfo($filename, PATHINFO_FILENAME);

        $content = file_get_contents($filepath);
        if ($content === false)
            continue;

        $data = json_decode($content, true);
        if ($data === null)
            continue;

        $title = $data['article_metadata']['title'] ?? $articleId;
        $articles[] = [
            'id' => $articleId,
            'title' => $title,
        ];
    }

    echo json_encode($articles, JSON_UNESCAPED_UNICODE);
}

/**
 * 获取文章详情
 * 读取对应的 JSON 文件并原样返回
 */
function getArticleDetail(string $dataDir, string $articleId): void
{
    if (empty($articleId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing article_id'], JSON_UNESCAPED_UNICODE);
        return;
    }

    // 防止路径遍历攻击
    $articleId = basename($articleId);
    $filepath = $dataDir . '/' . $articleId . '.json';

    if (!file_exists($filepath)) {
        http_response_code(404);
        echo json_encode(['error' => "Article '{$articleId}' not found"], JSON_UNESCAPED_UNICODE);
        return;
    }

    $content = file_get_contents($filepath);
    if ($content === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Error reading file'], JSON_UNESCAPED_UNICODE);
        return;
    }

    // 验证 JSON 有效性后原样输出（避免双重编码）
    $data = json_decode($content);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(['error' => 'Error parsing JSON'], JSON_UNESCAPED_UNICODE);
        return;
    }

    echo $content;
}
