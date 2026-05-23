"""
解析考選部職業衛生管理甲級試題 PDF，輸出為 questions.json 格式。

用法：
  python parse_pdf.py pdfs/2024-1.pdf --year 2024 --session 1
  python parse_pdf.py pdfs/ --all   # 批次處理整個資料夾

解析後的題目需人工複查（PDF格式不規則時可能有誤）。
"""

import json
import re
import sys
import os
import argparse
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    sys.exit("請先執行：pip install pdfplumber")


CATEGORY_MAP = {
    "職業衛生危害控制": "A",
    "危害辨識": "B",
    "暴露風險評估": "C",
    "作業環境監測": "D",
    "危害控制": "E",
    "風險分級": "F",
    "法規": "LAW",
    "共用": "COMMON",
}

OPTION_PATTERN = re.compile(r"^(甲|乙|丙|丁|A|B|C|D)[.、．]\s*(.+)")
QUESTION_PATTERN = re.compile(r"^(\d+)[.、．]\s*(.+)")


def extract_text(pdf_path: str) -> str:
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts)


def parse_questions(text: str, year: int, session: int) -> list:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    questions = []
    current_q = None
    current_opts = []

    for line in lines:
        q_match = QUESTION_PATTERN.match(line)
        opt_match = OPTION_PATTERN.match(line)

        if q_match:
            if current_q and len(current_opts) >= 4:
                questions.append(_build_question(current_q, current_opts, year, session, len(questions)))
            current_q = q_match.group(2)
            current_opts = []
        elif opt_match and current_q:
            current_opts.append(f"{opt_match.group(1)}. {opt_match.group(2)}")

    if current_q and len(current_opts) >= 4:
        questions.append(_build_question(current_q, current_opts, year, session, len(questions)))

    return questions


def _build_question(text: str, opts: list, year: int, session: int, seq: int) -> dict:
    qid = f"{year}-{session}-{seq+1:03d}"
    # Map option letters A/B/C/D or 甲乙丙丁
    mapped_opts = []
    letter_map = {"甲": "A", "乙": "B", "丙": "C", "丁": "D"}
    for opt in opts[:4]:
        letter = opt[0]
        mapped = letter_map.get(letter, letter)
        mapped_opts.append(f"{mapped}. {opt[3:]}")

    return {
        "id": qid,
        "year": year,
        "session": session,
        "category": "UNKNOWN",
        "categoryName": "（待分類）",
        "question": text,
        "options": mapped_opts,
        "answer": "",         # 需人工填入答案
        "explanation": "",
        "lawRef": None,
        "source": "official",
        "_needs_review": True,  # 人工複查標記
    }


def load_existing(output_path: str) -> list:
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save(questions: list, output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"✅ 已儲存 {len(questions)} 題至 {output_path}")


def main():
    parser = argparse.ArgumentParser(description="解析職安衛考試 PDF")
    parser.add_argument("input", help="PDF 路徑或資料夾")
    parser.add_argument("--year", type=int, help="考試年份（西元）")
    parser.add_argument("--session", type=int, default=1, help="考試次別（預設1）")
    parser.add_argument("--output", default="../public/data/questions.json", help="輸出JSON路徑")
    parser.add_argument("--all", action="store_true", help="批次處理資料夾內所有PDF")
    args = parser.parse_args()

    existing = load_existing(args.output)
    new_qs = []

    if args.all or os.path.isdir(args.input):
        pdfs = list(Path(args.input).glob("*.pdf"))
        for pdf in sorted(pdfs):
            # 期望檔名格式：YYYY-N.pdf
            parts = pdf.stem.split("-")
            try:
                y, s = int(parts[0]), int(parts[1]) if len(parts) > 1 else 1
            except (ValueError, IndexError):
                print(f"⚠️  無法解析年份從檔名 {pdf.name}，請手動指定 --year")
                continue
            print(f"[解析] {pdf.name} (年份={y}, 次別={s})")
            text = extract_text(str(pdf))
            qs = parse_questions(text, y, s)
            print(f"  → 找到 {len(qs)} 題（需人工複查答案與分類）")
            new_qs.extend(qs)
    else:
        if not args.year:
            sys.exit("請指定 --year 年份")
        print(f"[解析] {args.input}")
        text = extract_text(args.input)
        qs = parse_questions(text, args.year, args.session)
        print(f"  → 找到 {len(qs)} 題")
        new_qs.extend(qs)

    # 合併，去除重複 id
    existing_ids = {q["id"] for q in existing}
    merged = existing + [q for q in new_qs if q["id"] not in existing_ids]
    save(merged, args.output)
    print(f"⚠️  提醒：解析結果需人工複查 answer 欄位及 category 分類！")


if __name__ == "__main__":
    main()
