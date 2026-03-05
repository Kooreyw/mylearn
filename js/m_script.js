/**
 * English Reader (Mobile Native Theme) — 极致流动沉浸感逻辑
 */

const state = {
    mode: 'reading', // 'reading' (仅原文) | 'learning' (原文+对照)
    articleData: null,
    sentences: [],
    currentSentenceIdx: -1,
    isPlaying: false,
    isLooping: true,
};

const $ = (sel) => document.querySelector(sel);
const dom = {};

function initDOM() {
    dom.readerFlow = $('#reader-flow');
    dom.audioCapsule = $('#audio-capsule');
    dom.audioPlayer = $('#audio-player');
    dom.btnPlay = $('#btn-play');
    dom.btnPrev = $('#btn-prev');
    dom.btnNext = $('#btn-next');
    dom.mainFab = $('#main-fab');
    dom.overlay = $('#native-menu-overlay');
    dom.overlayClose = $('.close-overlay');
    dom.articleListNative = $('#article-list-native');
    dom.detailSheet = $('#bottom-detail-sheet');
    dom.analysisContent = $('#analysis-content');
}

document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    bindEvents();
    loadArticleList();
});

function bindEvents() {
    dom.btnPlay.addEventListener('click', togglePlayPause);
    dom.btnPrev.addEventListener('click', () => playSentence(Math.max(0, state.currentSentenceIdx - 1)));
    dom.btnNext.addEventListener('click', playNext);
    dom.audioPlayer.addEventListener('ended', onAudioEnded);

    dom.mainFab.addEventListener('click', openOverlay);
    dom.overlayClose.addEventListener('click', closeOverlay);

    // 顶部及背景点击关闭弹窗
    window.addEventListener('click', (e) => {
        if (e.target === dom.overlay) closeOverlay();
    });

    // 模式切换
    document.querySelectorAll('.pref-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchMode(e.target.dataset.mode);
            document.querySelectorAll('.pref-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // 监听滚动控制音频条透明度
    const flowContainer = $('#reader-flow-container');
    flowContainer.addEventListener('scroll', () => {
        const opacity = Math.max(0.3, 1 - (flowContainer.scrollTop / 500));
        dom.audioCapsule.style.opacity = opacity;
    });
}

// ==================== 渲染逻辑 (Native Style) ====================

async function loadArticleList() {
    try {
        const res = await fetch('/api/articles');
        const articles = await res.json();
        dom.articleListNative.innerHTML = '';
        articles.forEach(a => {
            const item = document.createElement('div');
            item.className = 'native-list-item';
            item.textContent = a.title;
            item.onclick = () => {
                loadArticle(a.id);
                closeOverlay();
            };
            dom.articleListNative.appendChild(item);
        });
        if (articles.length > 0) loadArticle(articles[0].id);
    } catch (err) { console.error(err); }
}

async function loadArticle(id) {
    try {
        dom.readerFlow.innerHTML = '<div class="spinner"></div>';
        const res = await fetch(`/api/articles/${id}`);
        state.articleData = await res.json();
        state.sentences = state.articleData.sentences || [];
        $('#current-article-title').textContent = state.articleData.article_metadata?.title || 'English Reader';
        renderFlow();
    } catch (err) { console.error(err); }
}

function renderFlow() {
    dom.readerFlow.innerHTML = '';
    const groups = {};
    state.sentences.forEach((s, idx) => {
        const p = s.paragraph || 1;
        if (!groups[p]) groups[p] = [];
        groups[p].push({ ...s, _idx: idx });
    });

    Object.keys(groups).sort((a, b) => a - b).forEach(pKey => {
        const group = groups[pKey];
        const paraDiv = document.createElement('div');
        paraDiv.className = 'paragraph-group';

        group.forEach(s => {
            const node = document.createElement('span');
            node.className = 'sentence-node';
            node.id = `sent-${s._idx}`;

            // 构建带音标的单词
            const words = (s.sentance || '').split(/\s+/).filter(Boolean);
            const phonetics = (s.phonetic || '').replace(/^\/|\/$/g, '').split(/\s+/).filter(Boolean);

            words.forEach((w, i) => {
                const box = document.createElement('span');
                box.className = 'word-box';
                box.innerHTML = `<span class="w-ph">${phonetics[i] || ''}</span><span class="w-text">${w}</span>`;
                node.appendChild(box);
                node.appendChild(document.createTextNode(' '));
            });

            node.onclick = () => onNodeClick(s._idx);
            paraDiv.appendChild(node);

            // 如果是学习模式，渲染行内译文
            if (state.mode === 'learning') {
                const trans = document.createElement('div');
                trans.className = 'inline-translation';
                trans.textContent = s.translation;
                paraDiv.appendChild(trans);
            }
        });

        dom.readerFlow.appendChild(paraDiv);
    });
}

function onNodeClick(idx) {
    state.currentSentenceIdx = idx;
    document.querySelectorAll('.sentence-node').forEach(n => n.classList.remove('active'));
    document.getElementById(`sent-${idx}`).classList.add('active');

    // 如果是学习模式，弹出详情页
    if (state.mode === 'learning') {
        showAnalysis(idx);
    }

    playSentence(idx);
}

// ==================== 交互控制 ====================

function openOverlay() { dom.overlay.style.display = 'flex'; }
function closeOverlay() { dom.overlay.style.display = 'none'; }

function switchMode(mode) {
    state.mode = mode;
    renderFlow();
}

function showAnalysis(idx) {
    const s = state.sentences[idx];
    const analysis = s.analysis || {};
    let html = `<h3>${s.translation}</h3>`;

    if (analysis.long_sentence_analysis) {
        html += `<div class="analysis-box"><h4>分析</h4><p>${analysis.long_sentence_analysis}</p></div>`;
    }

    if (analysis.core_vocabulary?.length) {
        html += `<div class="analysis-box"><h4>核心词汇</h4><ul>`;
        analysis.core_vocabulary.forEach(v => {
            html += `<li><strong>${v.word}</strong> ${v.phonetic || ''} - ${v.meaning}</li>`;
        });
        html += `</ul></div>`;
    }

    dom.analysisContent.innerHTML = html;
    dom.detailSheet.classList.add('open');

    // 点击背景关闭 Sheet
    setTimeout(() => {
        window.onclick = (e) => {
            if (!dom.detailSheet.contains(e.target) && !document.getElementById(`sent-${idx}`).contains(e.target)) {
                dom.detailSheet.classList.remove('open');
                window.onclick = null;
            }
        };
    }, 100);
}

// ==================== 音频控制 ====================

function togglePlayPause() {
    if (state.isPlaying) pauseAudio();
    else playSentence(state.currentSentenceIdx < 0 ? 0 : state.currentSentenceIdx);
}

async function playSentence(idx) {
    if (idx < 0 || idx >= state.sentences.length) return;
    const s = state.sentences[idx];
    state.currentSentenceIdx = idx;

    document.querySelectorAll('.sentence-node').forEach(n => n.classList.remove('playing'));
    const target = document.getElementById(`sent-${idx}`);
    target.classList.add('playing');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    dom.audioPlayer.src = `/data/audio/${s.sentence_md5}.mp3`;
    try {
        await dom.audioPlayer.play();
        state.isPlaying = true;
        dom.btnPlay.textContent = '⏸';
    } catch (e) {
        console.warn('Audio play failed', e);
        playNext();
    }
}

function pauseAudio() {
    dom.audioPlayer.pause();
    state.isPlaying = false;
    dom.btnPlay.textContent = '▶';
}

function playNext() {
    let next = state.currentSentenceIdx + 1;
    if (next >= state.sentences.length) {
        if (state.isLooping) next = 0;
        else return pauseAudio();
    }
    playSentence(next);
}

function onAudioEnded() {
    if (state.isLooping || state.mode === 'reading') playNext();
    else pauseAudio();
}
