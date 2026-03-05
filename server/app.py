"""
英语学习应用 - Flask 后端
提供文章列表、文章详情、音频文件等 API 接口
"""
import os
import json
from flask import Flask, jsonify, send_from_directory, abort
from flask_cors import CORS

# 项目根目录（mylearn/）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "procesed")
AUDIO_DIR = os.path.join(BASE_DIR, "data", "audio")

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)


@app.route("/")
def index():
    """主页 - 返回前端 SPA"""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/articles")
def get_articles():
    """获取文章列表 —— 返回所有文章的 id 和 title"""
    articles = []
    if not os.path.isdir(DATA_DIR):
        return jsonify(articles)

    for filename in sorted(os.listdir(DATA_DIR)):
        if not filename.endswith(".json"):
            continue
        article_id = filename[:-5]  # 去掉 .json 后缀
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            title = data.get("article_metadata", {}).get("title", article_id)
            articles.append({"id": article_id, "title": title})
        except (json.JSONDecodeError, IOError):
            continue

    return jsonify(articles)


@app.route("/api/articles/<article_id>")
def get_article(article_id):
    """获取文章详情 —— 直接返回 article.json 的全部内容"""
    filepath = os.path.join(DATA_DIR, f"{article_id}.json")
    if not os.path.isfile(filepath):
        abort(404, description=f"Article '{article_id}' not found")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return jsonify(data)


@app.route("/audio/<path:filename>")
def serve_audio(filename):
    """提供音频文件的静态访问"""
    if not os.path.isdir(AUDIO_DIR):
        os.makedirs(AUDIO_DIR, exist_ok=True)
    return send_from_directory(AUDIO_DIR, filename)


if __name__ == "__main__":
    print(f"[INFO] 数据目录: {DATA_DIR}")
    print(f"[INFO] 音频目录: {AUDIO_DIR}")
    app.run(host="0.0.0.0", port=5001, debug=True)
