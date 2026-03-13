"""
音频生成脚本 - 增量式 TTS
读取 article.json，对每个句子生成对应的 MP3 音频文件。
使用 MD5 命名，已存在的文件不会重复生成。
"""
import os
import json
import sys

try:
    from gtts import gTTS
except ImportError:
    print("[ERROR] 缺少 gTTS 库，请先运行: pip install gTTS")
    sys.exit(1)

# 项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "procesed")
AUDIO_DIR = os.path.join(BASE_DIR, "data", "audio")


def generate_audio(json_path: str):
    """读取 JSON 文件并为每个句子增量生成音频"""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    sentences = data.get("sentences", [])
    os.makedirs(AUDIO_DIR, exist_ok=True)

    total = len(sentences)
    skipped = 0
    created = 0
    failed = 0

    for i, s in enumerate(sentences, 1):
        md5 = s.get("sentence_md5", "")
        text = s.get("sentence", "")
        if not md5 or not text:
            print(f"  [{i}/{total}] ⚠️  跳过：缺少 MD5 或文本")
            skipped += 1
            continue

        audio_path = os.path.join(AUDIO_DIR, f"{md5}.mp3")

        if os.path.exists(audio_path):
            print(f"  [{i}/{total}] ✅ 已存在，跳过: {md5}.mp3")
            skipped += 1
            continue

        try:
            print(f"  [{i}/{total}] 🔊 生成中: {md5}.mp3 ← \"{text[:50]}...\"")
            tts = gTTS(text=text, lang="en", slow=False)
            tts.save(audio_path)
            created += 1
        except Exception as e:
            print(f"  [{i}/{total}] ❌ 生成失败: {e}")
            failed += 1

    print(f"\n📊 完成！共 {total} 个句子: 新生成 {created}, 跳过 {skipped}, 失败 {failed}")


def main():
    # 扫描 data/procesed/ 下所有 JSON 文件
    if not os.path.isdir(DATA_DIR):
        print(f"[ERROR] 数据目录不存在: {DATA_DIR}")
        sys.exit(1)

    json_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json")]
    if not json_files:
        print(f"[ERROR] 数据目录中没有 JSON 文件: {DATA_DIR}")
        sys.exit(1)

    for jf in sorted(json_files):
        path = os.path.join(DATA_DIR, jf)
        print(f"\n📖 处理文件: {jf}")
        generate_audio(path)


if __name__ == "__main__":
    main()
