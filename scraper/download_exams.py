"""
下載考選部歷年「職業衛生管理甲級技術士技能檢定」試題 PDF。
使用前請先至考選部網站 (wwwq.moex.gov.tw) 手動確認各年份試題的正確 URL，
將 URL 填入下方 EXAM_URLS 字典，再執行本腳本。
"""

import requests
import os
import time

OUTPUT_DIR = "pdfs"

# 請至考選部「考畢試題查詢平臺」取得各年份試題下載連結：
# https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx
# 搜尋條件：考試名稱含「職業衛生管理」
# 填入格式：{ "YYYY-N次": "PDF下載URL" }
EXAM_URLS = {
    # 範例（請替換為實際URL）：
    # "2024-1": "https://example.moex.gov.tw/...",
    # "2023-1": "https://example.moex.gov.tw/...",
}


def download(year_key: str, url: str) -> str:
    """下載 PDF 並儲存，回傳檔案路徑。"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, f"{year_key}.pdf")
    if os.path.exists(path):
        print(f"[跳過] {year_key} 已存在")
        return path
    print(f"[下載] {year_key} ...")
    resp = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    with open(path, "wb") as f:
        f.write(resp.content)
    print(f"[完成] 儲存至 {path} ({len(resp.content)//1024} KB)")
    time.sleep(1)
    return path


if __name__ == "__main__":
    if not EXAM_URLS:
        print("請先至考選部網站取得試題 PDF URL，填入 EXAM_URLS 後再執行。")
        print("考畢試題查詢：https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx")
    else:
        for key, url in EXAM_URLS.items():
            download(key, url)
