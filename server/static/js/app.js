/**
 * English Study App — 核心前端逻辑
 * 功能：数据加载、阅读/学习模式切换、音标对齐渲染、音频逐句播放
 */

// ==================== 全局状态 ====================
const state = {
    mode: 'reading',       // 'reading' | 'learning'
    articleData: null,      // 当前文章 JSON
    sentences: [],          // 句子数组
    currentSentenceIdx: -1, // 当前选中/播放的句子索引
    isPlaying: false,
    isLooping: true,        // 阅读模式默认循环
    fontSize: 17,           // 基础字号 px
};

// ==================== DOM 引用 ====================
const $ = (sel) => document.querySelector(sel);
const dom = {};

function initDOM() {
    dom.articleTitle = $('#article-title');
    dom.articleSelect = $('#article-select');
    dom.btnReading = $('#btn-reading');
    dom.btnLearning = $('#btn-learning');
    dom.modeSlider = $('#mode-slider');
    dom.sentencesBox = $('#sentences-container');
    dom.rightTitle = $('#right-panel-title');
    dom.rightContent = $('#right-content');
    dom.audioBar = $('#audio-bar');
    dom.audioLabel = $('#audio-label');
    dom.audioProgress = $('#audio-progress');
    dom.audioPlayer = $('#audio-player');
    dom.btnPlay = $('#btn-play');
    dom.btnPrev = $('#btn-prev');
    dom.btnNext = $('#btn-next');
    dom.btnLoop = $('#btn-loop');
    dom.btnFontUp = $('#btn-font-up');
    dom.btnFontDown = $('#btn-font-down');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    bindEvents();
    loadArticleList();
});

function bindEvents() {
    // 模式切换
    dom.btnReading.addEventListener('click', () => switchMode('reading'));
    dom.btnLearning.addEventListener('click', () => switchMode('learning'));

    // 文章选择
    dom.articleSelect.addEventListener('change', (e) => {
        if (e.target.value) loadArticle(e.target.value);
    });

    // 音频控件
    dom.btnPlay.addEventListener('click', togglePlayPause);
    dom.btnPrev.addEventListener('click', playPrev);
    dom.btnNext.addEventListener('click', playNext);
    dom.btnLoop.addEventListener('click', toggleLoop);

    // 音频事件
    dom.audioPlayer.addEventListener('ended', onAudioEnded);
    dom.audioPlayer.addEventListener('error', onAudioError);

    // 字号
    dom.btnFontUp.addEventListener('click', () => adjustFontSize(1));
    dom.btnFontDown.addEventListener('click', () => adjustFontSize(-1));

    // 中英同步滚动
    initSyncScroll();
}

// ==================== 数据加载 ====================
async function loadArticleList() {
    try {
        const res = await fetch('/api/articles');
        const articles = await res.json();
        dom.articleSelect.innerHTML = '<option value="">选择文章...</option>';
        articles.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.title;
            dom.articleSelect.appendChild(opt);
        });
        // 如果只有一篇文章，自动加载
        if (articles.length === 1) {
            dom.articleSelect.value = articles[0].id;
            loadArticle(articles[0].id);
        }
    } catch (err) {
        console.error('加载文章列表失败:', err);
    }
}

async function loadArticle(articleId) {
    try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        state.articleData = await res.json();
        state.sentences = state.articleData.sentences || [];
        state.currentSentenceIdx = -1;

        // 更新标题
        const title = state.articleData.article_metadata?.title || articleId;
        dom.articleTitle.textContent = title;

        // 渲染内容
        renderSentences();
        renderRightPanel();

        // 对齐段落高度
        requestAnimationFrame(() => alignParagraphs());

        // 显示音频栏
        dom.audioBar.classList.remove('hidden');
        dom.audioLabel.textContent = '准备就绪 — 点击播放';
        dom.audioProgress.textContent = `共 ${state.sentences.length} 句`;

    } catch (err) {
        console.error('加载文章失败:', err);
    }
}

