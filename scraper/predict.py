"""
使用 Claude API 根據官方法條原文生成預測考題。

防幻覺機制：
1. 所有題目必須基於 law_changes.json 中的官方法條原文（newLaw 欄位）
2. System prompt 明確禁止 AI 補充或捏造法條內容
3. 每題輸出必須包含 lawQuote（原文引用）和 lawSource（法規名稱+條號）
4. 生成後請人工驗證法條引用正確性

用法：
  export ANTHROPIC_API_KEY="sk-ant-..."
  python predict.py --law-file ../public/data/law_changes.json --output ../public/data/ai_predictions.json
"""

import json
import os
import sys
import argparse

try:
    import anthropic
except ImportError:
    sys.exit("請先執行：pip install anthropic")

SYSTEM_PROMPT = """你是一位嚴謹的職業安全衛生考試命題專家。

【重要規則 - 防止幻覺】
1. 你只能根據使用者提供的「官方法條原文」出題，絕對不得補充、改寫或捏造任何法條內容
2. 每道題目必須附上法條原文的「直接引用」（lawQuote），必須是原文中實際存在的文字
3. 如果原文中找不到足夠的資訊出題，請說「本法條資訊不足以生成考題」，不要強行創造

【輸出格式 - JSON陣列】
[
  {
    "question": "題目（不超過80字）",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "A",
    "explanation": "解析說明（引用原文+說明為何選此答案）",
    "lawQuote": "直接引自原文的片段",
    "lawSource": "法規名稱+條號+版本（如：職業安全衛生法第22條之1（2025年12月））"
  }
]

每個法條生成 2-3 道題目，難度適中（適合技術士資格考試）。"""


def generate_predictions(law: dict, client: anthropic.Anthropic) -> list:
    law_text = f"""
法規名稱：{law['title']}
法條來源：{law.get('lawRef', '')}（{law['effectiveDate']}）

【舊法原文】
{law['oldLaw']}

【新法原文（請根據此原文出題）】
{law['newLaw']}

【修法說明】
{law.get('diffSummary', '')}
"""
    try:
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"請根據以下官方法條原文，生成2-3道選擇題：\n\n{law_text}"
            }]
        )
        raw = msg.content[0].text.strip()
        # Extract JSON from response
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start == -1 or end == 0:
            print(f"  ⚠️  無法解析 JSON 回應，跳過 {law['id']}")
            return []
        questions = json.loads(raw[start:end])
        result = []
        for i, q in enumerate(questions):
            q["id"] = f"ai-{law['id']}-{i+1:02d}"
            q["year"] = 0
            q["session"] = 0
            q["category"] = "LAW"
            q["categoryName"] = "職業安全衛生法規"
            q["lawRef"] = law.get("lawRef", "")
            q["source"] = "ai_prediction"
            q["warningLabel"] = "⚠️ AI預測題，請自行核對官方法條"
            result.append(q)
        return result
    except Exception as e:
        print(f"  ❌ 生成失敗：{e}")
        return []


def main():
    parser = argparse.ArgumentParser(description="使用 Claude API 生成預測考題（防幻覺版）")
    parser.add_argument("--law-file", default="../public/data/law_changes.json", help="修法資料路徑")
    parser.add_argument("--output", default="../public/data/ai_predictions.json", help="輸出路徑")
    parser.add_argument("--law-id", help="只處理特定修法 ID（留空則全部處理）")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("請設定環境變數 ANTHROPIC_API_KEY")

    client = anthropic.Anthropic(api_key=api_key)

    with open(args.law_file, "r", encoding="utf-8") as f:
        laws = json.load(f)

    if args.law_id:
        laws = [l for l in laws if l["id"] == args.law_id]
        if not laws:
            sys.exit(f"找不到修法 ID：{args.law_id}")

    all_predictions = []
    for law in laws:
        print(f"[生成] {law['title']}...")
        qs = generate_predictions(law, client)
        all_predictions.extend(qs)
        print(f"  → 生成 {len(qs)} 題")

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(all_predictions, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 共生成 {len(all_predictions)} 道預測題")
    print("⚠️  請人工驗證每題的 lawQuote 與官方原文是否一致！")


if __name__ == "__main__":
    main()
