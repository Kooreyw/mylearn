<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>English Reader</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/m_style.css?v=2">
</head>

<body class="mobile-native-theme">
    <!-- 极简背景氛围 -->
    <div class="background-grain"></div>

    <!-- 顶部状态胶囊 (非固定 Header, 随滚动消失) -->
    <div id="scroll-status-bar">
        <span id="current-article-title">准备就绪</span>
    </div>

    <!-- 流式阅读器入口 -->
    <main id="reader-flow-container">
        <div id="reader-content-top-spacer"></div>
        <div id="reader-flow" class="immersive-content">
            <!-- 句子流动态加载 -->
            <div class="initial-loading">
                <div class="spinner"></div>
                <p>正在同步学习数据...</p>
            </div>
        </div>
        <div id="reader-content-bottom-spacer"></div>
    </main>

    <!-- 极简悬浮式控制中心 -->
    <nav id="mobile-navigation">
        <!-- 音频胶囊 -->
        <div id="audio-capsule" class="collapsed">
            <div class="capsule-track">
                <button class="capsule-btn" id="btn-prev">⏮</button>
                <div id="play-trigger" class="play-pulse">
                    <button class="capsule-btn-main" id="btn-play">▶</button>
                </div>
                <button class="capsule-btn" id="btn-next">⏭</button>
            </div>
        </div>

        <!-- 功能 FAB -->
        <button id="main-fab" class="fab-trigger">
            <span class="fab-icon">✦</span>
        </button>
    </nav>

    <!-- 全屏遮罩菜单 (设置 & 文章选择) -->
    <div id="native-menu-overlay" class="native-overlay">
        <div class="overlay-blur"></div>
        <div class="overlay-content">
            <header class="overlay-header">
                <h2>库</h2>
                <button class="close-overlay">&times;</button>
            </header>

            <section class="overlay-section">
                <label>选择文章</label>
                <div id="article-list-native" class="native-list">
                    <!-- JS 填充 -->
                </div>
            </section>

            <section class="overlay-section">
                <label>偏好</label>
                <div class="preference-grid">
                    <button class="pref-btn active" data-mode="reading">精读</button>
                    <button class="pref-btn" data-mode="learning">翻译</button>
                </div>
            </section>
        </div>
    </div>

    <!-- 底部详情弹出片 (单词/语法分析) -->
    <div id="bottom-detail-sheet" class="bottom-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-content" id="analysis-content">
            <!-- 点击句子动态填充内容 -->
        </div>
    </div>

    <script src="js/m_script.js?v=2"></script>
</body>

</html>