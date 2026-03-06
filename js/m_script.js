/**
 * English Reader · Mobile — 极简沉浸式阅读空间
 * 
 * 功能架构:
 *   1. 流动阅读器 — 句子流式渲染、段落分组
 *   2. 双模态切换 — 精读模式(仅原文) / 翻译模式(原文+行内译文)
 *   3. 音频控制   — 胶囊播放器，逐句播放、自动跳转
 *   4. 详情抽屉   — 学习模式下点击句子弹出分析
 *   5. FAB + 全屏菜单 — 选择文章、切换模式
 */

// ==================== 全局状态 ====================
const state = {
    mode: 'reading',          // 'reading' | 'learning'
    articleData: null,
    sentences: [],
    currentSentenceIdx: -1,
    currentArticleId: null,
    isPlaying: false,
    isLooping: true,
};

// ==================== DOM 缓存 ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const dom = {};

function initDOM() {
    dom.readerFlow         = $('#reader-flow');
    dom.readerContainer    = $('#reader-flow-container');
    dom.statusBar          = $('#scroll-status-bar');
    dom.articleTitle        = $('#current-article-title');
    dom.audioCapsule       = $('#audio-capsule');
    dom.audioPlayer        = document.getElementById('audio-player');
    dom.btnPlay            = $('#btn-play');
    dom.btnPrev            = $('#btn-prev');
    dom.btnNext            = $('#btn-next');
    dom.playTrigger        = $('#play-trigger');
    dom.mainFab            = $('#main-fab');
    dom.overlay            = $('#native-menu-overlay');
    dom.overlayClose       = $('.close-overlay');
    dom.articleListNative   = $('#article-list-native');
    dom.detailSheet        = $('#bottom-detail-sheet');
    dom.analysisContent    = $('#analysis-content');
    dom.sheetBackdrop      = $('#sheet-backdrop');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    bindEvents();
    loadArticleList();
});

