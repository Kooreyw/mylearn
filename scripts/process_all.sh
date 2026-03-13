#!/bin/bash

# 自动化处理数据全流程脚本
# 1. 本地生成 JSON
# 2. 同步到服务器
# 3. 远程触发音频生成

set -e

# 配置
LOCAL_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$LOCAL_SCRIPT_DIR" )"
RSYNC_SCRIPT="$PROJECT_ROOT/tools/rsync.sh"
INPUT_DIR="$PROJECT_ROOT/data/sentences" # 注意：用户提供的路径是 data/sentences

# 确保输入目录存在
if [ ! -d "$INPUT_DIR" ]; then
    echo "错误: 输入目录不存在: $INPUT_DIR"
    exit 1
fi

echo "--- Step 1: 本地生成 JSON ---"
# for file in "$INPUT_DIR"/*.md; do
#     if [ -f "$file" ]; then
#         echo "正在处理: $file"
#         python3 "$LOCAL_SCRIPT_DIR/generate_article_json.py" "$file"
#     fi
# done

echo "--- Step 2: 同步数据到服务器 ---"
# bash "$RSYNC_SCRIPT"
cp -r ./data/procesed/ /var/www/html/learn/data/

echo "--- Step 3: 远程生成音频 ---"
cd /var/www/html/learn
echo "在服务器上运行 create_audio.py..."
/opt/tts-backend/venv/bin/python3 scripts/create_audio.py


echo "--- 全部完成！ ---"
