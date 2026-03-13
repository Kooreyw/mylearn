import os
import json
import hashlib
import re
import sys

def get_md5(text):
    return hashlib.md5(text.strip().encode('utf-8')).hexdigest()

def split_sentences(text):
    # 简单的分句规则：按句号、问号、感叹号分，保留标点
    # 1. (?![^()]*\)) 确保不在括号内切分（即后面没有不带配对左括号的右括号）
    # 2. (?<!\be\.g)(?<!\bi\.e) 考虑到 e.g. 这种缩写
    # 注意：在 regex split 中，(?<=[.?!]) 匹配的是点号后面的位置。
    # 为了简化，我们先处理掉常见的缩写干扰，或者使用更强大的正则表达式。
    
    # 这里的逻辑是：匹配空格，它的前面是一个标点符号，且这个标点符号前面不是 e.g 或 i.e，且这个位置不在括号内。
    pattern = r'(?<!\be\.g)(?<!\bi\.e)(?<=[.?!])\s+(?![^()]*\))'
    sentences = re.split(pattern, text.strip(), flags=re.IGNORECASE)
    return [s for s in sentences if s.strip()]

def step1_split(file_basename):
    input_path = f"data/input/{file_basename}.md"
    output_path = f"data/sentences/{file_basename}.step1.md"
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    results = []
    sentence_id = 1
    
    for p_id, line in enumerate(lines):
        if not line.strip():
            continue
        
        # 段落编号从1开始
        paragraph_id = p_id + 1
        sentences = split_sentences(line)
        
        for s_text in sentences:
            s_md5 = get_md5(s_text)
            item = {
                "paragraph": paragraph_id,
                "sentence_id": sentence_id,
                "sentence_md5": s_md5,
                "sentence": s_text,
                "audio_file": f"data/audio/{s_md5}.mp3"
            }
            results.append(json.dumps(item, ensure_ascii=False))
            sentence_id += 1

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(results) + '\n')
    
    print(f"Step1 finished: {output_path}")

def load_questions(file_basename):
    ques_path = f"data/sentences/{file_basename}.ques.md"
    questions = []
    if os.path.exists(ques_path):
        with open(ques_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    try:
                        questions.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    return questions

def step3_merge(file_basename):
    step1_path = f"data/sentences/{file_basename}.step1.md"
    step2_path = f"data/sentences/{file_basename}.step2.md"
    output_path = f"data/procesed/{file_basename}.json"
    
    if not os.path.exists(step1_path) or not os.path.exists(step2_path):
        print(f"Error: step1 or step2 file missing for {file_basename}")
        return

    # 读取 step1
    step1_data = {}
    with open(step1_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                item = json.loads(line)
                step1_data[item['sentence_id']] = item

    # 读取 step2
    step2_data = {}
    with open(step2_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                item = json.loads(line)
                step2_data[item['i']] = item

    # 合并
    sentences = []
    ids = sorted(step1_data.keys())
    for s_id in ids:
        s1 = step1_data[s_id]
        s2 = step2_data.get(s_id, {})
        
        merged = {
            "paragraph": s1["paragraph"],
            "sentence_id": s_id,
            "sentence_md5": s1["sentence_md5"],
            "sentence": s1["sentence"],
            "phonetic": s2.get("p", ""),
            "translation": s2.get("t", ""),
            "audio_file": s1["audio_file"],
            "analysis": {
                "long_sentence_analysis": s2.get("l", ""),
                "core_vocabulary": [
                    {"word": v[0], "phonetic": v[1], "meaning": v[2]} 
                    for v in s2.get("v", [])
                ],
                "phrases": [
                    {"phrase": ph[0], "meaning": f"{ph[1]} {ph[2]}" if len(ph) > 2 else ph[1]} 
                    for ph in s2.get("ph", [])
                ]
            }
        }
        sentences.append(merged)

    # 读取题目
    questions = load_questions(file_basename)

    result = {
        "article_metadata": {
            "title": file_basename.replace('_', ' ').capitalize(),
            "author": "Unknown",
            "source": "CET"
        },
        "sentences": sentences,
        "questions": questions
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print(f"Step3 finished: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/process_data.py [step1|step3] file_basename")
        sys.exit(1)
    
    cmd = sys.argv[1]
    name = sys.argv[2]
    
    if cmd == "step1":
        step1_split(name)
    elif cmd == "step3":
        step3_merge(name)
    else:
        print("Invalid command")
