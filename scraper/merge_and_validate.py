#!/usr/bin/env python3
"""
Step 4: Merge all parsed exam questions, validate for outdated laws,
deduplicate, and output to public/data/questions.json.

Rules:
1. DO NOT parse 221001-1.pdf (115年第1梯次 already in questions.json)
2. DO NOT include deprecated questions in output
3. Deduplicate: same question text -> keep most recent year
4. Preserve existing practice questions (source='practice') from questions.json
5. Only ADD new official questions; do not replace practice ones
"""

import json
import os
import re
import sys

# Add scraper dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from law_validator import validate_questions_list

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
PARSED_DIR = os.path.join(SCRAPER_DIR, "parsed")
REPO_ROOT = os.path.dirname(SCRAPER_DIR)
QUESTIONS_JSON = os.path.join(REPO_ROOT, "public", "data", "questions.json")
REPORT_FILE = os.path.join(SCRAPER_DIR, "validation_report.txt")


def load_existing_questions():
    """Load current questions.json."""
    with open(QUESTIONS_JSON, encoding="utf-8") as f:
        return json.load(f)


def load_parsed_questions():
    """Load all parsed JSON files from scraper/parsed/."""
    all_questions = []
    parsed_files = sorted([
        f for f in os.listdir(PARSED_DIR)
        if f.endswith(".json")
    ])

    file_stats = {}
    for fname in parsed_files:
        path = os.path.join(PARSED_DIR, fname)
        with open(path, encoding="utf-8") as f:
            questions = json.load(f)
        file_stats[fname] = len(questions)
        all_questions.extend(questions)

    return all_questions, file_stats


def normalize_question_text(text):
    """Normalize question text for deduplication comparison."""
    # Remove whitespace variations, punctuation variations
    text = re.sub(r'\s+', '', text)
    # Normalize fullwidth/halfwidth
    text = text.replace('　', '').replace(' ', '')
    return text.strip()


def deduplicate_questions(questions):
    """
    Deduplicate by question text.
    When same question appears in multiple exams, keep the most recent one.
    'Most recent' = highest year, then highest session.

    Returns: (deduped_questions, removed_count)
    """
    # Sort by year desc, session desc so most recent comes first
    def sort_key(q):
        year = q.get('year') or 0
        session = q.get('session') or 0
        # Bank questions go last (they are fallbacks)
        if q.get('source') == 'bank':
            return (0, 0)
        return (year, session)

    sorted_qs = sorted(questions, key=sort_key, reverse=True)

    seen = {}  # normalized_text -> question_id
    deduped = []
    removed = []

    for q in sorted_qs:
        norm = normalize_question_text(q.get('question', ''))
        if not norm:
            continue
        if norm not in seen:
            seen[norm] = q['id']
            deduped.append(q)
        else:
            removed.append(q)

    return deduped, removed


def merge_with_existing(existing_qs, new_official_qs):
    """
    Merge new official questions with existing questions.json.

    Strategy:
    - Keep ALL existing questions (both practice and existing official)
    - Add new official questions that don't duplicate existing ones
    - Deduplicate within new official questions first
    """
    # Build set of existing question texts
    existing_texts = set()
    for q in existing_qs:
        norm = normalize_question_text(q.get('question', ''))
        existing_texts.add(norm)

    # Filter out new questions that duplicate existing ones
    truly_new = []
    already_exists = []
    for q in new_official_qs:
        norm = normalize_question_text(q.get('question', ''))
        if norm and norm not in existing_texts:
            truly_new.append(q)
            existing_texts.add(norm)  # prevent internal duplicates too
        else:
            already_exists.append(q)

    return existing_qs + truly_new, truly_new, already_exists


def assign_final_ids(questions):
    """
    Ensure all questions have valid, unique IDs.
    For parsed questions, IDs are already like "106-1-001".
    """
    used_ids = set()
    result = []
    for q in questions:
        qid = q.get('id', '')
        if qid in used_ids:
            # Append suffix to make unique
            base = qid
            suffix = 2
            while f"{base}-v{suffix}" in used_ids:
                suffix += 1
            qid = f"{base}-v{suffix}"
            q = dict(q)
            q['id'] = qid
        used_ids.add(qid)
        result.append(q)
    return result


def clean_question_for_output(q):
    """Remove internal fields not needed in final output."""
    q = dict(q)
    # Remove validation metadata from output
    q.pop('validationIssues', None)
    # Keep flagged if it was set (non-critical warning)
    # Keep deprecated if True
    return q


