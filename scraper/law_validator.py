#!/usr/bin/env python3
"""
Law amendment checker for 職業衛生管理甲級技術士 exam questions.
Flags questions that reference outdated regulations.

Usage:
    python law_validator.py <questions.json>
    from law_validator import validate_questions_list
"""

# ── Outdated law rules ─────────────────────────────────────────────────────────
# Each entry:
#   id: unique identifier
#   description: human-readable summary (Chinese)
#   outdated_keywords: list of strings; if any appears in question+options, flag it
#   warn_only: if True, flag as warning only (not deprecated); default False
#   valid_from: year when the NEW law took effect (old questions before this may be wrong)
#   note: explanation of the CURRENT correct rule
#   category: law/regulation name
OUTDATED_LAWS = [
    # ── 健康檢查頻率 ────────────────────────────────────────────────────────────
    {
        "id": "health-check-freq-pre2021",
        "description": "勞工一般健康檢查頻率（舊規定）",
        "outdated_keywords": [
            "40歲以下每5年", "未滿40歲每5年",
            "40歲以下，每五年", "未滿40歲，每五年",
            "未滿65歲每3年",
        ],
        "valid_from": "2021",
        "note": "已修正（2021年起）：未滿40歲每5年，40~65歲每3年，65歲以上每年",
        "category": "勞工健康保護規則"
    },

    # ── 游離輻射劑量限值 ─────────────────────────────────────────────────────────
    {
        "id": "radiation-dose-limit",
        "description": "游離輻射年劑量限值誤述",
        "outdated_keywords": [
            "游離輻射20毫西弗為年劑量限值",
            "游離輻射劑量限值每年20",
            "輻射工作人員年劑量限制為20mSv",
            "輻射工作人員年劑量限值20",
        ],
        "valid_from": "current",
        "note": "正確：50 mSv/年為單年上限，20 mSv/年為5年平均；混淆兩者為誤",
        "category": "游離輻射防護法"
    },

    # ── 不法侵害預防 - 舊版條文引用 ──────────────────────────────────────────────
    {
        "id": "workplace-violence-old-rule",
        "description": "不法侵害預防（舊版規則條文）",
        "outdated_keywords": [
            "第324條之3規定，雇主為預防勞工，因他人行為",
        ],
        "valid_from": "2024",
        "note": "注意：第四版指引（2025/02/21）更新，考題若引用舊版條文需確認",
        "category": "職業安全衛生設施規則",
        "warn_only": True
    },

    # ── GHS舊版分類 ──────────────────────────────────────────────────────────────
    {
        "id": "ghs-old-version",
        "description": "GHS舊版分類（早期版本）",
        "outdated_keywords": [
            "危害性化學品分為16類",
            "危害性化學品共16種分類",
        ],
        "valid_from": "current",
        "note": "現行GHS（CNS15030）：3大類28危害類別；標示要素含8種危害圖示",
        "category": "危害性化學品標示及通識規則"
    },

    # ── 職安法舊罰鍰 ──────────────────────────────────────────────────────────────
    {
        "id": "penalty-amount-old",
        "description": "舊罰鍰金額（職安法2026修正前）",
        "outdated_keywords": [
            "新台幣3萬元以上15萬元以下",
            "新台幣三萬元以上十五萬元以下",
        ],
        "valid_from": "2026",
        "note": "職安法2026修正後罰鍰提高，原3~15萬部分條文已調整，考試時注意年份",
        "category": "職業安全衛生法",
        "warn_only": True
    },

    # ── 母性健康保護 ──────────────────────────────────────────────────────────────
    {
        "id": "maternal-protection-old",
        "description": "母性健康保護（工作禁止舊規定）",
        "outdated_keywords": [
            "妊娠中女工不得從事危險性工作",
            "妊娠女工禁止從事",
        ],
        "valid_from": "2020",
        "note": "現行職安法§30、勞工健康保護規則修正後，改為「評估調整」而非全面禁止",
        "category": "職業安全衛生法",
        "warn_only": True
    },

    # ── 性別平等工作法 - 舊版被動處理 ────────────────────────────────────────────
    {
        "id": "sexual-harassment-old-passive",
        "description": "性騷擾（雇主被動處理—舊法）",
        "outdated_keywords": [
            "受僱者申訴後，雇主才應採取",
            "員工申訴後30日",
        ],
        "valid_from": "2024",
        "note": "2024/03/08施行：雇主知悉即應主動介入，不需等待申訴",
        "category": "性別平等工作法"
    },

    # ── 職業災害通報時效舊版（24小時） ───────────────────────────────────────────
    {
        "id": "accident-report-old-24h",
        "description": "職業災害通報時效舊版（24小時內）",
        "outdated_keywords": [
            "24小時內通報",
            "二十四小時內通報",
        ],
        "valid_from": "2013",
        "note": "現行職安法§37：勞動場所發生死亡職業災害，雇主應於8小時內通報勞動檢查機構",
        "category": "職業安全衛生法第37條",
        "warn_only": True  # 24hr rule was for different situations historically
    },

    # ── 新進勞工教育訓練時數舊版 ──────────────────────────────────────────────────
    {
        "id": "new-worker-training-1h-old",
        "description": "新僱勞工教育訓練時數（舊版1小時）",
        "outdated_keywords": [
            "新進勞工訓練不得少於1小時",
            "新僱勞工訓練不得少於1小時",
            "一般安全衛生教育訓練不得少於1小時",
        ],
        "valid_from": "2019",
        "note": "現行（職業安全衛生教育訓練規則§14）：一般業別新僱勞工一般安全衛生教育訓練不得少於3小時",
        "category": "職業安全衛生教育訓練規則"
    },

    # ── 作業環境監測頻率舊版 ─────────────────────────────────────────────────────
    {
        "id": "monitoring-freq-old",
        "description": "作業環境監測頻率（部分物質舊規定）",
        "outdated_keywords": [
            "鉛作業每6個月監測一次（舊）",
        ],
        "valid_from": "2020",
        "note": "勞工作業環境監測實施辦法修正後，部分物質監測頻率有調整",
        "category": "勞工作業環境監測實施辦法",
        "warn_only": True
    },
]