// ==================== 模式切换 ====================
function switchMode(mode) {
    state.mode = mode;
    document.body.className = `mode-${mode}`;

    // 按钮状态
    dom.btnReading.classList.toggle('active', mode === 'reading');
    dom.btnLearning.classList.toggle('active', mode === 'learning');

    // 滑块位置
    dom.modeSlider.classList.toggle('slide-right', mode === 'learning');

    // 更新右侧面板标题
    dom.rightTitle.textContent = mode === 'reading' ? '译文' : '学习分析';

    // 重新渲染右侧
    renderRightPanel();

    // 对齐段落高度
    requestAnimationFrame(() => alignParagraphs());
}

// ==================== 左侧面板：句子 + 音标渲染 ====================
function renderSentences() {
    const container = dom.sentencesBox;
    container.innerHTML = '';

    if (!state.sentences.length) {
        container.innerHTML = '<div class="placeholder-msg"><p>暂无数据</p></div>';
        return;
    }

    // 按 paragraph 分组
    const groups = {};
    state.sentences.forEach((s, idx) => {
        const p = s.paragraph || 1;
        if (!groups[p]) groups[p] = [];
        groups[p].push({ ...s, _idx: idx });
    });

    Object.keys(groups).sort((a, b) => a - b).forEach(pKey => {
        const group = groups[pKey];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'paragraph-group';
        groupDiv.id = `paragraph-${pKey}`;

        // 段落内所有句子的 word-unit 连续流排
        const flow = document.createElement('div');
        flow.className = 'paragraph-flow';

        group.forEach(s => {
            // 每个句子用一个 inline 的 span 包裹
            const sentenceSpan = document.createElement('span');
            sentenceSpan.className = 'sentence-inline';
            sentenceSpan.dataset.idx = s._idx;
            sentenceSpan.id = `sentence-${s._idx}`;

            const words = splitSentence(s.sentance || '');
            const phonetics = splitPhonetic(s.phonetic || '');

            words.forEach((w, i) => {
                const unit = document.createElement('span');
                unit.className = 'word-unit';

                const wordSpan = document.createElement('span');
                wordSpan.className = 'word-text';
                wordSpan.textContent = w;

                const phSpan = document.createElement('span');
                phSpan.className = 'word-phonetic';
                phSpan.textContent = phonetics[i] || '';

                unit.appendChild(wordSpan);
                unit.appendChild(phSpan);
                sentenceSpan.appendChild(unit);
            });

            // 句子末尾加一个小间距
            const spacer = document.createElement('span');
            spacer.className = 'sentence-spacer';
            spacer.textContent = ' ';
            sentenceSpan.appendChild(spacer);

            // 点击事件
            sentenceSpan.addEventListener('click', () => onSentenceClick(s._idx));

            flow.appendChild(sentenceSpan);
        });

        groupDiv.appendChild(flow);
        container.appendChild(groupDiv);
    });
}

/**
 * 切分英文句子为单词数组
 * 保留标点在上一个单词上（如逗号、句号）
 */
function splitSentence(text) {
    return text.split(/\s+/).filter(Boolean);
}

/**
 * 切分音标字符串
 * 去掉首尾 /.../ 再按空格拆分
 */
