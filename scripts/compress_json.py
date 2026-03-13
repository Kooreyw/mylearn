import json
import os
import sys
import re

def remove_comments(text):
    """
    移除 JSON 文本中的 // 单行注释。
    """
    # 匹配 // 后面的内容，直到行尾，但不匹配字符串内部的 //
    # 这个正则比较简单，对于大多数情况有效，但如果字符串里包含 // 可能会有问题
    # 为了健壮性，这里使用一个针对 JSON 的简单正则
    pattern = r'(\"(?:\\\"|[^\"])*\")|//.*'
    def _replacer(match):
        if match.group(1) is not None:
            return match.group(1)
        else:
            return ""
    return re.sub(pattern, _replacer, text)

def compress_json(file_path):
    """
    压缩单个 JSON 文件，移除所有多余的空格、注释和换行。
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 移除注释
        content = remove_comments(content)
        
        # 加载数据
        data = json.loads(content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, separators=(',', ':'), ensure_ascii=False)
        
        print(f"成功压缩: {file_path}")
    except Exception as e:
        print(f"压缩失败 {file_path}: {e}")

def main():
    if len(sys.argv) < 2:
        print("用法: python compress_json.py <文件或目录路径>")
        return

    path = sys.argv[1]

    if os.path.isfile(path):
        if path.endswith('.json'):
            compress_json(path)
        else:
            print(f"错误: {path} 不是 .json 文件")
    elif os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith('.json'):
                    full_path = os.path.join(root, file)
                    compress_json(full_path)
    else:
        print(f"错误: 路径 {path} 不存在")

if __name__ == "__main__":
    main()
