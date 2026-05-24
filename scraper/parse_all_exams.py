#!/usr/bin/env python3
"""
Parse all 職業衛生管理甲級 學科試題 PDFs (106-115年) into structured JSON.

Handles:
  - 106年 (F-pages format, inline answer in parentheses, ①②③④ options)
  - 107-111年 (官方格式, single+multiple choice, ①②③④ options)
  - 22100_-職業衛生管理學科.pdf (question bank organized by work items)
  - 221001-1.pdf SKIPPED (115年第1梯次 already parsed)
"""

import fitz
import json
import re
import os
import sys

# ─── Constants ────────────────────────────────────────────────────────────────
SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
PARSED_DIR = os.path.join(SCRAPER_DIR, "parsed")
os.makedirs(PARSED_DIR, exist_ok=True)

LETTERS = ['A', 'B', 'C', 'D']

# PDFs to skip (already parsed or non-學科)
SKIP_PDFS = {
    "221001-1.pdf",           # 115年第1梯次 已解析
    "109-3職業衛生管理術科試題.pdf",   # 術科
    "0316095504A2.pdf",       # 術科
    "0317094136A2.pdf",       # 術科
    "0318082503A2.pdf",       # 術科
    "0320083514A2.pdf",       # 術科
    "0707163645A2.pdf",       # 術科
    "0708082351A2.pdf",       # 術科
    "0710081012A2.pdf",       # 術科
    "1103100104A2.pdf",       # 術科
    "1104080343A2.pdf",       # 術科
    "1106082141A2.pdf",       # 術科
    "職業安全衛生法規總輯_2021年12月版.pdf",  # 法規手冊
    "download_exams.py",
    "parse_115_exam.py",
    "parse_pdf.py",
    "predict.py",
    "requirements.txt",
    "questions_115_1.json",
}

# ─── Category keywords ─────────────────────────────────────────────────────────
KEYWORD_CATS = [
    # LAW first – most specific
    (['職業安全衛生法', '勞工保險', '勞動基準法', '勞動檢查法', '勞工健康保護規則',
      '職業安全衛生管理辦法', '危害性化學品', '特定化學物質危害預防標準',
      '有機溶劑中毒預防規則', '鉛中毒預防規則', '缺氧症預防規則', '四烷基鉛',
      '高壓氣體', '危險性工作場所', '危險性機械', '罰', '法規', '規則', '辦法',
      '標準', '條文', '申報', '檢查員', '代行檢查', '職安法', '施行細則',
      '義務', '罰鍰', '罰金', '有期徒刑', '主管機關', '勞動部', '雇主應',
      '雇主不得', '制度', '許可', '核可', '法令', '法律', '修正',
      '體格檢查', '健康檢查', '自動檢查'],
     'LAW', '職業安全衛生法規'),

    # Monitoring/Sampling
    (['監測', '採樣', '分析', '偵測', '採集介質', '分光光譜', '原子吸收光譜',
      '光譜儀', '採樣泵', '監測結果報告', '作業環境監測', '採樣方法', '採樣策略',
      '氣相層析', 'HPLC', 'GC-MS', '活性碳管', '矽膠管', '濾紙', '衝擊瓶',
      '個人採樣', '區域採樣', '定點採樣', '採樣流量'],
     'D', '作業環境監測'),

    # Control/PPE/Ventilation
    (['通風', '換氣', '氣罩', '凸緣', '換氣裝置', '排氣', '局限空間', '入槽',
      '缺氧', '硫化氫', '粉塵清掃', '個人防護具', '手套', 'PPE', '防音',
      '空氣清淨', '集塵', '密閉設備', '工程控制', '隔離', '替代', '控制措施',
      '防護設備', '呼吸防護', '口罩', '防毒面具', '聽力防護', '安全帽',
      '防護衣', '防護鞋', '安全帶', '局部排氣', '整體換氣', '稀釋換氣',
      '導管', '壓力損失'],
     'E', '危害控制'),

    # Exposure/Risk assessment
    (['容許暴露標準', '容許濃度', '暴露評估', '風險評估', '暴露劑量', '時量平均',
      '失能嚴重率', '失能傷害頻率', 'TWA', 'STEL', 'TLV', 'PEL', 'IDLH',
      '半致死劑量', 'LD50', 'LC50', '暴露比', '混合暴露', '危害商數',
      '超額危險', '風險特徵描述', '危害辨識', '劑量反應'],
     'C', '危害暴露風險評估'),

    # Hazards/industrial hygiene science
    (['噪音', '振動', '熱危害', 'WBGT', '熱指數', '熱交換', '有機溶劑',
      '特定化學物質', '鉛', '石綿', '苯', '氨', '人因', '肌肉骨骼',
      '不法侵害', '職場暴力', '生物病原', '輻射', '游離輻射', '非游離輻射',
      '紫外線', '微波', '雷射', '電磁波', '重複性動作', '振幅', 'dB',
      '分貝', '化學品', '有害物', '致癌物', '致突變', '生殖毒性', '粉塵',
      '石英', '矽肺症', '塵肺症', '職業病', '皮膚炎', '過敏', '哮喘',
      '極低頻', '靜電', '電磁', '手臂振動'],
     'B', '危害辨識與認知'),

    # Common/general knowledge
    (['著作權', '營業秘密', '服務客戶', '工作倫理', '菸害', '癌症篩檢',
      '先入為主', '有效溝通', '部門爭競', '溫室效應', '全球暖化', '節能',
      '酸雨', '環境保護', '節電', 'LED', '甲烷', '臭氧', '無悔政策',
      '廢棄物', '省水', '節水', '低碳', '碳排放', '資源回收', '垃圾分類',
      '職業道德', '誠信', '廉政', '貪污', '公職', '利益迴避', '心肺復甦',
      'CPR', 'AED', '急救'],
     'COMMON', '共用工作項目'),

    # Management/systems
    (['安全衛生管理', '管理系統', '管理計畫', '安全觀察', '工作安全分析',
      '委員會', '協調', '溝通', '人性化安全', '教育訓練', '安全行為',
      'PDCA', 'OHSAS', 'ISO 45001', '危害分析', '安全文化', '安全氣候',
      '事故調查', '根本原因', '工安', '安全管理'],
     'A', '職業衛生危害控制概論'),
]


