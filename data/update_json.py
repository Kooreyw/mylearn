import json

# Provide sentence-level data directly
data_map = {
    1: {"t": "第二篇", "p": "/ˈpæsɪdʒ tuː/"},
    2: {"t": "作弊并不是什么新鲜事。", "p": "/ˈtʃiːtɪŋ ɪz ˈnʌθɪŋ njuː./", "cv": [{"word": "cheating", "phonetic": "/ˈtʃiːtɪŋ/", "meaning": "n. 作弊", "context": "Cheating is nothing new."}]},
    3: {"t": "但是今天，教育工作者和管理者发现，学生方面的学术不诚实事件变得越来越频繁，而且比过去更不可能受到惩罚。", "p": "/bʌt təˈdeɪ, ˈedʒukeɪtəz ænd ədˈmɪnɪstreɪtəz ɑː(r) ˈfaɪndɪŋ ðæt ˈɪnstənsɪz ɒv ˌækəˈdemɪk dɪsˈɒnɪsti ɒn ðə pɑːt ɒv ˈstjuːdnts həv bɪˈkʌm mɔː(r) ˈfriːkwənt ænd ɑː(r) les ˈlaɪkli tə bi ˈpʌnɪʃt ðæn ɪn ðə pɑːst./", "l": "宾语从句that...中包含一个并列谓语have become... and are less likely to...", "cv": [{"word": "academic", "phonetic": "/ˌækəˈdemɪk/", "meaning": "adj. 学术的", "context": "academic dishonesty"}, {"word": "dishonesty", "phonetic": "/dɪsˈɒnɪsti/", "meaning": "n. 不诚实", "context": "academic dishonesty"}], "ph": [{"phrase": "on the part of", "meaning": "在...方面"}]},
    4: {"t": "作弊似乎在好学生和差生中都获得了认可。", "p": "/ˈtʃiːtɪŋ əˈpɪəz tə həv ɡeɪnd /əkˈseptəns/ əˈmʌŋ ɡʊd ænd pʊə(r) ˈstjuːdnts əˈlaɪk./", "cv": [{"word": "acceptance", "phonetic": "/əkˈseptəns/", "meaning": "n. 认可，接受", "context": "gained acceptance"}], "ph": [{"phrase": "among ... alike", "meaning": "在...之中同样如此"}]},
    5: {"t": "为什么学生作弊现象在上升？", "p": "/waɪ ɪz ˈstjuːdnt ˈtʃiːtɪŋ ɒn ðə raɪz?/", "ph": [{"phrase": "on the rise", "meaning": "正在上升"}]},
    6: {"t": "没有人真正知道。", "p": "/nəʊ wʌn ˈriːəli nəʊz./"},
    7: {"t": "一些人将这种趋势归咎于一种普遍的松懈，即今天的年轻人在很大程度上比他们理想主义的前辈更加务实。", "p": "/sʌm bleɪm ðə trend ɒn ə ˈdʒenrəl ˈluːsənɪŋ tə ðə fækt ðæt təˈdeɪz juːθ ɑː(r) fɑː(r) mɔː(r) præɡˈmætɪk ðæn ðeə(r) mɔː(r) ˌaɪdiəˈlɪstɪk ˈpriːdɪsesəz./", "cv": [{"word": "pragmatic", "phonetic": "/præɡˈmætɪk/", "meaning": "adj. 务实的"}, {"word": "idealistic", "phonetic": "/ˌaɪdiəˈlɪstɪk/", "meaning": "adj. 理想主义的"}, {"word": "predecessor", "phonetic": "/ˈpriːdɪsesə(r)/", "meaning": "n. 前辈"}], "ph": [{"phrase": "blame ... on", "meaning": "把...归咎于"}]},
    8: {"t": "在60年代末和70年代初，学生们充满了改变世界的愿景，而今天的学生则感到遵守规矩和取得成功的巨大压力。", "p": "/ˌweərˈæz ɪn ðə leɪt ˈsɪkstiz ænd ˈɜːli ˈsevntiz, ˈstjuːdnts wɜː(r) fɪld wɪð ˈvɪʒnz əˈbaʊt ˈtʃeɪndʒɪŋ ðə wɜːld, təˈdeɪz ˈstjuːdnts fiːl ɡreɪt ˈpreʃə(r) tə kənˈfɔːm ænd səkˈsiːd./", "l": "Whereas引导让步状语从句", "cv": [{"word": "conform", "phonetic": "/kənˈfɔːm/", "meaning": "v. 顺从，遵从"}]},
    9: {"t": "在采访中，学生感到遵守规矩和取得成功的巨大压力。（这句原文本就有重复）", "p": ""},
    10: {"t": "在对全国各地的中学和大学学生的采访中，年轻男女都表示作弊变得很容易了。", "p": "/ɪn ˈɪntəvjuːz wɪð ˈstjuːdnts æt haɪ skuːlz ænd ˈkɒlɪdʒɪz əˈraʊnd ðə ˈkʌntri, bəʊθ jʌŋ men ænd ˈwɪmɪn sed ðæt ˈtʃiːtɪŋ hæd bɪˈkʌm ˈiːzi./", "l": "said后面是that引导的宾语从句"},
    11: {"t": "一些人暗示，他们这样做是出于对他们不尊重的老师的怨恨。", "p": "/sʌm səˈdʒestɪd ðeɪ dɪd ɪt aʊt ɒv spaɪt fə(r) ˈtiːtʃəz ðeɪ dɪd nɒt rɪˈspekt./", "ph": [{"phrase": "out of spite", "meaning": "出于怨恨"}]},
    12: {"t": "另一些人把它看作一场游戏。", "p": "/ˈʌðəz lʊkt æt ɪt æz ə ɡeɪm./", "ph": [{"phrase": "look at ... as", "meaning": "把...看作"}]},
    13: {"t": "有些人说，只有当他们被抓住时，他们才会感到内疚。", "p": "/ˈəʊnli ɪf ðeɪ wɜː(r) kɔːt, sʌm sed, wʊd ðeɪ fiːl ˈɡɪlti./", "l": "Only if 放在句首引起部分倒装 (would they feel guilty)。"},
    14: {"t": "“人们都是有竞争力的，”一位来自芝加哥的名叫安娜的大二学生说。", "p": "/ˈpiːpl ɑː(r) kəmˈpetətɪv, sed ə ˈsekənd-jɪə(r) ˈkɒlɪdʒ ˈstjuːdnt neɪmd ˈænə, frɒm ʃɪˈkɑːɡəʊ./"},
    15: {"t": "有一种潜在的恐惧。", "p": "/ðeəz ən ˌʌndəˈlaɪɪŋ fɪə(r)./", "cv": [{"word": "underlying", "phonetic": "/ˌʌndəˈlaɪɪŋ/", "meaning": "adj. 潜在的"}]},
    16: {"t": "如果你做得不好，你的一生都毁了。", "p": "/ɪf ju dəʊnt duː wel, jɔː(r) laɪf ɪz ˈɡəʊɪŋ tə bi ˈruːɪnd./", "cv": [{"word": "ruin", "phonetic": "/ˈruːɪn/", "meaning": "v. 毁灭"}]},
    17: {"t": "压力不仅来自父母和朋友，也来自你自己。", "p": "/ðə ˈpreʃə(r) ɪz nɒt ˈəʊnli frɒm ˈpeərənts ænd frendz bʌt frɒm jɔːˈself./", "ph": [{"phrase": "not only ... but (also)", "meaning": "不仅...而且"}]},
    18: {"t": "去实现（目标）。", "p": "/tə əˈtʃiːv./"},
    19: {"t": "去成功。", "p": "/tə səkˈsiːd./"},
    20: {"t": "就好像我们必须超越别人才能实现我们自己的目标。", "p": "/ɪts ˈɔːlməʊst æz ðəʊ wi hæv tə ˌaʊtˈduː ˈʌðə(r) ˈpiːpl tə əˈtʃiːv aʊə(r) əʊn ɡəʊlz./", "ph": [{"phrase": "as though", "meaning": "仿佛，好像"}], "cv": [{"word": "outdo", "phonetic": "/ˌaʊtˈduː/", "meaning": "v. 胜过，超越"}]},
    21: {"t": "一家杂志的主编爱德华·温将学术不诚实行为的上升归咎于学校。", "p": "/ˈedwəd wɪn, ˈedɪtə(r) ɒv ə ˌmæɡəˈziːn bleɪmz ðə raɪz ɪn ˌækəˈdemɪk dɪsˈɒnɪsti ɒn ðə skuːlz./"},
    22: {"t": "他声称管理者和老师在采取行动方面过于犹豫不决。", "p": "/hi kleɪmz ðæt ədˈmɪnɪstreɪtəz ænd ˈtiːtʃəz həv biːn tuː ˈhezɪtənt tə teɪk ˈækʃn./", "cv": [{"word": "hesitant", "phonetic": "/ˈhezɪtənt/", "meaning": "adj. 犹豫的"}]},
    23: {"t": "阿马里洛高中英语系主任德怀特·胡伯对这件事有不同看法，他把作弊的上升归咎于评估学生的方式。", "p": "/dwaɪt ˈhjuːbə(r), ˈtʃeəmən ɒv ðə ˈɪŋɡlɪʃ dɪˈpɑːtmənt æt Amarillo siːz ðə ˈmætə(r) ˈdɪfrəntli, ˈbleɪmɪŋ ðə raɪz ɪn ˈtʃiːtɪŋ ɒn ðə weɪ ˈstjuːdnts ɑː(r) ɪˈvæljueɪtɪd./", "l": "blaming ... 为分词做伴随状语"},
    24: {"t": "“如果我觉得我被欺骗了，我就会作弊，”胡伯先生说。", "p": "/aɪ wʊd tʃiːt ɪf aɪ felt aɪ wəz ˈbiːɪŋ ˈtʃiːtɪd, ˈmɪstə(r) ˈhjuːbə(r) sed./"},
    25: {"t": "他认为，只要老师给出简答题而不是论述题，并通过学生能记住的事实数量而不是他们能综合信息的程度来评估学生，学生就会试图寻找系统漏洞。", "p": "/hi fiːlz ðæt æz lɒŋ æz ˈtiːtʃəz ɡɪv ʃɔːt-ˈɑːnsə(r) tests ˈrɑːðə(r) ðæn ˈeseɪ ˈkwestʃənz ænd reɪt ˈstjuːdnts baɪ ðə ˈnʌmbə(r) ɒv fækts ðeɪ kæn ˈmeməraɪz ˈrɑːðə(r) ðæn baɪ haʊ wel ðeɪ kæn ˈsɪnθəsaɪz ˌɪnfəˈmeɪʃn, ˈstjuːdnts wɪl traɪ tə biːt ðə ˈsɪstəm./", "l": "主句是students will try to beat the system。前面包含了as long as引导的条件状语从句", "cv": [{"word": "synthesize", "phonetic": "/ˈsɪnθəsaɪz/", "meaning": "v. 综合"}]},
    26: {"t": "他说：“作弊的概念是基于这样一种错误的假设：体制是合法的，而做这件事的个人有问题，这是一个太过于简单的答案。”", "p": "/ðə ˈkɒnsept ɒv ˈtʃiːtɪŋ ɪz beɪst ɒn ðə fɔːls əˈsʌmpʃn ðæt ðə ˈsɪstəm ɪz lɪˈdʒɪtɪmət ænd ðeə(r) ɪz ˈsʌmθɪŋ rɒŋ wɪð ði ˌɪndɪˈvɪdʒuəl huːz ˈduːɪŋ ɪt, hi sed, ðæts tuː ˈiːzi ən ˈɑːnsə(r)./", "cv": [{"word": "legitimate", "phonetic": "/lɪˈdʒɪtɪmət/", "meaning": "adj. 合法的，合理的"}]},
    27: {"t": "我们必须从考察这个体制开始。", "p": "/wiːv ɡɒt tə stɑːt ˈlʊkɪŋ æt ðə ˈsɪstəm./"}
}

import codecs

with codecs.open('/Users/mac/tmp_kx/myproject/learn/data/procesed/2014_passage_two.json', 'r', 'utf-8') as f:
    js = json.load(f)

for sent in js['sentences']:
    sid = sent['sentance_id']
    if sid in data_map:
        d = data_map[sid]
        sent['translation'] = d.get('t', '')
        sent['phonetic'] = d.get('p', '')
        if 'l' in d:
            sent['analysis']['long_sentence_analysis'] = d['l']
        if 'cv' in d:
            sent['analysis']['core_vocabulary'] = d['cv']
        if 'ph' in d:
            sent['analysis']['phrases'] = d['ph']
    else:
        # Default simple translation for questions
        sent['translation'] = "（题目或选项翻译暂略）"

with codecs.open('/Users/mac/tmp_kx/myproject/learn/data/procesed/2014_passage_two.json', 'w', 'utf-8') as f:
    json.dump(js, f, ensure_ascii=False, indent=4)
print("Updated dict")
