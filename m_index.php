<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="description" content="英语沉浸式阅读工具 — 音标对齐、逐句精听、智能分析">
    <meta name="theme-color" content="#08090e">
    <title>English Reader</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/m_style.css?v=6">
</head>

<body class="mobile-native-theme">
    <!-- 极简背景纹理 -->
    <div class="background-grain"></div>

    <!-- 顶部状态胶囊 (随滚动渐隐) -->
    <div id="scroll-status-bar">
        <span id="current-article-title">准备就绪</span>
    </div>

    <!-- 流式阅读器 -->
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

    <!-- 极简悬浮导航 -->
    <nav id="mobile-navigation">
        <!-- 音频胶囊 -->
        <div id="audio-capsule" class="hidden">
            <div class="capsule-track">
                <button class="capsule-btn" id="btn-prev" aria-label="上一句">⏮</button>
                <div id="play-trigger" class="play-pulse">
                    <button class="capsule-btn-main" id="btn-play" aria-label="播放/暂停">▶</button>
                </div>
                <button class="capsule-btn" id="btn-next" aria-label="下一句">⏭</button>
            </div>
        </div>

        <!-- FAB 主按钮 -->
        <button id="main-fab" class="fab-trigger" aria-label="打开菜单">
            <span class="fab-icon">✦</span>
        </button>
    </nav>

    <!-- 全屏遮罩菜单 -->
    <div id="native-menu-overlay" class="native-overlay">
        <div class="overlay-blur"></div>
        <div class="overlay-content">
            <header class="overlay-header">
                <h2>文库</h2>
                <button class="close-overlay" aria-label="关闭菜单">&times;</button>
            </header>

            <section class="overlay-section">
                <label>选择文章</label>
                <div id="article-list-native" class="native-list">
                    <!-- JS 动态填充 -->
                </div>
            </section>

            <section class="overlay-section">
                <label>播放偏好</label>
                <div class="preference-grid">
                    <button class="pref-btn active" id="btn-loop-toggle">自动循环</button>
                </div>
            </section>

            <section class="overlay-section">
                <label>阅读偏好</label>
                <div class="preference-grid">
                    <button class="pref-btn active" data-mode="reading">精读模式</button>
                    <button class="pref-btn" data-mode="learning">翻译模式</button>
                    <button class="pref-btn" id="btn-show-mobile-questions">查看题目</button>
                </div>
            </section>
        </div>
    </div>

    <!-- 底部抽屉遮罩 -->
    <div id="sheet-backdrop" class="sheet-backdrop"></div>

    <!-- 底部详情抽屉 -->
    <div id="bottom-detail-sheet" class="bottom-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-content" id="analysis-content">
            <!-- 点击句子时动态填充 -->
        </div>
    </div>

    <!-- 隐藏的 Audio 元素 -->
    <audio id="audio-player" preload="auto"></audio>

    <script src="js/m_script.js?v=9"></script>
</body>

</html>