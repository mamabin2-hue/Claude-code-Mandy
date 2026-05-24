#!/usr/bin/env python3
"""
Extract 術科 (practical exam) questions from historical PDFs.
Produces shukeyi_questions.json and shukeyi_analysis.json.
"""

import fitz  # PyMuPDF
import json
import re
import os
from typing import Optional


# ── Topic classification ─────────────────────────────────────────────────────

TOPIC_CODES = {
    "CHEM":     "化學性危害與GHS標示通識",
    "PHYS":     "物理性危害（噪音、輻射、振動、溫熱）",
    "BIO":      "生物性危害",
    "ERGO":     "人因工程與肌肉骨骼疾病",
    "PSY":      "心理壓力與不法侵害預防",
    "ASSESS":   "暴露評估與風險分析",
    "MONITOR":  "作業環境監測技術",
    "CONTROL":  "工程控制與通風換氣",
    "PPE":      "個人防護具",
    "CONFINED": "局限空間與缺氧危害",
    "HEALTH":   "勞工健康管理與職業病",
    "MATERNAL": "母性健康保護",
    "SYSTEM":   "職安衛管理系統（CNS 45001）",
    "LAW":      "職安衛法規",
    "FIRSTAID": "急救技能",
    "OSHLAW":   "承攬/外包管理法規",
}

# Keyword → topic code mapping (order matters: first match wins)
TOPIC_KEYWORDS = [
    ("CONFINED", ["局限空間", "缺氧危害", "缺氧危險", "IDLH", "局部空間", "密閉空間"]),
    ("PSY",      ["不法侵害", "社會心理", "職場暴力", "心理壓力", "心理危害", "psychosocial",
                  "不法侵害預防", "職場不法", "異常工作負荷", "過勞", "腦心血管"]),
    ("MATERNAL", ["母性健康", "妊娠", "哺乳", "分娩", "生殖毒性", "孕婦"]),
    ("ERGO",     ["人因工程", "人因性危害", "肌肉骨骼", "重複性作業", "人因危害",
                  "Key Indicator", "KIM", "人因工程", "搬運"]),
    ("HEALTH",   ["健康檢查", "健康管理", "職業病", "Framingham", "勞工健康服務",
                  "特殊健康", "特別危害健康", "健康保護規則", "健康風險", "健康追蹤"]),
    ("MONITOR",  ["作業環境監測", "採樣", "個人採樣", "環境監測", "monitoring",
                  "照度", "時量平均", "TWA", "ppm", "mg/m3", "採樣策略"]),
    ("CONTROL",  ["局部排氣", "通風換氣", "全體換氣", "整體換氣", "氣罩", "控制風速",
                  "捕捉風速", "排氣量", "導管", "風量", "風扇", "換氣"]),
    ("ASSESS",   ["暴露評估", "風險評估", "危害評估", "分級管理", "評估及分級",
                  "風險等級", "暴露濃度", "容許暴露"]),
    ("CHEM",     ["GHS", "SDS", "安全資料表", "危害通識", "化學品標示", "有機溶劑",
                  "特定化學物質", "危害性化學品", "硫酸", "正己烷", "石英", "粉塵",
                  "化學性危害", "CMR", "優先管理化學品", "毒性物質", "致癌", "化學品"]),
    ("PHYS",     ["噪音", "振動", "輻射", "溫熱", "WBGT", "熱危害", "熱指數",
                  "衝擊性噪音", "聽力", "音壓級", "分貝"]),
    ("BIO",      ["生物病原體", "感染", "微生物", "黴菌", "真菌", "病毒",
                  "退伍軍人", "生物性危害"]),
    ("PPE",      ["個人防護具", "呼吸防護具", "防護具", "面罩", "防毒面具",
                  "防塵口罩", "PPE"]),
    ("SYSTEM",   ["管理系統", "CNS 45001", "OHSAS", "ISO 45001", "安全衛生管理系統",
                  "管理計畫", "安全衛生政策"]),
    ("FIRSTAID", ["急救", "CPR", "心肺復甦術", "燒燙傷", "止血", "AED", "哈姆立克"]),
    ("OSHLAW",   ["承攬", "外包", "再承攬", "承攬人"]),
    ("LAW",      ["職業安全衛生法", "罰鍰", "法規", "條次", "條文"]),
]


