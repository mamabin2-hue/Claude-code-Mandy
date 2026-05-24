#!/usr/bin/env python3
"""
Law amendment checker for 職業衛生管理甲級技術士 exam questions.
Flags questions that reference outdated regulations.
"""

OUTDATED_LAWS = [
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
    {
        "id": "radiation-dose-limit",
        "description": "游離輻射年劑量限值誤述",
        "outdated_keywords": [
            "游離輻射20毫西弗為年劑量限值",
            "游離輻射劑量限值每年20",
            "輻射工作人員年劑量限制為20mSv",
        ],
        "valid_from": "current",
        "note": "正確：50 mSv/年為單年上限，20 mSv/年為5年平均；混淆兩者為誤",
        "category": "游離輻射防護法"
    },
    {
        "id": "workplace-violence-old-rule",
        "description": "不法侵害預防（舊版規則）",
        "outdated_keywords": [
            "第324條之3規定，雇主為預防勞工，因他人行為",
        ],
        "valid_from": "2024",
        "note": "注意：第四版指引（2025/02/21）更新，考題若引用舊版條文需確認",
        "category": "職業安全衛生設施規則",
        "warn_only": True
    },
    {
        "id": "ghs-old-version",
        "description": "GHS舊版分類（早期）",
        "outdated_keywords": [
            "危害性化學品分為16類",
            "危害性化學品共16種分類",
        ],
        "valid_from": "current",
        "note": "現行GHS（CNS15030）：3大類28危害類別；標示要素含8種危害圖示",
        "category": "危害性化學品標示及通識規則"
    },
    {
        "id": "penalty-amount-old",
        "description": "舊罰鍰金額（職安法修正前）",
        "outdated_keywords": [
            "新台幣3萬元以上15萬元以下",
            "新台幣三萬元以上十五萬元以下",
        ],
        "valid_from": "2023",
        "note": "職安法2023修正後罰鍰提高，原3~15萬部分條文已調整",
        "category": "職業安全衛生法",
        "warn_only": True
    },
    {
        "id": "maternal-protection-old",
        "description": "母性健康保護（工作禁止）舊規定",
        "outdated_keywords": [
            "妊娠中女工不得從事危險性工作",
            "妊娠女工禁止從事",
        ],
        "valid_from": "2020",
        "note": "現行職安法§30、勞工健康保護規則修正後，改為「評估調整」而非全面禁止",
        "category": "職業安全衛生法",
        "warn_only": True
    },
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
]

# Topics that are NEW (questions about them are valid/current, not deprecated)
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
    }
]


def validate_question(question_obj):
    """
    Check a question object for outdated law references.
    Returns dict with keys:
        - deprecated (bool)
        - deprecationNote (str)
        - warnings (list of str)
        - isNewTopic (bool)
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
        for kw in law["outdated_keywords"]:
            if kw in full_text:
                if law.get("warn_only"):
                    result["warnings"].append(
                        f"[注意] {law['description']}: {law['note']}"
                    )
                else:
                    result["deprecated"] = True
                    result["deprecationNote"] = (
                        f"{law['description']}已修正（{law['valid_from']}年起）。{law['note']}"
                    )
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
    Returns (valid_questions, deprecated_questions, all_warnings).
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
    import json, sys
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding="utf-8") as f:
            questions = json.load(f)
        valid, deprecated, warnings = validate_questions_list(questions)
        print(f"Total: {len(questions)}")
        print(f"Valid: {len(valid)}")
        print(f"Deprecated: {len(deprecated)}")
        print(f"With warnings: {len(warnings)}")
        for w in warnings:
            print(f"  {w['id']}: {w['warnings']}")
        for d in deprecated:
            print(f"  DEPRECATED {d['id']}: {d['deprecationNote']}")