def main():
    report_lines = []

    def log(msg=""):
        print(msg)
        report_lines.append(msg)

    log("=" * 70)
    log("MERGE AND VALIDATE - 職業衛生管理甲級技術士 題庫")
    log("=" * 70)
    log()

    # ── Step 1: Load parsed questions ─────────────────────────────────────────
    log("Step 1: Loading parsed exam questions...")
    parsed_qs, file_stats = load_parsed_questions()
    log(f"  Loaded {len(parsed_qs)} total questions from {len(file_stats)} files")
    log()
    log("  Per-file breakdown:")
    for fname, count in sorted(file_stats.items()):
        log(f"    {fname}: {count}")
    log()

    # ── Step 2: Law validation ─────────────────────────────────────────────────
    log("Step 2: Running law amendment validation...")

    # Split bank questions from exam questions for separate handling
    bank_qs = [q for q in parsed_qs if q.get('source') == 'bank']
    exam_qs = [q for q in parsed_qs if q.get('source') != 'bank']

    log(f"  Exam questions: {len(exam_qs)}")
    log(f"  Bank questions: {len(bank_qs)}")

    valid_exam, deprecated_exam, warnings_exam = validate_questions_list(exam_qs)
    valid_bank, deprecated_bank, warnings_bank = validate_questions_list(bank_qs)

    all_valid = valid_exam + valid_bank
    all_deprecated = deprecated_exam + deprecated_bank
    all_warnings = warnings_exam + warnings_bank

    log(f"  Valid: {len(all_valid)}")
    log(f"  Deprecated (outdated law ref): {len(all_deprecated)}")
    log(f"  With non-critical warnings: {len(all_warnings)}")
    log()

    if all_deprecated:
        log("  Deprecated questions:")
        for q in all_deprecated:
            log(f"    [{q['id']}] {q['question'][:60]}...")
            log(f"      -> {q.get('deprecationNote', '')[:100]}")
        log()

    if all_warnings:
        log(f"  Questions with warnings (first 20):")
        for w in all_warnings[:20]:
            log(f"    [{w['id']}]: {w['warnings'][0][:80]}")
        log()

    # ── Step 3: Deduplicate parsed questions ───────────────────────────────────
    log("Step 3: Deduplicating parsed questions...")
    deduped, removed_by_dedup = deduplicate_questions(all_valid)
    log(f"  Before dedup: {len(all_valid)}")
    log(f"  After dedup: {len(deduped)}")
    log(f"  Removed as duplicates: {len(removed_by_dedup)}")
    log()

    # ── Step 4: Load existing questions.json ───────────────────────────────────
    log("Step 4: Loading existing questions.json...")
    existing_qs = load_existing_questions()
    existing_official = [q for q in existing_qs if q.get('source') == 'official']
    existing_practice = [q for q in existing_qs if q.get('source') != 'official']
    log(f"  Existing total: {len(existing_qs)}")
    log(f"    Official: {len(existing_official)}")
    log(f"    Practice/other: {len(existing_practice)}")
    log()

    # ── Step 5: Merge ──────────────────────────────────────────────────────────
    log("Step 5: Merging with existing questions...")
    merged, truly_new, already_existed = merge_with_existing(existing_qs, deduped)
    log(f"  New questions added: {len(truly_new)}")
    log(f"  Already existed (skipped): {len(already_existed)}")
    log(f"  Total after merge: {len(merged)}")
    log()

    # ── Step 6: Assign unique IDs and clean ────────────────────────────────────
    log("Step 6: Finalizing question IDs...")
    merged = assign_final_ids(merged)
    merged = [clean_question_for_output(q) for q in merged]

    # ── Step 7: Stats breakdown ────────────────────────────────────────────────
    log("Step 7: Final breakdown by year/source:")
    by_year = {}
    by_source = {}
    by_category = {}
    for q in merged:
        yr = str(q.get('year', 'none'))
        by_year[yr] = by_year.get(yr, 0) + 1
        src = q.get('source', 'unknown')
        by_source[src] = by_source.get(src, 0) + 1
        cat = q.get('category', 'unknown')
        by_category[cat] = by_category.get(cat, 0) + 1

    log("  By year:")
    for yr in sorted(by_year.keys()):
        log(f"    {yr}: {by_year[yr]}")
    log()
    log("  By source:")
    for src, cnt in sorted(by_source.items()):
        log(f"    {src}: {cnt}")
    log()
    log("  By category:")
    for cat, cnt in sorted(by_category.items()):
        log(f"    {cat}: {cnt}")
    log()

    # ── Step 8: Write output ───────────────────────────────────────────────────
    log("Step 8: Writing output files...")

    # Write merged questions.json
    with open(QUESTIONS_JSON, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    log(f"  Written: {QUESTIONS_JSON}")
    log(f"  Total questions: {len(merged)}")
    log()

    # Write deprecated questions to a separate file for reference
    deprecated_path = os.path.join(PARSED_DIR, "_deprecated_questions.json")
    with open(deprecated_path, 'w', encoding='utf-8') as f:
        json.dump(all_deprecated, f, ensure_ascii=False, indent=2)
    log(f"  Deprecated questions archived: {deprecated_path}")
    log(f"  Total deprecated: {len(all_deprecated)}")
    log()

    # ── Summary ────────────────────────────────────────────────────────────────
    log("=" * 70)
    log("SUMMARY")
    log("=" * 70)
    log(f"PDFs processed: {len(file_stats)}")
    log(f"Questions extracted from PDFs: {len(parsed_qs)}")
    log(f"After law validation (deprecated removed): {len(all_valid)}")
    log(f"After deduplication: {len(deduped)}")
    log(f"New questions added to bank: {len(truly_new)}")
    log(f"Final questions.json total: {len(merged)}")
    log(f"  - Official exam questions: {by_source.get('official', 0)}")
    log(f"  - Question bank (22100_): {by_source.get('bank', 0)}")
    log(f"  - Practice questions: {by_source.get('practice', 0)}")
    log(f"Questions deprecated (outdated law): {len(all_deprecated)}")
    log(f"Questions with non-critical warnings: {len(all_warnings)}")
    log()

    # Write validation report
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write("\n".join(report_lines))
    print(f"\nValidation report saved: {REPORT_FILE}")

    return merged


if __name__ == "__main__":
    main()