def classify_topic(text: str) -> tuple[str, str]:
    """Return (topicCode, topicName) for a question's text."""
    for code, keywords in TOPIC_KEYWORDS:
        if any(kw in text for kw in keywords):
            return code, TOPIC_CODES[code]
    return "LAW", TOPIC_CODES["LAW"]


# ── Key-law extraction ────────────────────────────────────────────────────────

LAW_PATTERNS = [
    r"職業安全衛生法",
    r"職業安全衛生設施規則",
    r"職業安全衛生管理辦法",
    r"勞工健康保護規則",
    r"勞工作業場所容許暴露標準",
    r"危害性化學品標示及通識規則",
    r"危害性化學品評估及分級管理辦法",
    r"有機溶劑中毒預防規則",
    r"粉塵危害預防標準",
    r"特定化學物質危害預防標準",
    r"局限空間作業危害預防標準",
    r"缺氧症預防規則",
    r"噪音危害預防設施標準",
    r"女性勞工母性健康保護實施辦法",
    r"優先管理化學品之指定及運作管理辦法",
    r"異常氣壓危害預防標準",
    r"CNS\s*45001",
    r"ISO\s*45001",
]


def extract_key_laws(text: str) -> list[str]:
    """Extract mentioned laws/regulations from question text."""
    found = []
    for pat in LAW_PATTERNS:
        if re.search(pat, text):
            # Clean up the matched law name
            m = re.search(pat, text)
            if m:
                found.append(m.group(0))
    return list(dict.fromkeys(found))  # unique, preserve order


# ── Point extraction ──────────────────────────────────────────────────────────

def extract_total_points(text: str) -> int:
    """Sum all point markers (N分) occurrences in the text.
    Handles patterns like: (10分), （10分）, ，10 分), 共10分
    """
    # Match points in various contexts: (N分), （N分）, ，N分), 共N分
    pts = re.findall(r'(?:[（(,，共]\s*)(\d+)\s*分\s*[）)]', text)
    # Also catch standalone patterns like "（10分）" without leading comma
    pts2 = re.findall(r'[（(](\d+)\s*分[）)]', text)
    # Merge both, convert to int, filter reasonable values (1-100)
    all_pts = []
    for p in pts + pts2:
        val = int(p)
        if 1 <= val <= 100:
            all_pts.append(val)
    # Deduplicate while preserving contribution from multiple sub-questions
    # Use a simple heuristic: if same number appears more than once, keep all instances
    total = sum(all_pts) if all_pts else 0
    # Normalize: cap at 100 points per question (typical max is 20-25)
    if total > 100:
        # May have double-counted from answer repetition; use max unique sum
        seen = {}
        for p in all_pts:
            seen[p] = seen.get(p, 0) + 1
        # Re-sum without excess duplicates (keep only up to 5 of each)
        total = sum(v * min(cnt, 5) for v, cnt in seen.items())
    return total if total else 20  # default 20 if not found


# ── Sub-question extraction ───────────────────────────────────────────────────

def extract_sub_questions(text: str) -> list[str]:
    """Extract sub-questions (一)(二)... from the full text."""
    # Match patterns like (一)..., （一）..., or 一、...
    pattern = r'[（(][一二三四五六七八九十][）)]\s*.+?(?=[（(][一二三四五六七八九十][）)]|$)'
    matches = re.findall(pattern, text, re.DOTALL)
    subs = []
    for m in matches:
        cleaned = re.sub(r'\s+', ' ', m.strip())
        if len(cleaned) > 5:
            subs.append(cleaned)

    # Also try numbered format (1. 2. 3.)
    if not subs:
        pattern2 = r'(?:^|\n)\d+[.、]\s*.+?(?=(?:^|\n)\d+[.、]|$)'
        matches2 = re.findall(pattern2, text, re.DOTALL | re.MULTILINE)
        for m in matches2:
            cleaned = re.sub(r'\s+', ' ', m.strip())
            if len(cleaned) > 5:
                subs.append(cleaned)

    return subs


# ── PDF text extraction ───────────────────────────────────────────────────────

def get_full_text(filepath: str) -> str:
    """Extract all text from a PDF."""
    doc = fitz.open(filepath)
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n".join(pages)