// ==================== 事件绑定 ====================
function bindEvents() {
    // 音频控制
    dom.btnPlay.addEventListener('click', togglePlayPause);
    dom.btnPrev.addEventListener('click', () => {
        if (state.currentSentenceIdx > 0) playSentence(state.currentSentenceIdx - 1);
    });
    dom.btnNext.addEventListener('click', playNext);
    dom.audioPlayer.addEventListener('ended', onAudioEnded);
    dom.audioPlayer.addEventListener('error', onAudioError);

    // FAB 菜单
    dom.mainFab.addEventListener('click', toggleOverlay);
    dom.overlayClose.addEventListener('click', closeOverlay);

    // 遮罩层点击关闭
    dom.overlay.addEventListener('click', (e) => {
        if (e.target === dom.overlay || e.target.classList.contains('overlay-blur')) {
            closeOverlay();
        }
    });

    // 底部抽屉遮罩点击关闭
    if (dom.sheetBackdrop) {
        dom.sheetBackdrop.addEventListener('click', closeSheet);
    }

    // 模式切换
    $$('.pref-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchMode(mode);
            $$('.pref-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // 滚动时渐隐状态胶囊 & 音频胶囊
    let scrollTimer;
    dom.readerContainer.addEventListener('scroll', () => {
        const scrollY = dom.readerContainer.scrollTop;

        // 状态栏渐隐
        if (scrollY > 80) {
            dom.statusBar.classList.add('hidden');
        } else {
            dom.statusBar.classList.remove('hidden');
        }

        // 滚动时稍微降低音频胶囊透明度
        const capsuleOpacity = Math.max(0.4, 1 - (scrollY / 600));
        dom.audioCapsule.style.opacity = capsuleOpacity;

        // 滚动结束后恢复
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            dom.audioCapsule.style.opacity = '';
        }, 1500);
    });

    // 触摸优化：阻止 overscroll bounce
    document.body.addEventListener('touchmove', (e) => {
        if (!dom.readerContainer.contains(e.target) &&
            !dom.detailSheet.contains(e.target) &&
            !dom.overlay.contains(e.target)) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ==================== 数据加载 ====================
async function loadArticleList() {
    try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const articles = await res.json();

        dom.articleListNative.innerHTML = '';

        articles.forEach((a, idx) => {
            const item = document.createElement('div');
            item.className = 'native-list-item';
            item.dataset.id = a.id;
            item.textContent = a.title;
            item.addEventListener('click', () => {
                selectArticle(a.id);
                closeOverlay();
            });
            dom.articleListNative.appendChild(item);
        });

        // 自动加载第一篇
        if (articles.length > 0) {
            selectArticle(articles[0].id);
        }
    } catch (err) {
        console.error('加载文章列表失败:', err);
        dom.readerFlow.innerHTML = `
            <div class="initial-loading">
                <p style="color: var(--text-muted);">🔌 无法连接服务器</p>
            </div>`;
    }
}

function selectArticle(id) {
    // 更新列表高亮
    $$('.native-list-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });
    loadArticle(id);
}

async function loadArticle(id) {
    try {
        // 显示加载动画
        dom.readerFlow.innerHTML = `
            <div class="initial-loading">
                <div class="spinner"></div>
                <p>正在同步学习数据...</p>
            </div>`;

        const res = await fetch(`/api/articles/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        state.articleData = await res.json();
        state.sentences = state.articleData.sentences || [];
        state.currentArticleId = id;
        state.currentSentenceIdx = -1;
        state.isPlaying = false;

        // 更新标题
        const title = state.articleData.article_metadata?.title || 'English Reader';
        dom.articleTitle.textContent = title;

        // 显示音频控制
        dom.audioCapsule.classList.remove('hidden');
        dom.btnPlay.textContent = '▶';

        renderFlow();
    } catch (err) {
        console.error('加载文章失败:', err);
        dom.readerFlow.innerHTML = `
            <div class="initial-loading">
                <p style="color: var(--text-muted);">⚠️ 文章加载失败</p>
            </div>`;
    }
}

// ==================== 渲染核心 ====================
function renderFlow() {
    dom.readerFlow.innerHTML = '';

    if (!state.sentences.length) {
        dom.readerFlow.innerHTML = `
            <div class="initial-loading">
                <p>暂无内容</p>
            </div>`;
        return;
    }

    // 按段落分组
    const groups = {};
    state.sentences.forEach((s, idx) => {
        const p = s.paragraph || 1;
        if (!groups[p]) groups[p] = [];
        groups[p].push({ ...s, _idx: idx });
    });

    Object.keys(groups).sort((a, b) => Number(a) - Number(b)).forEach(pKey => {
        const group = groups[pKey];
        const paraDiv = document.createElement('div');
        paraDiv.className = 'paragraph-group';

        group.forEach(s => {
            const node = document.createElement('span');
            node.className = 'sentence-node';
            node.id = `sent-${s._idx}`;

            // 构建带音标的单词
            const words = (s.sentance || '').split(/\s+/).filter(Boolean);
            const phonetics = splitPhonetic(s.phonetic || '');

            words.forEach((w, i) => {
                const box = document.createElement('span');
                box.className = 'word-box';

                const phSpan = document.createElement('span');
                phSpan.className = 'w-ph';
                phSpan.textContent = phonetics[i] || '';

                const wSpan = document.createElement('span');
                wSpan.className = 'w-text';
                wSpan.textContent = w;

                box.appendChild(phSpan);
                box.appendChild(wSpan);
                node.appendChild(box);
                node.appendChild(document.createTextNode(' '));
            });

            node.addEventListener('click', () => onNodeClick(s._idx));
            paraDiv.appendChild(node);

            // 学习模式：渲染行内译文
            if (state.mode === 'learning' && s.translation) {
                const trans = document.createElement('div');
                trans.className = 'inline-translation';
                trans.textContent = s.translation;
                paraDiv.appendChild(trans);
            }
        });

        dom.readerFlow.appendChild(paraDiv);
    });

    // 恢复之前的选中状态
    if (state.currentSentenceIdx >= 0) {
        highlightSentence(state.currentSentenceIdx);
    }
}

/**
 * 切分音标字符串
 */
function splitPhonetic(ph) {
    let cleaned = ph.replace(/^\//, '').replace(/\/$/, '').trim();
    cleaned = cleaned.replace(/<br\s*\/?>/gi, '');
    return cleaned.split(/\s+/).filter(Boolean);
}

// ==================== 句子交互 ====================
function onNodeClick(idx) {
    state.currentSentenceIdx = idx;
    highlightSentence(idx);

    // 学习模式弹出详情
    if (state.mode === 'learning') {
        showAnalysis(idx);
    }

    // 播放音频
    playSentence(idx);
}

function highlightSentence(idx) {
    // 清除所有高亮
    $$('.sentence-node.active').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`sent-${idx}`);
    if (target) {
        target.classList.add('active');
    }
}

// ==================== 全屏菜单 ====================
function toggleOverlay() {
    const isOpen = dom.overlay.classList.contains('visible');
    if (isOpen) {
        closeOverlay();
    } else {
        openOverlay();
    }
}

function openOverlay() {
    dom.overlay.classList.add('visible');
    dom.mainFab.classList.add('open');
    // 阻止背景滚动
    dom.readerContainer.style.overflow = 'hidden';
}

function closeOverlay() {
    dom.overlay.classList.remove('visible');
    dom.mainFab.classList.remove('open');
    dom.readerContainer.style.overflow = '';
}

// ==================== 模式切换 ====================
function switchMode(mode) {
    state.mode = mode;
    renderFlow();
}

// ==================== 详情抽屉 ====================
function showAnalysis(idx) {
    const s = state.sentences[idx];
    if (!s) return;

    const analysis = s.analysis || {};
    let html = '';

    // 翻译标题
    html += `<h3>${s.translation || ''}</h3>`;

    // 长难句分析
    if (analysis.long_sentence_analysis) {
        html += `
            <div class="analysis-box">
                <h4>📐 长难句分析</h4>
                <p>${analysis.long_sentence_analysis}</p>
            </div>`;
    }

    // 核心词汇
    if (analysis.core_vocabulary?.length) {
        html += `<div class="analysis-box"><h4>📝 核心词汇</h4><ul>`;
        analysis.core_vocabulary.forEach(v => {
            html += `<li>
                <strong>${v.word}</strong>
                ${v.phonetic ? `<span style="color: var(--text-muted); margin-left: 6px; font-size: 0.82em;">${v.phonetic}</span>` : ''}
                <br><span style="color: var(--text-dim);">${v.meaning || ''}</span>
                ${v.context ? `<br><span style="font-style: italic; color: var(--text-muted); font-size: 0.82em;">"${v.context}"</span>` : ''}
            </li>`;
        });
        html += `</ul></div>`;
    }

    // 短语搭配
    if (analysis.phrases?.length) {
        html += `<div class="analysis-box"><h4>🔗 短语搭配</h4><ul>`;
        analysis.phrases.forEach(p => {
            html += `<li>
                <strong style="color: var(--color-phrase);">${p.phrase}</strong>
                <span style="color: var(--text-dim); margin-left: 8px;">${p.meaning || ''}</span>
            </li>`;
        });
        html += `</ul></div>`;
    }

    dom.analysisContent.innerHTML = html;
    openSheet();
}

function openSheet() {
    dom.detailSheet.classList.add('open');
    if (dom.sheetBackdrop) {
        dom.sheetBackdrop.classList.add('visible');
    }
}

function closeSheet() {
    dom.detailSheet.classList.remove('open');
    if (dom.sheetBackdrop) {
        dom.sheetBackdrop.classList.remove('visible');
    }
}

// ==================== 音频控制 ====================
function togglePlayPause() {
    if (state.isPlaying) {
        pauseAudio();
    } else {
        if (state.currentSentenceIdx < 0) {
            playSentence(0);
        } else {
            resumeOrPlay(state.currentSentenceIdx);
        }
    }
}

async function playSentence(idx) {
    if (idx < 0 || idx >= state.sentences.length) return;

    const s = state.sentences[idx];
    const md5 = s.sentence_md5;
    if (!md5) {
        // 没有音频，跳到下一句
        playNext();
        return;
    }

    state.currentSentenceIdx = idx;

    // 更新 UI 高亮
    $$('.sentence-node.playing').forEach(n => n.classList.remove('playing'));
    highlightSentence(idx);

    const target = document.getElementById(`sent-${idx}`);
    if (target) {
        target.classList.add('playing');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 播放呼吸环动画
    dom.playTrigger.classList.add('active');

    // 加载并播放
    dom.audioPlayer.src = `/data/audio/${md5}.mp3`;
    try {
        await dom.audioPlayer.play();
        state.isPlaying = true;
        dom.btnPlay.textContent = '⏸';
    } catch (e) {
        console.warn('音频播放失败:', e);
        // 自动跳过
        setTimeout(() => playNext(), 800);
    }
}

function resumeOrPlay(idx) {
    if (dom.audioPlayer.src && !dom.audioPlayer.ended) {
        dom.audioPlayer.play().then(() => {
            state.isPlaying = true;
            dom.btnPlay.textContent = '⏸';
            dom.playTrigger.classList.add('active');

            const target = document.getElementById(`sent-${idx}`);
            if (target) target.classList.add('playing');
        }).catch(() => {
            playSentence(idx);
        });
    } else {
        playSentence(idx);
    }
}

function pauseAudio() {
    dom.audioPlayer.pause();
    state.isPlaying = false;
    dom.btnPlay.textContent = '▶';
    dom.playTrigger.classList.remove('active');
    $$('.sentence-node.playing').forEach(n => n.classList.remove('playing'));
}

function playNext() {
    let next = state.currentSentenceIdx + 1;
    if (next >= state.sentences.length) {
        if (state.isLooping) {
            next = 0;
        } else {
            pauseAudio();
            return;
        }
    }
    playSentence(next);
}

function onAudioEnded() {
    dom.playTrigger.classList.remove('active');
    $$('.sentence-node.playing').forEach(n => n.classList.remove('playing'));

    // 阅读模式自动连续播放
    if (state.mode === 'reading' || state.isLooping) {
        playNext();
    } else {
        state.isPlaying = false;
        dom.btnPlay.textContent = '▶';
    }
}

function onAudioError() {
    console.warn('音频加载错误');
    dom.playTrigger.classList.remove('active');

    if (state.isLooping || state.mode === 'reading') {
        setTimeout(() => playNext(), 800);
    }
}