def categorize(text):
    for keywords, cat, cat_name in KEYWORD_CATS:
        if any(k in text for k in keywords):
            return cat, cat_name
    return 'A', '職業衛生危害控制概論'


def clean_text(s):
    return re.sub(r'\s+', ' ', s).strip()


def num_to_letter(n):
    """Convert '1'-'4' to 'A'-'D'."""
    return LETTERS[int(n) - 1]


def answer_raw_to_letters(answer_raw):
    """Convert answer string like '3' or '124' to letter(s) like 'C' or 'ACD'."""
    answer_raw = answer_raw.strip()
    if len(answer_raw) == 1:
        return num_to_letter(answer_raw), "single"
    else:
        return "".join(num_to_letter(d) for d in sorted(set(answer_raw))), "multiple"


def extract_options_and_question(text_after_answer):
    """
    Given the text after the answer marker, extract question text and 4 options.
    Handles ①②③④ (circled numbers) as option delimiters.
    Returns (question_text, [opt1, opt2, opt3, opt4]) or None on failure.
    """
    # Normalize whitespace but keep content
    text = re.sub(r'[ \t　]+', ' ', text_after_answer).strip()
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)

    # Split on circled numbers ①②③④
    parts = re.split(r'[①②③④]', text)
    if len(parts) >= 5:
        q_text = clean_text(parts[0])
        opts = []
        for i, p in enumerate(parts[1:5]):
            opt = clean_text(p)
            # Remove trailing 。 or .
            opt = re.sub(r'[。\.]?\s*$', '', opt).strip()
            opts.append(f"{LETTERS[i]}. {opt}")
        return q_text, opts

    return None, None


# ─── Format-specific parsers ───────────────────────────────────────────────────

def parse_format_106(full_text, year, session):
    """
    Parse 106年 format (from 職安一點通 book).
    Format:  N. \n( X ) question text\n①opt1　②opt2　③opt3　④opt4。
    Sometimes the question and options are on multiple lines.
    Also removes page headers like 'F-N', 'appendix F 歷屆試題', '職安一點通...'
    """
    # Remove page headers
    text = re.sub(r'F-\d+\n', '', full_text)
    text = re.sub(r'appendix F\s+歷屆試題\n', '', text)
    text = re.sub(r'職安一點通\s*\n職業衛生管理甲級檢定完全掌握\n', '', text)
    text = re.sub(r'\d{3}-\d+\s+[學術]科試題\n', '', text)
    # Remove exam header
    text = re.sub(r'106 年度22100.*?姓\s*　\s*名：\n', '', text, flags=re.DOTALL)
    text = re.sub(r'選擇題：\n', '', text)

    # Stop at the 術科 section
    if '術科試題' in text:
        idx = text.index('術科試題')
        text = text[:idx]

    # 106年 format: question number on its own line, then "( N ) text\n①..."
    # Pattern: line starts with number then dot (possibly followed by newline)
    # Then answer in parentheses
    questions = []

    # Split by question numbers: look for lines like "N. " or "N.\n" or " N. "
    # The 106 format has: "1. \n( 1 ) text\n①..."
    blocks = re.split(r'(?=\n\d{1,2}\.\s*(?:\n|\s*\()|^\d{1,2}\.\s*(?:\n|\s*\())', text, flags=re.MULTILINE)

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Match: number. (answer) text...
        # The answer might be on same line or next line
        m = re.match(r'^(\d+)\.\s*\(\s*(\d+)\s*\)\s*', block, re.DOTALL)
        if not m:
            # Try: number.\n( answer ) text
            m = re.match(r'^(\d+)\.\s*\n\s*\(\s*(\d+)\s*\)\s*', block, re.DOTALL)
        if not m:
            continue

        q_num = int(m.group(1))
        if q_num < 1 or q_num > 80:
            continue

        answer_raw = m.group(2).strip()
        rest = block[m.end():]

        q_text, opts = extract_options_and_question(rest)
        if q_text is None or len(q_text) < 3:
            continue

        answer, q_type = answer_raw_to_letters(answer_raw)

        cat, cat_name = categorize(q_text + " " + " ".join(opts))

        q = {
            "id": f"{year}-{session}-{q_num:03d}",
            "year": year,
            "session": session,
            "category": cat,
            "categoryName": cat_name,
            "question": q_text,
            "options": opts,
            "answer": answer,
            "explanation": "",
            "lawRef": "",
            "source": "official",
            "type": q_type
        }
        questions.append(q)

    return questions