def get_shukeyi_text(filepath: str) -> str:
    """Extract text from the 術科 section only (for mixed PDFs)."""
    doc = fitz.open(filepath)
    pages = []
    in_shukeyi = False

    for page in doc:
        text = page.get_text()
        # Look for start of 術科 section
        if not in_shukeyi:
            if re.search(r'術科[測試]*試題|術科題目', text) or \
               ('術科' in text and '第一題' in text):
                in_shukeyi = True
        if in_shukeyi:
            pages.append(text)

    doc.close()
    return "\n".join(pages)


# ── Question block parsing ────────────────────────────────────────────────────

def parse_questions_from_text(text: str, year: int, session: int,
                               exam_id_prefix: str) -> list[dict]:
    """
    Parse individual question blocks from the 術科 text.
    Returns list of question dicts.
    """
    # Normalize whitespace
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Find all 第N題 markers
    q_pattern = re.compile(
        r'第([一二三四五六七八九十])題題目[：:]\s*', re.MULTILINE
    )

    # Alternative pattern for older formats
    alt_pattern = re.compile(
        r'第([一二三四五六七八九十])題[：:\s]', re.MULTILINE
    )

    matches = list(q_pattern.finditer(text))
    if not matches:
        matches = list(alt_pattern.finditer(text))

    num_map = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    }

    questions = []
    for i, m in enumerate(matches):
        q_num_char = m.group(1)
        q_num = num_map.get(q_num_char, i + 1)

        # Extract text until next question or end
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        q_text = text[start:end].strip()

        # Remove answer section (題解 or 解答)
        answer_cut = re.search(r'\n[一二三四五]\s*、|\n\d+\s+[一二三四五]\s*、', q_text)
        # More aggressive: cut at 題解 or reference answer markers
        for marker in ['題解', '解答', '參考答案', '答：', '答案：']:
            idx = q_text.find(marker)
            if idx > 0:
                q_text = q_text[:idx]

        q_text = q_text.strip()

        if len(q_text) < 10:
            continue

        # Build a clean version for topic classification
        full_combined = q_text

        topic_code, topic_name = classify_topic(full_combined)
        key_laws = extract_key_laws(full_combined)
        total_pts = extract_total_points(full_combined)
        sub_qs = extract_sub_questions(full_combined)

        # Clean up text
        q_text_clean = re.sub(r'\s+', ' ', q_text).strip()

        questions.append({
            "id": f"{exam_id_prefix}-P{q_num}",
            "year": year,
            "session": session,
            "questionNum": q_num,
            "topic": topic_name,
            "topicCode": topic_code,
            "fullText": q_text_clean,
            "subQuestions": sub_qs,
            "totalPoints": total_pts,
            "keyLaws": key_laws,
            "source": "official",
        })

    return questions


# ── PDF file definitions ──────────────────────────────────────────────────────

SCRAPER_DIR = os.path.join(os.path.dirname(__file__))

# (filename, year, session, exam_id_prefix, is_mixed)
PDF_DEFS = [
    # Mixed 學術科 PDFs (106-109)
    ("106-1職業衛生管理學術科試題暨參考解答.pdf",  106, 1, "106-1", True),
    ("106-2職業衛生管理學術科試題暨參考解答.pdf",  106, 2, "106-2", True),
    ("106-3職業衛生管理學術科試題暨參考解答.pdf",  106, 3, "106-3", True),
    ("107-1職業衛生管理學術科試題暨參考解答.pdf",  107, 1, "107-1", True),
    ("107-2職業衛生管理學術科試題暨參考解答.pdf",  107, 2, "107-2", True),
    ("107-3職業衛生管理學術科試題暨參考解答.pdf",  107, 3, "107-3", True),
    ("108-1職業衛生管理學術科試題.pdf",            108, 1, "108-1", True),
    ("108-2職業衛生管理學術科試題.pdf",            108, 2, "108-2", True),
    ("108-3職業衛生管理學術科試題.pdf",            108, 3, "108-3", True),
    ("109-1職業衛生管理學術科試題.pdf",            109, 1, "109-1", True),
    ("109-2職業衛生管理學術科試題.pdf",            109, 2, "109-2", True),
    # Pure 術科 PDFs (109-3 pure)
    ("109-3職業衛生管理術科試題.pdf",              109, 3, "109-3", False),
    # Pure 術科 PDFs (codename files)
    ("1106082141A2.pdf",   111, 3, "111-3", False),
    ("0320083514A2.pdf",   112, 3, "112-3", False),
    ("0318082503A2.pdf",   113, 1, "113-1a", False),
    ("0710081012A2.pdf",   113, 1, "113-1b", False),
    ("0708082351A2.pdf",   113, 2, "113-2", False),
    ("1104080343A2.pdf",   113, 3, "113-3", False),
    ("0317094136A2.pdf",   114, 1, "114-1", False),
    ("0707163645A2.pdf",   114, 2, "114-2", False),
    ("1103100104A2.pdf",   114, 3, "114-3", False),
    ("0316095504A2.pdf",   115, 1, "115-1", False),
]