# ── New topics (questions about these are valid, even if they seem "new") ──────
NEW_TOPICS = [
    {
        "id": "workplace-bullying-2026",
        "description": "職場霸凌法制化",
        "keywords": ["職場霸凌", "第22條之1", "霸凌申訴"],
        "valid_from": "2026",
        "note": "職安法§22-1職場霸凌（2026年施行），考試新重點",
    },
    {
        "id": "contractor-source-safety-2026",
        "description": "業主源頭防災（2026職安法大修）",
        "keywords": ["安全衛生圖說", "交付承攬前風險評估"],
        "valid_from": "2026",
        "note": "2026職安法：業主於規劃設計階段編製安全衛生圖說",
    },
    {
        "id": "gender-equality-2024",
        "description": "性別平等工作法2024修正（主動介入）",
        "keywords": ["知悉即應", "權勢性騷擾", "性騷擾懲罰性賠償"],
        "valid_from": "2024",
        "note": "2024/03/08施行，雇主知悉性騷擾事件即應主動介入",
    },
]


def validate_question(question_obj):
    """
    Check a question object for outdated law references.

    Args:
        question_obj: dict with 'question', 'options', 'answer' keys

    Returns:
        dict with keys:
            - deprecated (bool): True if question references clearly wrong current law
            - deprecationNote (str): explanation if deprecated
            - warnings (list of str): non-fatal flags
            - isNewTopic (bool): True if question covers newly enacted law
    """
    result = {
        "deprecated": False,
        "deprecationNote": "",
        "warnings": [],
        "isNewTopic": False,
    }

    q_text = question_obj.get("question", "")
    opts_text = " ".join(question_obj.get("options", []))
    full_text = q_text + " " + opts_text

    # Check for outdated law references
    for law in OUTDATED_LAWS:
        matched_kw = None
        for kw in law["outdated_keywords"]:
            if kw in full_text:
                matched_kw = kw
                break

        if matched_kw is None:
            continue

        if law.get("warn_only"):
            result["warnings"].append(
                f"[注意] {law['description']}: {law['note']}"
            )
        else:
            result["deprecated"] = True
            result["deprecationNote"] = (
                f"{law['description']}已修正（{law['valid_from']}年起生效）。{law['note']}"
            )
        # Only flag one rule per question (most severe wins)
        if result["deprecated"]:
            break

    # Check for new topics
    for topic in NEW_TOPICS:
        for kw in topic["keywords"]:
            if kw in full_text:
                result["isNewTopic"] = True
                result["warnings"].append(
                    f"[新法題] {topic['description']}: {topic['note']}"
                )
                break

    return result


def validate_questions_list(questions):
    """
    Run validation on a list of question objects.

    Returns:
        (valid_questions, deprecated_questions, all_warnings)
        - valid_questions: list of non-deprecated questions
        - deprecated_questions: list of deprecated questions (with 'deprecated' and 'deprecationNote' added)
        - all_warnings: list of {id, warnings} dicts for questions with warnings
    """
    valid = []
    deprecated = []
    all_warnings = []

    for q in questions:
        v = validate_question(q)
        q_out = dict(q)

        if v["warnings"]:
            all_warnings.append({
                "id": q.get("id", "?"),
                "warnings": v["warnings"]
            })

        if v["deprecated"]:
            q_out["deprecated"] = True
            q_out["deprecationNote"] = v["deprecationNote"]
            deprecated.append(q_out)
        else:
            valid.append(q_out)

    return valid, deprecated, all_warnings


if __name__ == "__main__":
    import json
    import sys

    print(f"Law validator loaded: {len(OUTDATED_LAWS)} outdated law rules, {len(NEW_TOPICS)} new topic markers")
    print("\nOutdated law rules:")
    for law in OUTDATED_LAWS:
        status = "[warn only]" if law.get("warn_only") else "[deprecated]"
        print(f"  {status} [{law['id']}] {law['description']}")

    if len(sys.argv) > 1:
        print(f"\nValidating: {sys.argv[1]}")
        with open(sys.argv[1], encoding="utf-8") as f:
            questions = json.load(f)
        valid, deprecated, warnings = validate_questions_list(questions)
        print(f"Total: {len(questions)}")
        print(f"Valid: {len(valid)}")
        print(f"Deprecated: {len(deprecated)}")
        print(f"With warnings: {len(warnings)}")
        if deprecated:
            print("\nDeprecated questions:")
            for d in deprecated:
                print(f"  [{d['id']}] {d['question'][:60]}")
                print(f"    -> {d['deprecationNote'][:100]}")
        if warnings:
            print("\nWarnings:")
            for w in warnings:
                print(f"  [{w['id']}]: {w['warnings'][0][:100]}")
