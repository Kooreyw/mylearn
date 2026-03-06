import json
import hashlib
import re

def get_md5(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()

text = """Passage Two

Cheating is nothing new. But today, educators and administrators are finding that instances of academic dishonesty on the part of students have become more frequent and are less likely to be punished than in the past. Cheating appears to have gained cceptance among good and poor students alike.

Why is student cheating on the rise? No one really knows. Some blame the trend on a general loosening to the fact that today’s youth are far more pragmatic than their more idealistic predecessors. Whereas in the late sixties and early seventies, students were filled with visions about changing the world, today’s students feel great pressure to conform and succeed. In interviews with tudents feel great pressure to conform and succeed. In interviews with students at high schools and colleges around the country, both young men and women said that cheating had become easy. Some suggested they did it out of spite for teachers they did not respect. Others looked at it as a game. Only if they were caught, some said, would they feel guilty. “People are competitive,” said a second-year college student named Anna, from Chicago. There’s an underlying fear. If you don’t do well, your life is going to be ruined. The pressure is not only from parents and friends but from yourself. To achieve. To succeed. It’s almost as though we have to outdo other people to achieve our own goals.

Edward Wynne, editor of a magazine blames the rise in academic dishonesty on the schools. He claims that administrators and teachers have been too hesitant to take action. Dwight Huber, chairman of the English department at Amarillo sees the matter differently, blaming the rise in cheating on the way students are evaluated. “I would cheat if I felt I was being cheated,” Mr. huber said. He feels that as long as teachers give short-answer tests rather than essay questions and rate students by the number of facts they can memorize rather than by how well they can synthesize information, students will try to beat the system. “The concept of cheating is based on the false assumption that the system is legitimate and there is something wrong with the individual who’s doing it,” he said, “That’s too easy an answer. We’ve got to start looking at the system.”

26. Educators are finding that students who cheat_______.
A. are not only those academically weak.
B. tend to be dishonest in later years.
C. are more likely to be punished than before.
D. have poor academic records.

27. According to the passage, which of the following statements is true?
A. Reform in the testing system will eliminate cheating.
B. Punishment is an effective method to stop cheating.
C. Students' cheating has deep social roots.
D. Students do not cheat on essay tests.

28. Which of the following points of view would Mr. Huberagree with?
A. Cheating would be reduced through an educational reform.
B. Students who cheat should be expelled from school.
C. Punishment for cheaters should be severe in this country.
D. Parents must take responsibility for the rise in cheating.

29. The expression "the individuals" (the last paragraph) refers to ________
A. school administrators.
B. students who cheat.
C. parents.
D. teachers.

30. The passage mainly discusses_______
A: ways to eliminate academic dishonesty.
B: factors leading to academic dishonesty.
C: the decline of moral standards of today's youth.
D: people's tolerance of students' cheating.
"""

paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

sentences_data = []
sentence_id = 1
for p_idx, para in enumerate(paragraphs, 1):
    # Split by standard sentence delimiters. 
    # Handle quotes properly
    # A simple regex for splitting sentences
    sents = re.split(r'(?<=[.!?])\s+(?=(?:[A-Z“"0-9]|$))', para)
    for sent in sents:
        sent = sent.strip()
        if not sent: continue
        sentences_data.append({
            "paragraph": p_idx,
            "sentance_id": sentence_id,
            "sentence_md5": get_md5(sent),
            "sentance": sent,
            "phonetic": "",
            "translation": "",
            "audio_file": f"data/audio/{get_md5(sent)}.mp3",
            "analysis": {
                "long_sentence_analysis": "",
                "core_vocabulary": [],
                "phrases": []
            }
        })
        sentence_id += 1

out = {
    "article_metadata": {
        "title": "2014_passage_two",
        "author": "Unknown",
        "source": "CET-4/6 2014"
    },
    "sentences": sentences_data
}

with open('/Users/mac/tmp_kx/myproject/learn/data/procesed/2014_passage_two.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=4)
print("done")