# ── Main extraction ───────────────────────────────────────────────────────────

def main():
    all_questions = []

    for fname, year, session, prefix, is_mixed in PDF_DEFS:
        fpath = os.path.join(SCRAPER_DIR, fname)
        if not os.path.exists(fpath):
            print(f"  [SKIP] File not found: {fname}")
            continue

        print(f"\n[{prefix}] Processing: {fname}")
        try:
            if is_mixed:
                text = get_shukeyi_text(fpath)
            else:
                text = get_full_text(fpath)

            questions = parse_questions_from_text(text, year, session, prefix)
            print(f"  → Found {len(questions)} questions")
            for q in questions:
                print(f"     Q{q['questionNum']}: [{q['topicCode']}] {q['topic'][:30]} ({q['totalPoints']}分)")
            all_questions.extend(questions)
        except Exception as e:
            print(f"  [ERROR] {e}")
            import traceback
            traceback.print_exc()

    # ── Write shukeyi_questions.json ─────────────────────────────────────────
    out_path = os.path.join(SCRAPER_DIR, "shukeyi_questions.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {len(all_questions)} questions to {out_path}")

    # ── Frequency analysis ───────────────────────────────────────────────────
    topic_freq: dict[str, dict] = {}
    for q in all_questions:
        code = q["topicCode"]
        exam_id = f"{q['year']}-{q['session']}"
        if code not in topic_freq:
            topic_freq[code] = {
                "count": 0,
                "years": [],
                "topicName": TOPIC_CODES.get(code, code),
            }
        topic_freq[code]["count"] += 1
        if exam_id not in topic_freq[code]["years"]:
            topic_freq[code]["years"].append(exam_id)

    # Sort by frequency
    sorted_topics = sorted(topic_freq.items(), key=lambda x: x[1]["count"], reverse=True)
    topic_freq_sorted = dict(sorted_topics)

    # Recent trend: questions from years >= 112
    recent_years = {"112", "113", "114", "115"}
    recent_codes: dict[str, int] = {}
    for q in all_questions:
        if str(q["year"]) in recent_years:
            code = q["topicCode"]
            recent_codes[code] = recent_codes.get(code, 0) + 1
    recent_trend = [c for c, _ in sorted(recent_codes.items(), key=lambda x: x[1], reverse=True)]

    # Predicted hot topics: top from recent + historically frequent
    hot = list(dict.fromkeys(recent_trend[:6] + [c for c, _ in sorted_topics[:4]]))[:8]

    analysis = {
        "topicFrequency": topic_freq_sorted,
        "recentTrend": recent_trend,
        "predictedHotTopics": hot,
    }

    analysis_path = os.path.join(SCRAPER_DIR, "shukeyi_analysis.json")
    with open(analysis_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    print(f"Wrote analysis to {analysis_path}")

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total questions extracted: {len(all_questions)}")
    print(f"PDFs processed: {len(PDF_DEFS)}")
    print("\nTopic frequency:")
    for code, info in topic_freq_sorted.items():
        print(f"  {code:10s}: {info['count']:3d}  ({info['topicName']})")
    print(f"\nRecent trend (112-115): {' > '.join(recent_trend[:8])}")
    print(f"Predicted hot topics:   {' > '.join(hot)}")


if __name__ == "__main__":
    main()
