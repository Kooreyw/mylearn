import json
import os
import sys
import hashlib

def get_md5(text):
    """计算文本的 MD5 值"""
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def generate_article_json(input_file):
    """
    将逐行 JSON 格式的句子文件转换为完整的文章 JSON 格式
    """
    filename = os.path.basename(input_file)
    article_title = os.path.splitext(filename)[0]
    
    sentences = []
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                try:
                    sentence_data = json.loads(line)
                    
                    # 补全 md5 和 audio_file 字段
                    sentence_text = sentence_data.get("sentence", "")
                    md5_val = get_md5(sentence_text)
                    
                    sentence_data["sentence_md5"] = md5_val
                    sentence_data["audio_file"] = f"data/audio/{md5_val}.mp3"
                    
                    sentences.append(sentence_data)
                except json.JSONDecodeError as e:
                    print(f"警告: 无法解析行: {line}\n错误: {e}")
                    continue
        
        # 构建最终结构
        result = {
            "article_metadata": {
                "title": article_title,
                "author": "Unknown",
                "source": "CET-4/6"
            },
            "sentences": sentences
        }
        
        # 写入输出文件
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "procesed")
        os.makedirs(output_dir, exist_ok=True)
        
        output_file = os.path.join(output_dir, f"{article_title}.json")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
        print(f"成功生成: {output_file}")
        return output_file
        
    except Exception as e:
        print(f"错误: 处理文件 {input_file} 时发生异常: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 generate_article_json.py <input_md_file>")
        sys.exit(1)
        
    generate_article_json(sys.argv[1])
