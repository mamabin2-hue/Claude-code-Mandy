#!/usr/bin/env python3
"""Parse 115年度 職業衛生管理甲級 學科測試試題 from PDF."""

import fitz
import json
import re
import sys
import os

CIRCLE_NUMS = '①②③④'
LETTERS = ['A', 'B', 'C', 'D']

def clean_text(s):
    return re.sub(r'\s+', ' ', s).strip()

def num_to_letter(n):
    return LETTERS[int(n) - 1]

KEYWORD_CATS = [
    (['監測', '採樣', '分析', '偵測', '採集介質', '分光光譜', '原子吸收光譜', '光譜儀', '採樣泵', '監測結果報告'],
     'D', '作業環境監測'),
    (['通風', '換氣', '氣罩', '凸緣', '換氣裝置', '排氣', '局限空間', '入槽', '缺氧', '硫化氫', '粉塵清掃',
      '個人防護具', '手套', 'PPE', '防音', '空氣清淨', '集塵', '密閉設備', '工程控制'],
     'E', '危害控制'),
    (['容許暴露標準', '容許濃度', '暴露評估', '風險評估', '暴露劑量', '時量平均', '失能嚴重率', '失能傷害頻率'],
     'C', '危害暴露風險評估'),
    (['噪音', '輻射', '振動', '熱危害', 'WBGT', '熱指數', '熱交換', '化學品', '有害物', '有機溶劑', '特定化學物質',
      '鉛', '石綿', '苯', '硫化氫', '氨', '人因', '肌肉骨骼', '不法侵害', '職場暴力', '生物病原'],
     'B', '危害辨識與認知'),
    (['著作權', '營業秘密', '服務客戶', '工作倫理', '菸害', '癌症篩檢', '先入為主', '有效溝通', '部門爭競'],
     'COMMON', '共用工作項目'),
    (['溫室效應', '全球暖化', '節能', '酸雨', '環境保護', '節電', 'LED', '甲烷', '臭氧', '無悔政策'],
     'COMMON', '共用工作項目'),
    (['職安法', '職業安全衛生法', '勞工保險', '法規', '規則', '辦法', '標準', '罰', '義務', '雇主應',
      '體格檢查', '健康檢查', '自動檢查', '代行檢查', '申報', '登錄', '條文'],
     'LAW', '職業安全衛生法規'),
    (['安全衛生管理', '管理系統', '管理計畫', '安全觀察', '工作安全分析', '委員會', '協調', '溝通',
      '人性化安全', '教育訓練', '安全行為'],
     'A', '職業衛生危害控制概論'),
]

def categorize(text):
    for keywords, cat, cat_name in KEYWORD_CATS:
        if any(k in text for k in keywords):
            return cat, cat_name
    return 'A', '職業衛生危害控制概論'


def parse_pdf(pdf_path, year, session):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"

    # Remove page headers (lines like "全國技術士技能檢定第N梯次" and "115 職業衛生管理 甲 ...")
    full_text = re.sub(r'全國技術士技能檢定第\d+梯次\n', '', full_text)
    full_text = re.sub(r'\d+\s+職業衛生管理\s+甲\s+\S+\n', '', full_text)
    full_text = re.sub(r'\d+\s+年度\S+\S+\n', '', full_text)

    # Normalize whitespace but keep newlines for now
    full_text = re.sub(r'[ \t]+', ' ', full_text)

    # Split into blocks starting with question number
    blocks = re.split(r'(?=^\d{1,2}\.\s*\()', full_text, flags=re.MULTILINE)

    questions = []
    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Match question header: "61. (12) " or "1. (4) \n"
        m = re.match(r'^(\d+)\.\s*\((\w+)\)\s*', block)
        if not m:
            continue

        q_num = int(m.group(1))
        answer_raw = m.group(2).strip()  # e.g. "4", "12", "234"

        rest = block[m.end():]
        rest = rest.replace('\n', ' ')
        rest = re.sub(r'\s+', ' ', rest).strip()

        # Split on circle numbers
        parts = re.split('[①②③④]', rest)
        if len(parts) < 5:
            # Try splitting on ① ② etc. as unicode
            continue

        question_text = clean_text(parts[0])
        opt_raw = [clean_text(p) for p in parts[1:5]]
        # Remove trailing 。 from last option
        opt_raw = [re.sub(r'。\s*$', '', o) for o in opt_raw]
        # Build A. B. C. D. options
        options = [f"{LETTERS[i]}. {opt_raw[i]}" for i in range(4)]

        # Convert answer numbers to letters
        if len(answer_raw) == 1:
            answer = num_to_letter(answer_raw)
            q_type = "single"
        else:
            answer = "".join(num_to_letter(d) for d in answer_raw)
            q_type = "multiple"

        cat, cat_name = categorize(question_text + " " + " ".join(opt_raw))

        q = {
            "id": f"{year}-{session}-{q_num:03d}",
            "year": year,
            "session": session,
            "category": cat,
            "categoryName": cat_name,
            "question": question_text,
            "options": options,
            "answer": answer,
            "explanation": "",
            "lawRef": "",
            "source": "official"
        }
        if q_type == "multiple":
            q["type"] = "multiple"

        questions.append(q)

    return questions


if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else "221001-1.pdf"
    year = int(sys.argv[2]) if len(sys.argv) > 2 else 115
    session = int(sys.argv[3]) if len(sys.argv) > 3 else 1

    qs = parse_pdf(pdf, year, session)
    print(f"Parsed {len(qs)} questions from {pdf}")

    if qs:
        print("\nSample question 1:")
        print(json.dumps(qs[0], ensure_ascii=False, indent=2))
        print("\nSample question 61 (multi):")
        for q in qs:
            if q['id'].endswith('-061'):
                print(json.dumps(q, ensure_ascii=False, indent=2))
                break

    out_file = f"questions_{year}_{session}.json"
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(qs, f, ensure_ascii=False, indent=2)
    print(f"\nSaved to {out_file}")