def parse_format_108_plus(full_text, year, session, filename=""):
    """
    Parse 108-111年 official exam format.
    Format varies slightly:
      108-109: "N.\n(X)\ntext①opt1②opt2③opt3④opt4。"
              or "N.\n(X)\ntext\n①opt1\n②opt2..."
      110-111: "N. (X) \ntext①opt1②opt2③opt3④opt4。"
    """
    # Remove page headers
    text = re.sub(r'\d+\s+職業衛生管理\s+甲\s+\S+\s*\n', '', full_text)
    text = re.sub(r'全國技術士技能檢定第\d+梯次\s*\n', '', text)
    text = re.sub(r'Page \d+ of \d+\s*\n', '', text)

    # Remove exam header block
    text = re.sub(r'\d+\s+年度.*?姓\s*\n?\s*名：\s*\n', '', text, flags=re.DOTALL)

    # Remove section separators
    text = re.sub(r'單選題：?\s*\n', '', text)
    text = re.sub(r'複選題：?\s*\n', '', text)

    # Normalize spaces (keep newlines for now)
    text = re.sub(r'[ \t　]+', ' ', text)

    questions = []

    # Split text into question blocks
    # Look for lines starting with a question number
    blocks = re.split(r'(?=^\d{1,2}[\.\s]*\s*\(\s*[\d]+\s*\))', text, flags=re.MULTILINE)

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Match "N. (answer) " or "N.\n(answer)\n"
        m = re.match(r'^(\d+)[\.\s]*\s*\(\s*(\d+)\s*\)\s*', block, re.DOTALL)
        if not m:
            continue

        q_num = int(m.group(1))
        if q_num < 1 or q_num > 80:
            continue

        answer_raw = m.group(2).strip()
        rest = block[m.end():]

        q_text, opts = extract_options_and_question(rest)
        if q_text is None or len(q_text) < 3:
            continue

        answer, q_type = answer_raw_to_letters(answer_raw)

        cat, cat_name = categorize(q_text + " " + " ".join(opts))

        q = {
            "id": f"{year}-{session}-{q_num:03d}",
            "year": year,
            "session": session,
            "category": cat,
            "categoryName": cat_name,
            "question": q_text,
            "options": opts,
            "answer": answer,
            "explanation": "",
            "lawRef": "",
            "source": "official",
            "type": q_type
        }
        questions.append(q)

    return questions