function splitPhonetic(ph) {
    // 去掉首尾 /
    let cleaned = ph.replace(/^\//, '').replace(/\/$/, '').trim();
    // 去掉可能的 <br> 标签
    cleaned = cleaned.replace(/<br\s*\/?>/gi, '');
    return cleaned.split(/\s+/).filter(Boolean);
}

// ==================== 右侧面板渲染 ====================
function renderRightPanel() {
    if (!state.sentences.length) return;

    if (state.mode === 'reading') {
        renderTranslations();
    } else {
        // 学习模式：如果有选中的句子就显示分析，否则提示点击
        if (state.currentSentenceIdx >= 0) {
            renderAnalysis(state.currentSentenceIdx);
        } else {
            dom.rightContent.innerHTML = `
                <div class="placeholder-msg">
                    <p>👈 点击左侧句子查看详细分析</p>
                </div>`;
        }
    }
}

function renderTranslations() {
    const container = dom.rightContent;
    container.innerHTML = '';

    // 按段落分组
    const groups = {};
    state.sentences.forEach((s, idx) => {
        const p = s.paragraph || 1;
        if (!groups[p]) groups[p] = [];
        groups[p].push({ ...s, _idx: idx });
    });

    Object.keys(groups).sort((a, b) => a - b).forEach(pKey => {
        const group = groups[pKey];
        const paraDiv = document.createElement('div');
        paraDiv.className = 'translation-paragraph';
        paraDiv.id = `trans-paragraph-${pKey}`;

        group.forEach(s => {
            const sentSpan = document.createElement('span');
            sentSpan.className = 'translation-sentence';
            sentSpan.id = `translation-${s._idx}`;
            sentSpan.textContent = s.translation || '';
            // 点击译文也联动高亮英文
            sentSpan.addEventListener('click', () => onSentenceClick(s._idx));
            paraDiv.appendChild(sentSpan);
        });

        container.appendChild(paraDiv);
    });
}

function renderAnalysis(idx) {
    const s = state.sentences[idx];
    if (!s) return;

    const analysis = s.analysis || {};
    const container = dom.rightContent;

    let html = '<div class="analysis-container">';

    // 原文预览
    html += `<div class="analysis-original">
        <div>${s.sentance}</div>
        <div class="analysis-translation">${s.translation || ''}</div>
    </div>`;

    // 长难句分析
    if (analysis.long_sentence_analysis) {
        html += `
        <div class="analysis-section section-long-sentence">
            <div class="analysis-section-title">📐 长难句分析</div>
            <div class="long-sentence-text">${analysis.long_sentence_analysis}</div>
        </div>`;
    }

    // 核心词汇
    if (analysis.core_vocabulary?.length) {
        html += `<div class="analysis-section section-vocabulary">
            <div class="analysis-section-title">📝 核心词汇</div>`;
        analysis.core_vocabulary.forEach(v => {
            html += `<div class="vocab-card">
                <div>
                    <span class="vocab-word">${v.word}</span>
                    <span class="vocab-phonetic">${v.phonetic || ''}</span>
                </div>
                <div class="vocab-meaning">${v.meaning || ''}</div>
                ${v.context ? `<div class="vocab-context">"${v.context}"</div>` : ''}
            </div>`;
        });
        html += '</div>';
    }

    // 短语
    if (analysis.phrases?.length) {
        html += `<div class="analysis-section section-phrases">
            <div class="analysis-section-title">🔗 短语搭配</div>`;
        analysis.phrases.forEach(p => {
            html += `<div class="phrase-card">
                <span class="phrase-text">${p.phrase}</span>
                <span class="phrase-meaning">${p.meaning || ''}</span>
            </div>`;
        });
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// ==================== 句子交互 ====================
function onSentenceClick(idx) {
    setActiveSentence(idx);

    if (state.mode === 'learning') {
        renderAnalysis(idx);
    }
}

function setActiveSentence(idx) {
    // 清除所有 active
    document.querySelectorAll('.sentence-inline.active').forEach(el =>
        el.classList.remove('active'));
    document.querySelectorAll('.translation-sentence.active').forEach(el =>
        el.classList.remove('active'));

    state.currentSentenceIdx = idx;

    // 高亮当前英文句子
    const sBlock = document.getElementById(`sentence-${idx}`);
    if (sBlock) {
        sBlock.classList.add('active');
        sBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 高亮对应中文译文
    const tBlock = document.getElementById(`translation-${idx}`);
    if (tBlock) {
        tBlock.classList.add('active');
        tBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ==================== 音频播放 ====================
function togglePlayPause() {
    if (state.isPlaying) {
        pauseAudio();
    } else {
        if (state.currentSentenceIdx < 0) {
            playSentence(0);
        } else {
            resumeAudio();
        }
    }
}

function playSentence(idx) {
    if (idx < 0 || idx >= state.sentences.length) return;

    const s = state.sentences[idx];
    const md5 = s.sentence_md5;
    if (!md5) return;

    setActiveSentence(idx);
    setPlayingState(idx);

    dom.audioPlayer.src = `/audio/${md5}.mp3`;
    dom.audioPlayer.play().then(() => {
        state.isPlaying = true;
        dom.btnPlay.textContent = '⏸';
        dom.audioLabel.textContent = `正在播放 #${s.sentance_id}`;
        dom.audioProgress.textContent = `${idx + 1} / ${state.sentences.length}`;
    }).catch(err => {
        console.warn('音频播放失败:', err);
        dom.audioLabel.textContent = `⚠️ 音频不可用 #${s.sentance_id}`;
        // 自动跳到下一句（如果循环模式）
        if (state.isLooping && state.mode === 'reading') {
            setTimeout(() => playNext(), 1500);
        }
    });
}

function pauseAudio() {
    dom.audioPlayer.pause();
    state.isPlaying = false;
    dom.btnPlay.textContent = '▶';
    clearPlayingState();
}

function resumeAudio() {
    dom.audioPlayer.play().then(() => {
        state.isPlaying = true;
        dom.btnPlay.textContent = '⏸';
        setPlayingState(state.currentSentenceIdx);
    }).catch(() => { });
}

function playPrev() {
    const idx = Math.max(0, state.currentSentenceIdx - 1);
    playSentence(idx);
}

function playNext() {
    let idx = state.currentSentenceIdx + 1;
    if (idx >= state.sentences.length) {
        if (state.isLooping) {
            idx = 0; // 循环到开头
        } else {
            pauseAudio();
            return;
        }
    }
    playSentence(idx);
}

function onAudioEnded() {
    clearPlayingState();
    if (state.mode === 'reading') {
        // 阅读模式：自动播放下一句
        playNext();
    } else {
        state.isPlaying = false;
        dom.btnPlay.textContent = '▶';
    }
}

function onAudioError() {
    clearPlayingState();
    if (state.mode === 'reading' && state.isLooping) {
        setTimeout(() => playNext(), 800);
    }
}

function toggleLoop() {
    state.isLooping = !state.isLooping;
    dom.btnLoop.classList.toggle('loop-active', state.isLooping);
}

function setPlayingState(idx) {
    clearPlayingState();
    const block = document.getElementById(`sentence-${idx}`);
    if (block) block.classList.add('playing');
}

function clearPlayingState() {
    document.querySelectorAll('.sentence-inline.playing').forEach(el =>
        el.classList.remove('playing'));
}

// ==================== 字号调整 ====================
function adjustFontSize(delta) {
    state.fontSize = Math.min(24, Math.max(12, state.fontSize + delta));
    document.documentElement.style.fontSize = state.fontSize + 'px';
}

// ==================== 中英同步滚动 ====================
function initSyncScroll() {
    const leftPanel = dom.sentencesBox;
    const rightPanel = dom.rightContent;
    let syncing = false;

    leftPanel.addEventListener('scroll', () => {
        if (syncing || state.mode !== 'reading') return;
        syncing = true;
        rightPanel.scrollTop = leftPanel.scrollTop;
        requestAnimationFrame(() => { syncing = false; });
    });

    rightPanel.addEventListener('scroll', () => {
        if (syncing || state.mode !== 'reading') return;
        syncing = true;
        leftPanel.scrollTop = rightPanel.scrollTop;
        requestAnimationFrame(() => { syncing = false; });
    });
}

// ==================== 段落高度对齐 ====================
function alignParagraphs() {
    if (state.mode !== 'reading') return;

    // 获取所有段落编号
    const paraKeys = new Set();
    state.sentences.forEach(s => paraKeys.add(s.paragraph || 1));

    paraKeys.forEach(pKey => {
        const leftPara = document.getElementById(`paragraph-${pKey}`);
        const rightPara = document.getElementById(`trans-paragraph-${pKey}`);
        if (!leftPara || !rightPara) return;

        // 先重置高度
        leftPara.style.minHeight = '';
        rightPara.style.minHeight = '';

        // 取两侧较大值
        const maxH = Math.max(leftPara.offsetHeight, rightPara.offsetHeight);
        leftPara.style.minHeight = maxH + 'px';
        rightPara.style.minHeight = maxH + 'px';
    });
}