def parse_22100_bank(full_text):
    """
    Parse the 22100_-職業衛生管理學科.pdf question bank.
    Organized by work items: 工作項目01, 02, 03
    Format: "N. (X)  \nquestion text ①opt1 ②opt2 ③opt3 ④opt4 。"
    Returns list of questions with special IDs like 'bank-01-NNN'
    """
    # Map work items to categories
    WORK_ITEM_MAP = {
        '01': ('LAW', '職業安全衛生法規'),
        '02': ('A', '職業衛生危害控制概論'),
        '03': ('B', '危害辨識與認知'),  # 專業課程 covers everything
    }

    # Split by work item headers
    sections = re.split(r'22100 職業衛生管理 甲 工作項目(\d+)[：:][^\n]+\n', full_text)
    # sections[0] = preamble, then alternating: work_item_num, text

    questions = []
    q_global = 0

    for i in range(1, len(sections), 2):
        work_item = sections[i]
        section_text = sections[i + 1] if i + 1 < len(sections) else ""

        cat, cat_name = WORK_ITEM_MAP.get(work_item, ('A', '職業衛生危害控制概論'))

        # Remove page headers
        section_text = re.sub(r'Page \d+ of \d+\s*\n', '', section_text)

        # Normalize spaces
        section_text = re.sub(r'[ \t　]+', ' ', section_text)

        # Split into question blocks
        blocks = re.split(r'(?=^\d+\.\s*\(\s*\d+\s*\))', section_text, flags=re.MULTILINE)

        for block in blocks:
            block = block.strip()
            if not block:
                continue

            m = re.match(r'^(\d+)\.\s*\(\s*(\d+)\s*\)\s*', block, re.DOTALL)
            if not m:
                continue

            local_num = int(m.group(1))
            answer_raw = m.group(2).strip()
            rest = block[m.end():]

            q_text, opts = extract_options_and_question(rest)
            if q_text is None or len(q_text) < 3:
                continue

            answer, q_type = answer_raw_to_letters(answer_raw)

            # Use keyword categorization for work item 03 (specialized)
            if work_item == '03':
                cat, cat_name = categorize(q_text + " " + " ".join(opts))

            q_global += 1
            q = {
                "id": f"bank-{work_item}-{local_num:04d}",
                "year": None,
                "session": None,
                "category": cat,
                "categoryName": cat_name,
                "question": q_text,
                "options": opts,
                "answer": answer,
                "explanation": "",
                "lawRef": "",
                "source": "bank",
                "type": q_type
            }
            questions.append(q)

    return questions


# ─── PDF dispatcher ────────────────────────────────────────────────────────────

def get_year_session_from_filename(filename):
    """
    Extract year and session from filename.
    Examples:
      "106-1職業衛生管理學術科試題暨參考解答.pdf" -> (106, 1)
      "111-2職業衛生管理學科試題.pdf" -> (111, 2)
      "109-3職業衛生管理學科試題.pdf" -> (109, 3)
    """
    m = re.match(r'(\d{3})-(\d)', filename)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def extract_full_text_learning_section(doc, filename):
    """
    For 106年 books that include both 學科 and 術科,
    extract only the 學科 pages.
    """
    full_text = ""
    for page in doc:
        page_text = page.get_text()
        # Once we hit 術科試題 header, stop
        if '術科試題' in page_text and '學科試題' not in page_text:
            break
        full_text += page_text + "\n"
    return full_text


def parse_pdf_file(pdf_path, filename):
    """Main dispatcher: determine format and parse."""
    year, session = get_year_session_from_filename(filename)

    doc = fitz.open(pdf_path)

    # Special case: 22100_ question bank
    if filename.startswith("22100_"):
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n"
        return parse_22100_bank(full_text), None, None

    if year is None:
        print(f"  [SKIP] Cannot determine year/session from: {filename}")
        return [], None, None

    # 106年: book format with 術科 pages included
    if year == 106:
        full_text = extract_full_text_learning_section(doc, filename)
        questions = parse_format_106(full_text, year, session)
    else:
        # 107-111年: official exam PDFs
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n"
        questions = parse_format_108_plus(full_text, year, session, filename)

    return questions, year, session


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    import sys

    all_questions = []
    stats = {}

    pdf_files = sorted([
        f for f in os.listdir(SCRAPER_DIR)
        if f.endswith('.pdf') and f not in SKIP_PDFS
    ])

    print(f"Found {len(pdf_files)} PDFs to process (excluding skips)\n")

    for filename in pdf_files:
        pdf_path = os.path.join(SCRAPER_DIR, filename)
        print(f"Processing: {filename}")

        try:
            questions, year, session = parse_pdf_file(pdf_path, filename)
        except Exception as e:
            print(f"  [ERROR] {e}")
            import traceback
            traceback.print_exc()
            continue

        if not questions:
            print(f"  [WARN] No questions extracted")
            continue

        print(f"  Extracted: {len(questions)} questions")

        # Save per-file output
        if year and session:
            out_name = f"{year}-{session}.json"
            key = f"{year}-{session}"
        elif filename.startswith("22100_"):
            out_name = "bank-22100.json"
            key = "bank-22100"
        else:
            out_name = f"unknown-{filename}.json"
            key = filename

        out_path = os.path.join(PARSED_DIR, out_name)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  Saved: {out_path}")

        stats[key] = len(questions)
        all_questions.extend(questions)

    print(f"\n{'='*60}")
    print(f"Total questions extracted: {len(all_questions)}")
    print(f"\nBy exam:")
    for k, v in sorted(stats.items()):
        print(f"  {k}: {v}")

    return all_questions, stats


if __name__ == "__main__":
    questions, stats = main()
