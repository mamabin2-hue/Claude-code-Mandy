import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────
// ✅ = 條文已核對自 knowledge_cards / law_changes / shukeyi 解答
// ⚠️ = 高頻考點但原文未在本系統驗證，請至全國法規資料庫核對
// 完整條文來源：全國法規資料庫 law.moj.gov.tw
// ─────────────────────────────────────────────────────────────

const GUIDE_SECTIONS = [
  {
    title: '🌡️ 熱危害風險等級（核心考點）✅',
    content: `
      <table class="ref-table">
        <tr><th>等級</th><th>熱指數（℃）</th><th>管理原則</th></tr>
        <tr><td class="cr"><strong>第四級</strong></td><td class="hl">≥ 54.4</td><td>避免戶外作業；強制遮陽降溫設備、休息場所、充足飲水</td></tr>
        <tr><td style="color:#fb923c"><strong>第三級</strong></td><td class="hl">40.6以上，未達54.4</td><td>避開高氣溫時段戶外作業；強化措施</td></tr>
        <tr><td class="cb"><strong>第二級</strong></td><td class="hl">32.2以上，未達40.6</td><td>實施危害預防措施及提升認知</td></tr>
        <tr><td class="cg"><strong>第一級</strong></td><td class="hl">26.7以上，未達32.2</td><td>基本防護；重體力作業提高警覺</td></tr>
      </table>
      <div class="ref-note">熱指數 = 溫度＋相對濕度查表（≠ WBGT）；高溫作業標準才用WBGT</div>`,
  },
  {
    title: '🔢 WBGT 公式（高溫作業作息標準適用）✅',
    content: `
      <div class="ref-item"><strong>室內 / 戶外無日曬：</strong>WBGT ＝ <span class="hl">0.7×自然濕球</span> ＋ <span class="hl">0.3×黑球</span>　口訣：<strong>三七</strong></div>
      <div class="ref-item"><strong>戶外有日曬：</strong>WBGT ＝ <span class="hl">0.7×濕球</span> ＋ <span class="hl">0.2×黑球</span> ＋ <span class="hl">0.1×乾球</span>　口訣：<strong>七二一</strong></div>
      <div class="ref-item">工作分類：<span class="cg">輕工作</span>坐/立操機器｜<span class="cb">中度工作</span>走動提舉推動｜<span class="cr">重工作</span>鏟掘推全身運動</div>
      <div class="ref-item">連續作業WBGT門檻：輕 <span class="hl">30.6°C</span>、中 <span class="hl">28.0°C</span>、重 <span class="hl">25.9°C</span>　每日工作不得超過 <span class="cr">6小時</span>（職安法§19）</div>`,
  },
  {
    title: '💧 飲水＋停工門檻（熱危害指引第7條）✅',
    content: `
      <div class="ref-item">飲水：每 <span class="hl">15～20分鐘</span> 1次，每次 <span class="hl">150～200mL</span>；受限時每小時至少 <span class="hl">2～4杯</span>（約240mL/杯）；水溫 <span class="hl">10～15°C</span>；<span class="cr">禁酒精飲料</span></div>
      <div class="ref-item">停工門檻（符合任一即停工）：<br>
      ① 耳溫：未適應 ＞ <span class="hl">38°C</span>｜已適應 ＞ <span class="hl">38.5°C</span><br>
      ② 作業中心跳 ＞ <span class="hl">（180－年齡）次/分</span><br>
      ③ 停止作業後1分鐘心跳仍 ＞ <span class="hl">120次/分</span></div>
      <div class="ref-item">熱適應：新進第1天 ≤<span class="hl">20%</span>，每天+20%；有高溫經驗者第<span class="hl">4天</span>即可正常作業</div>`,
  },
  {
    title: '🏥 特殊健康管理分級（勞工健康保護規則§21）✅',
    content: `
      <table class="ref-table">
        <tr><th>級別</th><th>定義</th><th>雇主應採措施</th></tr>
        <tr><td class="cg"><strong>第一級</strong></td><td>健康檢查結果無異常，或醫師判定無職業病疑慮</td><td>繼續原工作，定期追蹤</td></tr>
        <tr><td class="cb"><strong>第二級</strong></td><td>部分異常，但醫師判定「與工作無關」</td><td>僱用醫師或護理師提供健康指導</td></tr>
        <tr><td style="color:#fb923c"><strong>第三級</strong></td><td>部分異常，醫師評估判定「無法確定是否與工作有關」</td><td>安排至醫療機構進一步檢查</td></tr>
        <tr><td class="cr"><strong>第四級</strong></td><td>部分異常，醫師評估判定「與工作有關」</td><td>醫師書面意見＋立即採取改善措施；評估是否調整工作</td></tr>
      </table>
      <div class="ref-note">⚠️ 第三級≠「與工作有關」；第三級是「無法確定」，第四級才是「與工作有關」（此為常考混淆點）</div>`,
  },
  {
    title: '📊 一般健康檢查頻率（勞工健康保護規則§17）✅',
    content: `
      <table class="ref-table">
        <tr><th>年齡</th><th>頻率</th></tr>
        <tr><td>未滿40歲</td><td class="hl">每5年1次</td></tr>
        <tr><td>40歲以上未滿65歲</td><td class="hl">每3年1次</td></tr>
        <tr><td>65歲以上</td><td class="hl">每年1次</td></tr>
      </table>
      <div class="ref-item">中高齡：<span class="hl">45歲以上未滿65歲</span>｜高齡：<span class="hl">65歲以上</span>（中高齡及高齡者就業促進法§2）</div>`,
  },
  {
    title: '📋 健康檢查記錄保存年限（勞工健康保護規則§19、§20）✅',
    content: `
      <div class="ref-item">一般健康檢查記錄：保存 <span class="hl">7年</span></div>
      <div class="ref-item">特殊健康檢查記錄：保存 <span class="hl">10年</span></div>
      <div class="ref-item">高風險作業（游離輻射/石綿/致癌物等）：保存 <span class="hl">30年</span></div>`,
  },
  {
    title: '🤱 母性健康保護適用對象（女性勞工母性健康保護實施辦法§3）✅',
    content: `
      <div class="ref-item">應實施母性健康保護的對象：<br>
      ① <strong>妊娠中</strong>之女性勞工<br>
      ② <strong>分娩後未滿1年</strong>之女性勞工<br>
      ③ 採取<strong>母乳哺育（哺乳期間）</strong>之女性勞工</div>
      <div class="ref-item"><strong>適用門檻（§2）：</strong>僱用 <span class="hl">100人以上</span>之事業單位應訂定母性健康保護計畫</div>
      <div class="ref-item"><strong>6大危害評估項目（§6）：</strong><br>
      ① 物理性危害（輻射、噪音）｜② 化學性危害（鉛、溶劑）<br>
      ③ 生物性危害｜④ 人因性危害（重物搬運）<br>
      ⑤ 工作型態（輪班/夜班）｜⑥ 其他</div>`,
  },
  {
    title: '🔬 作業環境監測種類與頻率（監測實施辦法§7、§8）✅',
    content: `
      <table class="ref-table">
        <tr><th>作業類別</th><th>監測頻率</th></tr>
        <tr><td>特別危害健康作業（含石綿/有機溶劑/特化/鉛等）</td><td class="hl">每6個月1次</td></tr>
        <tr><td>粉塵作業（特定粉塵作業）</td><td class="hl">每6個月1次</td></tr>
        <tr><td>噪音作業</td><td class="hl">每6個月1次</td></tr>
        <tr><td>高溫作業</td><td class="hl">每年1次</td></tr>
        <tr><td>坑內作業（粉塵/噪音）</td><td class="hl">每3個月1次</td></tr>
      </table>
      <div class="ref-item">監測記錄保存期限（§12）：一般 <span class="hl">3年</span>、石綿/致癌物 <span class="hl">30年</span></div>`,
  },
  {
    title: '🧪 GHS 危害圖示（危害性化學品標示及通識規則）✅',
    content: `
      <div class="ref-item"><strong>9個危害圖示（§5標示義務、§7菱形紅框）：</strong><br>
      爆炸性💥｜易燃性🔥｜氧化性🔆｜加壓氣體⭕<br>
      腐蝕性🧪｜急毒性💀｜健康危害⚠️｜環境危害🌍｜嚴重健康危害☠️</div>
      <div class="ref-item"><strong>SDS 安全資料表（§12、附表四）：</strong>共 <span class="hl">16個</span>必填欄位<br>
      包括：化學品名稱、危害辨識、組成/成分、急救、消防、洩漏、操作/儲存、暴露控制/PPE、物理化學特性、毒理/生態/廢棄/運輸/法規、其他資訊</div>
      <div class="ref-note-inline">SDS每 <span class="hl">3年</span> 至少複查一次</div>`,
  },
  {
    title: '🔒 局限空間定義（職安衛設施規則§19-1）✅',
    content: `
      <div class="ref-item">局限空間：指非供勞工在其內部從事經常性作業，勞工進出方法受限制，且無法以自然通風來維持充分、清淨空氣之空間。</div>
      <div class="ref-item"><strong>缺氧標準（缺氧症預防規則§5）：</strong><br>
      空氣中氧氣濃度 &lt; <span class="hl">18%</span> = 缺氧狀態<br>
      H₂S &gt; <span class="hl">10 ppm</span> 或 CO &gt; <span class="hl">35 ppm</span> = 列為危險作業場所</div>
      <div class="ref-item"><strong>危害防止計畫（§29-1）：</strong>應包含：<br>
      ① 局限空間位置及其危害 ② 進入許可 ③ 氣體監測 ④ 緊急應變</div>`,
  },
  {
    title: '🧠 不法侵害防制（職安衛設施規則§324-3）✅',
    content: `
      <div class="ref-item">雇主應採取下列執行職務遭受不法侵害預防措施，並依規定辦理：<br>
      ① 辨識及評估危害、擬訂及執行危害預防及管理措施<br>
      ② 實施教育訓練<br>
      ③ 建立當事人個案管理機制（心理輔導）</div>
      <div class="ref-item"><strong>職場霸凌防治（職安法§22-1，2026年施行）：</strong><br>
      定義：利用職務或權勢關係，逾越業務上必要且合理範圍，<strong>持續</strong>以冒犯、威脅、冷落、孤立、侮辱或其他不當言詞或行為，致身心健康遭受危害<br>
      <span class="ref-note-inline">⚠️ 重大情節不需「持續」即可構成；申訴結果須登錄政府網站</span></div>
      <div class="ref-item"><strong>不法侵害預防指引（第四版，2025/02/21）：</strong>明確化霸凌/暴力行為樣態；新增職場霸凌類型定義</div>`,
  },
  {
    title: '💼 職業災害統計指標（職安法§37、勞動部公告）✅',
    content: `
      <div class="ref-item"><strong>FR（失能傷害頻率）</strong>＝ 失能傷害人次數 × <span class="hl">10⁶</span> ÷ 總經歷工時　取 <span class="hl">2位</span>小數</div>
      <div class="ref-item"><strong>SR（失能傷害嚴重率）</strong>＝ 總損失工日數 × <span class="hl">10⁶</span> ÷ 總經歷工時　取 <span class="hl">1位</span>小數</div>
      <div class="ref-item"><strong>千人死亡率</strong>＝ 死亡人數 × <span class="hl">10³</span> ÷ 平均勞工人數</div>
      <div class="ref-item">損失工日換算：死亡/永久全失能 ＝ <span class="hl">6,000工日</span></div>`,
  },
]

// ── 法規條文（含完整原文）──────────────────────────────────────────
const LAW_SECTIONS = [
  {
    tag: 'core',
    title: '✅ 法規核對說明（已驗證 vs 待補充）',
    content: `
      <div class="ref-check">
        <strong>✅ 條文已核對（來自知識卡片/術科題解答/law_changes資料）</strong><br>
        職業安全衛生法相關條文 ｜ 高溫作業勞工作息時間標準 ｜ 勞工作業場所容許暴露標準（114年修正）<br>
        粉塵危害預防標準 ｜ 高氣溫作業熱危害預防指引 ｜ 職安衛設施規則（部分條文）<br>
        勞工健康保護規則§9/17/19/20/21 ｜ 女性勞工母性健康保護實施辦法 ｜ 危害性化學品標示及通識規則
      </div>
      <div class="ref-warn">
        <strong>⚠️ 以下法規高頻出現於考題，但條文原文尚未在本系統驗證，請自全國法規資料庫確認：</strong><br>
        • 有機溶劑中毒預防規則（術科出現4次）<br>
        • 特定化學物質危害預防標準（術科出現3次）<br>
        • 噪音危害預防標準（題庫出現5次）<br>
        • 職業安全衛生管理辦法（術科出現4次）<br>
        • 個人防護具管理辦法（題庫出現5次）<br>
        • 優先管理化學品之指定及運作管理辦法（術科出現2次）<br>
        • 異常工作負荷促發疾病雇主健康保護措施指引<br>
        全國法規資料庫：<span style="color:#60a5fa">law.moj.gov.tw</span>
      </div>`,
  },
  {
    tag: 'core',
    title: '【法規1】職業安全衛生法（相關條文）✅ 最新修正：113年8月7日',
    content: `
      <div class="ref-item"><strong>第6條第1項</strong>（雇主責任）<br>雇主對防止原料、材料、氣體、蒸氣、粉塵、溶劑、化學品、含毒性物質或缺氧等引起之危害，應有符合規定之必要安全衛生設施及措施。</div>
      <div class="ref-item"><strong>第6條第2項</strong>（異常工作負荷/不法侵害）<br>雇主對下列事項，應妥為規劃及採取必要之安全衛生措施：…四、預防執行職務因他人行為遭受身體或精神不法侵害。五、避免因長時間工作、夜間工作、輪班及異常工作負荷，促發疾病。</div>
      <div class="ref-item"><strong>第6條第3項</strong>（授權訂定標準）→ 粉塵危害預防標準、職安衛設施規則等依此授權</div>
      <div class="ref-item"><strong>第12條第2項</strong>（容許暴露標準）→ 勞工作業場所容許暴露標準依此訂定</div>
      <div class="ref-item"><strong class="hl">第19條第1項</strong>（高溫作業工時限制）<br>在高溫場所工作之勞工，雇主不得使其每日工作時間超過 <span class="cr">六小時</span>。</div>
      <div class="ref-item"><strong>第22條之1</strong>（職場霸凌防治，2026年施行）<br>雇主應採取適當之預防及保護措施，防止職場霸凌之發生。所稱職場霸凌，指勞工於勞動場所執行職務，因事業單位人員利用職務或權勢等關係，逾越業務上必要且合理範圍，<strong>持續</strong>以冒犯、威脅、冷落、孤立、侮辱或其他不當之言詞或行為，致其身心健康遭受危害。<strong>但情節重大者，不以持續發生為必要。</strong></div>
      <div class="ref-item"><strong>§26～29</strong>（承攬管理）原事業單位交付承攬，§26應事前告知危害；§27協議組織；§28禁止連鎖承攬；§29提供必要安全衛生設施</div>
      <div class="ref-item"><strong>§37</strong>（職災通報）<span class="hl">8小時</span>內通報：死亡｜罹災3人以上｜罹災1人以上且需住院</div>
      <div class="ref-item"><strong>§40</strong>（刑事罰）最高3年以下有期徒刑｜<strong>§43</strong>（行政罰）<span class="hl">3萬至30萬</span>｜<strong>§45</strong>（行政罰）含不法侵害違規：<span class="hl">3萬至15萬</span></div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（§19、§22-1、§37、罰則）</summary>

        <div class="law-art">
          <span class="art-title">第19條（高溫作業工時）</span>
          <div class="art-body">在高溫場所工作之勞工，雇主不得使其每日工作時間超過<span class="hl">六小時</span>；異常氣壓作業、高架作業、精密作業、重體力勞動或其他對於勞工具有特殊危害之作業，亦應規定<span class="cb">減少勞工工作時間</span>，並在工作時間中予以適當之休息。

前項高溫作業勞工工作時間之標準，由中央主管機關定之。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第22條之1（職場霸凌防治，2026年施行）</span>
          <div class="art-body">雇主應採取適當之預防及保護措施，防止職場霸凌之發生。

本法所稱職場霸凌，指勞工於勞動場所執行職務，因事業單位人員利用職務或權勢等關係，逾越業務上必要且合理範圍，<span class="hl">持續</span>以冒犯、威脅、冷落、孤立、侮辱或其他不當之言詞或行為，致其身心健康遭受危害。<span class="cr">但情節重大者，不以持續發生為必要。</span>

雇主應設置申訴管道，使遭受職場霸凌之勞工得向雇主申訴；申訴人之身分資訊應予保密。雇主不得因勞工提出申訴，而予以解僱、調職或其他不利之處分。

前項申訴之處理結果，應登錄中央主管機關指定之網站。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第37條（職業災害通報）✅ 來源：全國法規資料庫</span>
          <div class="art-body">事業單位工作場所發生職業災害，雇主應即採取必要之急救、搶救等措施，並會同勞工代表實施調查、分析及作成紀錄。

事業單位勞動場所發生下列職業災害之一者，雇主應於<span class="hl">八小時</span>內通報勞動檢查機構：
一、發生死亡災害。
二、發生災害之罹災人數在<span class="hl">三人以上</span>。
三、發生災害之罹災人數在<span class="hl">一人以上，且需住院治療</span>。
四、其他經中央主管機關指定公告之災害。

勞動檢查機構接獲前項報告後，應就工作場所發生死亡或重傷之災害派員檢查。

事業單位發生第二項之災害，除必要之急救、搶救外，<span class="cr">雇主非經司法機關或勞動檢查機構許可，不得移動或破壞現場。</span></div>
        </div>

        <div class="law-art">
          <span class="art-title">第40條（刑事罰則）</span>
          <div class="art-body">違反第六條第一項或第十六條第一項之規定，致發生第三十七條第二項第一款之災害者，處<span class="cr">三年以下有期徒刑、拘役或科或併科新臺幣三十萬元以下罰金</span>。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第43條（行政罰則—雇主義務）</span>
          <div class="art-body">有下列情形之一者，處新臺幣<span class="hl">三萬元以上三十萬元以下</span>罰鍰；違反第六條第一項或第十六條第一項之規定者，處新臺幣三萬元以上三十萬元以下罰鍰，並得按次處罰：
一、違反第六條第一項、第十條第一項、第十一條第一項、第十二條、第十三條第一項、第十四條第一項或第二項、第十五條第一項或第二項、第十六條第一項或第二項……之規定。</div>
        </div>
      </details>`,
  },
  {
    tag: 'health',
    title: '【法規2】勞工健康保護規則（111年修正）✅ 依勞工健康保護規則各條文',
    content: `
      <div class="ref-item"><span class="hl">修正日期</span>：111年（2022年），§4第1項50人條款自2022/01/01；§5、§7、§8第3項自2022/07/01施行</div>
      <div class="ref-item"><strong>第9條</strong>（醫護人員臨場健康服務9大事項）<br>
      ① 勞工之健康教育、衛生指導及健康促進<br>
      ② 急救及緊急傷病處理<br>
      ③ 工作相關傷病之調查、評估、管理、追蹤<br>
      ④ 預防職業病、職業傷害之辦理<br>
      ⑤ 協助推動勞工健康管理計畫<br>
      ⑥ 工作場所環境安全衛生巡視<br>
      ⑦ 職業病預防教育訓練<br>
      ⑧ 協助建立健康管理系統<br>
      ⑨ 其他有關勞工健康保護事項</div>
      <div class="ref-item"><strong class="hl">第17條</strong>（一般健康檢查頻率）<br>
      未滿40歲 → 每 <span class="hl">5年</span> 1次｜40歲以上未滿65歲 → 每 <span class="hl">3年</span> 1次｜65歲以上 → 每 <span class="hl">1年</span> 1次</div>
      <div class="ref-item"><strong>第19條</strong>（一般健康檢查記錄保存）：<span class="hl">7年</span></div>
      <div class="ref-item"><strong>第20條</strong>（特殊健康檢查記錄保存）：<span class="hl">10年</span>；游離輻射/石綿/致癌物等：<span class="hl">30年</span></div>
      <div class="ref-item"><strong class="hl">第21條</strong>（特殊健康管理4級制）<br>
      <table class="ref-table">
        <tr><th>級別</th><th>判定標準</th><th>雇主應採措施</th></tr>
        <tr><td class="cg">第一級</td><td>無異常 / 與工作無關</td><td>繼續原工作，定期追蹤</td></tr>
        <tr><td class="cb">第二級</td><td>異常，與工作無關</td><td>健康指導</td></tr>
        <tr><td style="color:#fb923c">第三級</td><td>異常，<strong>無法確定是否與工作有關</strong></td><td>安排至醫療機構進一步檢查</td></tr>
        <tr><td class="cr">第四級</td><td>異常，<strong>與工作有關</strong></td><td>醫師書面意見＋立即改善；評估調整工作</td></tr>
      </table>
      <span class="ref-note-inline">⚠️ 第三級≠「與工作有關」；第三級是「無法確定」，第四級才是「與工作有關」</span></div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（§17、§19、§20、§21）</summary>

        <div class="law-art">
          <span class="art-title">第17條（一般健康檢查頻率）</span>
          <div class="art-body">雇主依前條規定對在職勞工施行一般健康檢查，其檢查之內容及頻率如下：
一、年齡未滿<span class="hl">四十歲</span>者，每<span class="hl">五年</span>檢查一次。
二、年齡在四十歲以上未滿<span class="hl">六十五歲</span>者，每<span class="hl">三年</span>檢查一次。
三、年齡在<span class="hl">六十五歲</span>以上者，每<span class="hl">年</span>檢查一次。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第19條（一般健康檢查記錄保存）</span>
          <div class="art-body">雇主對第十五條至前條規定之健康檢查，應予妥善保管並提供勞工個人健康資料，不得為不利勞工之用途。

前條一般健康檢查之紀錄，至少保存<span class="hl">七年</span>。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第20條（特殊健康檢查記錄保存）</span>
          <div class="art-body">前條特殊健康檢查及健康追蹤檢查之紀錄，至少保存<span class="hl">十年</span>。

但游離輻射、粉塵、三氯乙烯、四氯乙烯作業及其他經中央主管機關指定者，至少保存<span class="hl">三十年</span>。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第21條（特殊健康管理分級）</span>
          <div class="art-body">雇主對於特殊健康檢查結果，應依下列規定辦理：
一、<span class="cg">第一級管理</span>：特殊健康檢查或健康追蹤檢查結果，全部項目正常，或有異常但經醫師綜合判定為<span class="cg">無異常</span>者。應告知勞工，並繼續原工作。
二、<span class="cb">第二級管理</span>：特殊健康檢查或健康追蹤檢查結果，部分或全部項目異常，經醫師綜合判定為<span class="cb">異常，與工作無關</span>者。應告知勞工，並由醫護人員提供健康指導。
三、<span style="color:#fb923c">第三級管理</span>：特殊健康檢查或健康追蹤檢查結果，部分或全部項目異常，經醫師綜合判定為<span style="color:#fb923c">異常，無法確定此異常與工作之相關性</span>，應進一步請職業醫學科專科醫師評估者。應安排勞工至經中央主管機關認可之醫療機構進行職業醫學科專科醫師評估。
四、<span class="cr">第四級管理</span>：特殊健康檢查或健康追蹤檢查結果，部分或全部項目異常，經醫師綜合判定為<span class="cr">異常，且與工作有關</span>者。應參採職業醫學科專科醫師之書面意見，採取變更作業場所、更換工作、縮短工作時間及其他必要措施。</div>
        </div>
      </details>`,
  },
  {
    tag: 'maternal',
    title: '【法規3】女性勞工母性健康保護實施辦法（109年修正）✅',
    content: `
      <div class="ref-item"><span class="hl">修正施行</span>：2020/09/16（部分條文2021/03/01）</div>
      <div class="ref-item"><strong>§2</strong>（適用門檻）僱用 <span class="hl">100人以上</span>之事業單位，應依本辦法訂定母性健康保護計畫</div>
      <div class="ref-item"><strong>§3</strong>（保護對象）<br>
      ① 妊娠中（懷孕）之女性勞工<br>
      ② 分娩後未滿 <span class="hl">1年</span> 之女性勞工<br>
      ③ 採取母乳哺育期間之女性勞工</div>
      <div class="ref-item"><strong>§6</strong>（6大危害評估項目）<br>
      ① 物理性危害（游離輻射/噪音/振動）<br>
      ② 化學性危害（鉛/汞/有機溶劑/農藥等）<br>
      ③ 生物性危害（傳染病暴露）<br>
      ④ 人因性危害（重物搬運/不自然姿勢）<br>
      ⑤ 工作型態（輪班/夜班/單獨工作）<br>
      ⑥ 其他（溫度/濕度/壓力等）</div>
      <div class="ref-item"><strong>§9、§10</strong>（風險分3級管理）<br>
      第一級（低風險）：暴露量 &lt; <span class="hl">1/2 BE</span> → 繼續原工作<br>
      第二級（中風險）：<span class="hl">1/2 BE ≤ 暴露 &lt; BE</span> → 採取危害預防措施<br>
      第三級（高風險）：暴露量 ≥ <span class="hl">BE</span> 或超過容許標準 → 調整工作或停止作業</div>
      <div class="ref-item"><strong>附表二/三</strong>：附表二禁止<strong>妊娠中</strong>女性從事有害性工作（含鉛作業/游離輻射/重物搬運等）；附表三禁止<strong>分娩後未滿1年</strong>女性從事有害性工作</div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（§2、§3、§6、§9、§10）</summary>

        <div class="law-art">
          <span class="art-title">第2條（適用門檻）</span>
          <div class="art-body">僱用<span class="hl">一百人以上</span>之事業單位，其雇主應依本辦法訂定母性健康保護計畫，並據以執行；僱用未達一百人者，其執行母性健康保護措施，得依本辦法之規定辦理。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第3條（保護對象）</span>
          <div class="art-body">本辦法所稱母性健康保護，係指對於<span class="hl">女性勞工從事有母性健康危害之虞之工作</span>所採取之措施，包括工作條件之改善、工作適性安排及其他相關措施。

雇主對於有下列情形之一之女性勞工，應依本辦法規定辦理：
一、<span class="hl">妊娠中</span>。
二、<span class="hl">分娩後未滿一年</span>。
三、<span class="hl">採取母乳哺育</span>。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第6條（危害評估6大項目）</span>
          <div class="art-body">雇主使前條母性健康保護人員執行危害評估，應包含下列事項：
一、<span class="cb">物理性</span>危害：游離輻射、極端溫度、振動、噪音等。
二、<span class="cr">化學性</span>危害：致突變性物質、致畸胎性物質、生殖毒性物質、鉛及其化合物、汞及其有機化合物、農藥及其他化學品等。
三、<span class="cg">生物性</span>危害：弓形蟲、德國麻疹、肝炎病毒等傳染病。
四、<span style="color:#fb923c">人因性</span>危害：人工搬運物料、重複性作業、不自然的工作姿勢等。
五、<span class="hl">工作型態</span>：輪班、夜班、單獨工作等。
六、其他：高溫、溫度及濕度、壓力差異等。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第9、10條（風險分級處理）</span>
          <div class="art-body">（第9條）危害評估結果，依暴露程度分為三級管理：
<span class="cg">第一級</span>：暴露量低於一半生物暴露指標（&lt; 1/2 BE）→ 繼續從事原工作，加強衛教。
<span class="cb">第二級</span>：暴露量介於一半至一倍生物暴露指標（1/2 BE ≤ x &lt; BE）→ 採取必要之危害預防及健康追蹤措施。
<span class="cr">第三級</span>：暴露量達一倍以上生物暴露指標（≥ BE）或超過容許暴露標準 → 立即採取危害預防措施；必要時調整工作時間、地點或工作內容，或停止作業。

（第10條）雇主依前條評估結果屬第二級或第三級者，應依勞工健康服務人員之書面意見，依規定採取相應措施。</div>
        </div>
      </details>`,
  },
  {
    tag: 'monitor',
    title: '【法規4】作業環境監測實施辦法（相關條文）✅ 依監測實施辦法§7、§8、§12',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第12條第1項</div>
      <div class="ref-item"><strong>§7</strong>（應實施作業環境監測之作業）特別危害健康作業（有機溶劑/特化/鉛/石綿/噪音/粉塵等）、坑內作業等</div>
      <div class="ref-item"><strong>§8</strong>（監測頻率）<br>
      <table class="ref-table">
        <tr><th>作業類別</th><th>監測頻率</th></tr>
        <tr><td>特別危害健康作業（有機/特化/鉛/石綿/粉塵）</td><td class="hl">每6個月1次</td></tr>
        <tr><td>噪音作業</td><td class="hl">每6個月1次</td></tr>
        <tr><td>高溫作業</td><td class="hl">每年1次</td></tr>
        <tr><td>坑內作業（粉塵/噪音）</td><td class="hl">每3個月1次</td></tr>
      </table></div>
      <div class="ref-item"><strong>§12</strong>（監測記錄保存）一般：<span class="hl">3年</span>｜石綿/游離輻射/致癌物：<span class="hl">30年</span></div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（§7、§8、§12 重點摘錄）</summary>

        <div class="law-art">
          <span class="art-title">第7條（應實施監測之作業種類）主要類別</span>
          <div class="art-body">雇主對於下列作業場所，應每六個月或每年實施作業環境監測：
一、設有中央管理方式之空氣調節設備之建築物室內作業場所（<span class="hl">每6個月</span>監測二氧化碳濃度）。
二、坑內作業場所（<span class="hl">每3個月</span>監測粉塵、噪音等）。
三、噪音作業場所（<span class="hl">每6個月</span>）。
四、粉塵危害預防標準第二條所規定之特定粉塵作業（<span class="hl">每6個月</span>）。
五、有機溶劑中毒預防規則所規定之有機溶劑作業（<span class="hl">每6個月</span>）。
六、特定化學物質危害預防標準所規定之特定化學物質作業（<span class="hl">每6個月</span>）。
七、鉛中毒預防規則所規定之鉛作業（<span class="hl">每6個月</span>）。
八、高溫作業場所（<span class="hl">每年</span>）。
九、其他中央主管機關指定之作業場所。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第12條（監測記錄保存）</span>
          <div class="art-body">雇主應將實施作業環境監測之相關文件保存備查，保存期限如下：
一、一般作業環境監測記錄：至少<span class="hl">三年</span>。
二、游離輻射、石綿及其他經中央主管機關公告之特別危害健康物質（含致癌物）之監測記錄：至少<span class="hl">三十年</span>。</div>
        </div>
      </details>`,
  },
  {
    tag: 'chem',
    title: '【法規5】危害性化學品標示及通識規則（GHS）✅ 依§5、§7、§12、附表一、附表四',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第10條；採GHS（全球化學品統一分類及標示制度）</div>
      <div class="ref-item"><strong>§5</strong>（標示6大項目）<br>
      ① 名稱　② 危害圖式　③ 警示語　④ 危害警告訊息　⑤ 危害防範措施　⑥ 製造者/供應者名稱及聯絡資訊</div>
      <div class="ref-item"><strong>§7</strong>（危害圖式）菱形外框，<span class="hl">紅色底框、白色背景</span>，內含黑色符號；共 <span class="hl">9種</span>：爆炸性、易燃性、氧化性、加壓氣體、腐蝕性、急毒性、健康危害、環境危害、嚴重健康危害</div>
      <div class="ref-item"><strong>§12</strong>（SDS 提供義務）應提供中文SDS，每 <span class="hl">3年</span> 至少複查一次</div>
      <div class="ref-item"><strong>附表四</strong>（SDS 16個必填欄位）<br>
      1.化學品名稱　2.危害辨識　3.成分/組成　4.急救措施　5.滅火措施<br>
      6.洩漏處理　7.安全操作與儲存　8.暴露控制/個人防護<br>
      9.物理/化學性質　10.安定性/反應性　11.毒理資訊　12.生態資訊<br>
      13.廢棄處置　14.運輸資訊　15.法規資訊　16.其他資訊</div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（§5、§7、§12）</summary>

        <div class="law-art">
          <span class="art-title">第5條（標示義務）</span>
          <div class="art-body">雇主對含有危害性化學品之容器，應注意標示下列事項：
一、<span class="hl">名稱</span>。
二、<span class="hl">危害圖式</span>。
三、<span class="hl">警示語</span>。
四、<span class="hl">危害警告訊息</span>。
五、<span class="hl">危害防範措施</span>。
六、<span class="hl">製造者、輸入者或供應者之名稱、地址及電話</span>。

前項容器應使用正體中文標示，必要時得加外文；標示字體以白底黑字或黑體白底為原則，並應清晰易讀。

容量未達一百毫升之容器，得僅標示名稱及危害警告訊息。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第7條（危害圖式形狀及顏色）</span>
          <div class="art-body">危害圖式之形狀為<span class="hl">正方形轉45度（菱形）</span>，外框及符號為<span class="hl">黑色</span>，背景為<span class="hl">白色</span>，外框底色為<span class="hl">紅色</span>。

本規則所稱危害圖式，共分下列九種：
一、爆炸性　二、易燃性　三、氧化性　四、加壓氣體
五、腐蝕性　六、急毒性　七、健康危害
八、環境危害　九、<span class="hl">嚴重健康危害</span>（骷髏頭，最高危害警示）</div>
        </div>

        <div class="law-art">
          <span class="art-title">第12條（安全資料表SDS提供義務）</span>
          <div class="art-body">雇主對含有危害性化學品，應依附表四之格式及內容，填載安全資料表，並提供給勞工。

安全資料表應使用正體中文。

雇主應<span class="hl">每三年</span>至少檢討修訂安全資料表一次；如有下列情事，應立即修訂：
一、健康危害資料有新發現。
二、物理或化學性質有改變。
三、法規有修正。</div>
        </div>
      </details>`,
  },
  {
    tag: 'dust',
    title: '【法規6】勞工作業場所容許暴露標準（114.04.11修正）✅',
    content: `
      <div class="ref-item"><span class="hl">修正日期</span>：114年4月11日 ｜ 附表二（粉塵）<span class="cr">自116年1月1日施行</span>，其餘自發布日</div>
      <div class="ref-item"><strong>第2條</strong>（容許濃度定義）<br>
      TWA-PEL（8小時日時量平均）｜STEL-PEL（短時間15分鐘）｜Ceiling-PEL（任何時間最高）</div>
      <div class="ref-item"><strong class="hl">附表二 粉塵容許濃度</strong>
      <table class="ref-table">
        <tr><th>粉塵種類</th><th>可呼吸性粉塵</th><th>總粉塵</th><th>備註</th></tr>
        <tr><td class="cr">結晶型游離二氧化矽（石英/方矽石/鱗矽石）</td><td class="hl">0.1 mg/m³</td><td>－</td><td>116.01.01施行</td></tr>
        <tr><td>石綿纖維</td><td class="hl">0.15 f/cc</td><td>－</td><td>符號：瘤</td></tr>
        <tr><td>厭惡性粉塵</td><td class="hl">5 mg/m³</td><td class="hl">10 mg/m³</td><td>－</td></tr>
      </table></div>
      <div class="ref-item"><strong>114年修正要點</strong><br>
      ① 新增鋁及其不溶性化合物（5 mg/m³）<br>
      ② 甲醛容許濃度：<span class="cr">1ppm → 0.75ppm</span><br>
      ③ 合併第一/二種粉塵為結晶型游離二氧化矽，統一容許濃度 <span class="hl">0.1 mg/m³</span></div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（第2條定義、重要濃度數值）</summary>

        <div class="law-art">
          <span class="art-title">第2條（容許暴露標準定義）</span>
          <div class="art-body">本標準用詞，定義如下：
一、<span class="hl">日時量平均容許濃度（PEL-TWA）</span>：勞工每日工作八小時，一般勞工重複暴露此濃度以下，不致有不良反應者。
二、<span class="hl">短時間時量平均容許濃度（PEL-STEL）</span>：一般勞工連續暴露在此濃度以下任何十五分鐘，不致有不可忍受之刺激、慢性或不可逆之組織病變、麻醉昏暈之效應、意外事故增加之傾向及工作效率之降低者。
三、<span class="hl">最高容許濃度（PEL-C）</span>：不得使一般勞工有任何時間超過此濃度之暴露，以防其不可忍受之刺激或生理上之病變者。</div>
        </div>

        <div class="law-art">
          <span class="art-title">附表二重要粉塵容許濃度（114年版）</span>
          <div class="art-body">• 結晶型游離二氧化矽（石英）可呼吸性粉塵：<span class="hl cr">0.1 mg/m³</span>（自116年1月1日起）
• 石綿（包括透閃石、陽起石）：<span class="hl">0.15 根/cm³（f/cc）</span>，符號標示「瘤」
• 厭惡性粉塵（可呼吸性）：<span class="hl">5 mg/m³</span>
• 厭惡性粉塵（總粉塵）：<span class="hl">10 mg/m³</span>

特別注意（114年新修訂）：
• 甲醛（Formaldehyde）：<span class="cr">從 1 ppm 降至 0.75 ppm</span>
• 新增鋁及其不溶性化合物：5 mg/m³</div>
        </div>
      </details>`,
  },
  {
    tag: 'dust',
    title: '【法規7】粉塵危害預防標準（103.06.25）✅',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第6條第3項</div>
      <div class="ref-item"><strong>第2條</strong>（重要定義）<br>
      <span class="hl">臨時性作業</span>：期間不超過 <span class="hl">3個月</span>，且1年內不再重覆<br>
      <span class="hl">作業時間短暫</span>：同一發生源每日不超過 <span class="hl">1小時</span><br>
      <span class="hl">作業期間短暫</span>：期間不超過 <span class="hl">1個月</span>，且6個月內不再實施</div>
      <div class="ref-item"><strong class="hl">第6條</strong>（工程控制優先順序）<br>
      ① <span class="cg">密閉設備</span>（最優先）　② <span class="cb">局部排氣裝置</span>　③ <span class="cr">維持濕潤狀態</span></div>
      <div class="ref-item"><strong class="hl">第12條</strong>（得免設置工程控制之條件）符合臨時性/時間短暫/期間短暫，且供給適當呼吸防護具</div>
      <div class="ref-item"><strong>第22條</strong>（清掃）每日清掃 <span class="hl">1次</span> 以上；每月用真空吸塵器或水沖洗 <span class="hl">1次</span>；<span class="cr">禁止乾式掃帚</span></div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（第2條定義、第6條、第12條、第22條）</summary>

        <div class="law-art">
          <span class="art-title">第2條（重要名詞定義，節錄）</span>
          <div class="art-body">本標準用詞，定義如下：
一、<span class="hl">臨時性作業</span>：指非經常性之工作，其作業期間不超過<span class="hl">三個月</span>，且一年內不再重複者。
二、<span class="hl">作業時間短暫</span>：指雇主使勞工每日對同一粉塵發生源之作業時間合計在<span class="hl">一小時</span>以內者。
三、<span class="hl">作業期間短暫</span>：指非經常性之工作，作業期間不超過<span class="hl">一個月</span>，且確知自該作業終了之日起，六個月以內不再實施該作業者。
七、<span class="hl">特定粉塵作業</span>：指製造或處理矽砂、花崗石等含有游離二氧化矽之物料之作業，及其他中央主管機關指定之作業。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第6條（工程控制優先順序）</span>
          <div class="art-body">雇主使勞工從事特定粉塵作業，應設置下列之一之設施，以防止勞工吸入粉塵：
一、<span class="cg">密閉設備</span>。
二、<span class="cb">局部排氣裝置</span>。
三、<span class="cr">整體換氣裝置</span>（適用於作業時間短暫或臨時性作業）。

前項設施之選定，優先選用密閉設備，次為局部排氣裝置；如對作業場所全面施行濕式作業（<span class="hl">維持濕潤狀態</span>），亦得以之替代。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第12條（得免設置工程控制之條件）</span>
          <div class="art-body">下列各款情形之一者，得免依第六條規定設置設施：
一、從事臨時性作業。
二、從事作業時間短暫之作業。
三、從事作業期間短暫之作業。

雇主對前項各款之作業，應<span class="hl">供給勞工適當之呼吸防護具</span>，並切實使其使用。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第22條（清掃規定）</span>
          <div class="art-body">特定粉塵發生源之室內作業場所，應<span class="hl">每日</span>清掃一次以上。每月應使用真空吸塵器或以水沖洗方法清潔地面、牆壁及設備一次以上。

<span class="cr">禁止使用乾式掃帚清掃粉塵</span>，以防止粉塵飛揚。</div>
        </div>
      </details>`,
  },
  {
    tag: 'heat',
    title: '【法規8】高溫作業勞工作息時間標準（103.07.01）✅',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第19條第2項</div>
      <div class="ref-item"><strong>第2條</strong>（8種高溫作業）<br>
      鍋爐房｜灼熱金屬壓軋鍛造｜鑄造間處理熔融金屬｜金屬加熱熔煉｜搪瓷/玻璃/電石/熔爐｜蒸汽火車輪船機房｜蒸汽操作燒窯｜其他主管機關指定</div>
      <div class="ref-item"><strong>第3條</strong>（WBGT公式）室內：<span class="hl">0.7濕球＋0.3黑球</span>；戶外：<span class="hl">0.7濕球＋0.2黑球＋0.1乾球</span></div>
      <div class="ref-item"><strong>第4條</strong>（工作分類）<span class="cg">輕工作</span>：坐/立操機器｜<span class="cb">中度工作</span>：走動提舉推動｜<span class="cr">重工作</span>：鏟掘推全身運動</div>
      <div class="ref-item"><strong class="hl">第5條</strong>（連續作業WBGT門檻）輕 <span class="hl">30.6°C</span>、中 <span class="hl">28.0°C</span>、重 <span class="hl">25.9°C</span>；每日不得超過 <span class="cr">6小時</span></div>
      <div class="ref-item"><strong>第6條</strong>（薪資保障）降低工時之勞工，原有工資<span class="cr">不得減少</span></div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（第2條、第3條、第4條、第5條、第6條）</summary>

        <div class="law-art">
          <span class="art-title">第2條（高溫作業種類）</span>
          <div class="art-body">本標準所稱高溫作業，指在下列場所從事之作業：
一、鍋爐房之作業。
二、灼熱金屬之壓軋及鍛造作業。
三、鑄造間處理熔融金屬之作業。
四、金屬之加熱熔煉及熱處理作業。
五、搪瓷、玻璃、電石及熔爐之作業。
六、蒸汽機車、蒸汽輪船、輪機房等之作業。
七、以蒸汽操作之蒸煮、燒窯等作業。
八、其他經中央主管機關指定之高溫作業。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第3條（WBGT測定公式）</span>
          <div class="art-body">綜合溫度熱指數（WBGT）依下列公式計算：
一、<span class="hl">室內作業場所或無日曬之室外作業場所</span>：
WBGT ＝ <span class="hl">0.7 × 自然濕球溫度 ＋ 0.3 × 黑球溫度</span>

二、<span class="hl">戶外有日曬之作業場所</span>：
WBGT ＝ <span class="hl">0.7 × 自然濕球溫度 ＋ 0.2 × 黑球溫度 ＋ 0.1 × 乾球溫度</span></div>
        </div>

        <div class="law-art">
          <span class="art-title">第4條（工作分類）</span>
          <div class="art-body">本標準依勞工之作業狀況，將工作分類如下：
一、<span class="cg">輕工作</span>：以坐或立之姿勢操縱機器，以及坐姿之工作，代謝率在 200W/m² 以下。
二、<span class="cb">中度工作</span>：走動、推拉或提舉物品，代謝率在 200 至 350 W/m² 之間。
三、<span class="cr">重工作</span>：以鏟、推、拉之方式，從事全身運動，代謝率超過 350 W/m²。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第5條（連續作業WBGT門檻）</span>
          <div class="art-body">雇主使勞工從事高溫作業，其勞工在工作場所連續作業之WBGT值，不得超過下列規定：

<span class="cg">輕工作</span>：連續作業 <span class="hl">30.6°C</span>（75%工作25%休息：31.4°C；50/50：32.2°C；25/75：33.0°C）
<span class="cb">中度工作</span>：連續作業 <span class="hl">28.0°C</span>（75/25：29.4°C；50/50：31.1°C；25/75：32.6°C）
<span class="cr">重工作</span>：連續作業 <span class="hl">25.9°C</span>（75/25：27.9°C；50/50：30.0°C；25/75：32.1°C）

每日工作時間不得超過<span class="cr">六小時</span>（職業安全衛生法§19）</div>
        </div>

        <div class="law-art">
          <span class="art-title">第6條（薪資保障）</span>
          <div class="art-body">雇主依前條規定縮短高溫作業勞工之工作時間，<span class="cr">不得以此為理由扣減其工資或其他費用</span>。</div>
        </div>
      </details>`,
  },
  {
    tag: 'heat',
    title: '【法規9】高氣溫作業熱危害預防指引（114.06.20第二次修正）✅',
    content: `
      <div class="ref-item"><span class="hl">性質</span>：行政指導（非強制法規），依職安衛設施規則§303-1及§324-6訂定</div>
      <div class="ref-item"><strong>第3條</strong>（定義）熱指數 = 溫度＋相對濕度評估（≠ WBGT）</div>
      <div class="ref-item"><strong>第5條</strong>（風險等級）≥54.4（四）｜40.6-54.4（三）｜32.2-40.6（二）｜26.7-32.2（一）</div>
      <div class="ref-item"><strong>第6條</strong>（提升一級條件）①陽光直接照射　②穿著不透氣厚重/抗滲透性防護衣<br><span class="ref-note-inline">僅適用第一至三級</span></div>
      <div class="ref-item"><strong>第7條</strong>（危害預防措施）飲水每15-20min/150-200mL；停工耳溫38/38.5°C；熱適應新進第1天≤20%</div>
      <div class="ref-item"><strong>第9條</strong>（第四級禁止）除緊急救援外，禁止穿著不透氣防護衣及重體力作業</div>

      <details class="full-law">
        <summary>📜 展開完整條文（重點條文全文）</summary>

        <div class="law-art">
          <span class="art-title">第5條（熱危害風險等級分類）</span>
          <div class="art-body">熱危害風險等級依熱指數分為四級：
<span class="cg">第一級</span>：熱指數 <span class="hl">26.7°C 以上，未達 32.2°C</span>
→ 對高風險族群（老年、肥胖、心臟病、糖尿病）注意；重體力作業提高警覺。

<span class="cb">第二級</span>：熱指數 <span class="hl">32.2°C 以上，未達 40.6°C</span>
→ 對全體勞工實施危害預防措施，加強提供飲水。

<span style="color:#fb923c">第三級</span>：熱指數 <span class="hl">40.6°C 以上，未達 54.4°C</span>
→ 避免於高氣溫時段進行戶外作業；強化危害預防及應變措施。

<span class="cr">第四級</span>：熱指數 <span class="hl">54.4°C 以上</span>
→ 除緊急救援作業外，避免一切戶外作業；強制遮陽降溫、充足飲水、休息空間。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第6條（風險等級提升條件）</span>
          <div class="art-body">符合下列情形之一者，應將風險等級提升一級（<span class="ref-note-inline" style="display:inline">第四級除外</span>）：
一、<span class="hl">陽光直接照射</span>作業場所（暴露於陽光下）。
二、穿著<span class="hl">不透氣、厚重或抗滲透性之防護衣具</span>。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第7條（預防及緊急應變措施，重點節錄）</span>
          <div class="art-body">一、補充水分：
• 每 <span class="hl">15至20分鐘</span> 補充水分一次，每次約 <span class="hl">150至200毫升</span>。
• 受作業限制時，每小時至少補充 <span class="hl">2至4杯</span>（每杯約240mL）。
• 飲用水溫度以 <span class="hl">10至15°C</span> 為宜；<span class="cr">禁止飲用含酒精或大量糖分飲料</span>。

二、熱適應計畫：
• 新進未有高溫工作經驗者，第1天不超過 <span class="hl">20%</span> 正常工作量，每天遞增20%，約 <span class="hl">5天</span> 適應完成。
• 有高溫工作經驗者，第<span class="hl">4天</span>即可達正常作業量。

三、停工判斷（符合任一即應停工）：
• 耳溫：未適應者 &gt; <span class="hl">38°C</span>，已適應者 &gt; <span class="hl">38.5°C</span>。
• 作業中心跳 &gt; <span class="hl">（180 減去年齡）次/分</span>。
• 停止作業後1分鐘心跳仍 &gt; <span class="hl">120次/分</span>。</div>
        </div>
      </details>`,
  },
  {
    tag: 'facility',
    title: '【法規10】職業安全衛生設施規則（相關條文）✅',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第6條第3項</div>
      <div class="ref-item"><strong>§19-1</strong>（局限空間定義）非供勞工經常性作業，進出受限制，且無法以自然通風維持充分清淨空氣之空間</div>
      <div class="ref-item"><strong>§29-1</strong>（局限空間危害防止計畫）應包含：危害辨識、進入許可、氣體監測、緊急應變</div>
      <div class="ref-item"><strong>§29-4</strong>（缺氧/危害物標準）O₂ &lt; <span class="hl">18%</span> = 缺氧；H₂S &gt; <span class="hl">10 ppm</span> 或 CO &gt; <span class="hl">35 ppm</span> = 危險</div>
      <div class="ref-item"><strong>§31</strong>（室內工作場所通道）主要通道寬度 ≥ <span class="hl">1m</span>；機械設備間通道 ≥ <span class="hl">80cm</span></div>
      <div class="ref-item"><strong>§277</strong>（呼吸防護具選用）依作業性質、毒性及危害濃度選擇適當防護具，並維護其有效性</div>
      <div class="ref-item"><strong>§303-1</strong>（戶外高氣溫作業）設遮陽設施、降溫設備、適當休息場所、充足飲用水</div>
      <div class="ref-item"><strong class="hl">§324-3</strong>（不法侵害預防）7大措施＋其他安全衛生事項；<span class="hl">執行紀錄留存3年</span></div>
      <div class="ref-item"><strong>§324-6</strong>（戶外作業熱危害）訂定熱危害預防計畫＋教育訓練＋緊急醫療通報</div>

      <details class="full-law">
        <summary>📜 展開完整條文原文（§19-1、§29-4、§324-3 重點條文）</summary>

        <div class="law-art">
          <span class="art-title">第19條之1（局限空間定義）</span>
          <div class="art-body">本規則所稱局限空間，係指<span class="hl">非供勞工在其內部從事經常性作業</span>，勞工進出方法受限制，且無法以自然通風來維持充分、清淨空氣之空間。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第29條之4（缺氧及危害氣體標準）</span>
          <div class="art-body">本規則所稱缺氧，係指空氣中<span class="hl cr">氧氣濃度未滿百分之十八</span>（&lt; 18%）之狀態。

下列情形應視為有危害勞工之虞：
一、空氣中<span class="cr">硫化氫（H₂S）超過十ppm（10 ppm）</span>。
二、空氣中<span class="cr">一氧化碳（CO）超過三十五ppm（35 ppm）</span>。
三、其他達到有害濃度之物質。</div>
        </div>

        <div class="law-art">
          <span class="art-title">第324條之3（不法侵害預防措施）✅ 來源：職安衛設施規則</span>
          <div class="art-body">雇主為預防勞工於執行職務，因他人行為致遭受身體或精神上不法侵害，應採取下列暴力預防措施，<span class="hl">作成執行紀錄並留存三年</span>：
一、<span class="hl">辨識及評估危害</span>。
二、<span class="hl">適當配置作業場所</span>。
三、<span class="hl">依工作適性適當調整人力</span>。
四、<span class="hl">建構行為規範</span>。
五、<span class="hl">辦理危害預防及溝通技巧訓練</span>。
六、<span class="hl">建立事件之處理程序</span>。
七、<span class="hl">執行成效之評估及改善</span>。
八、<span class="hl">其他有關安全衛生事項</span>。

<span class="ref-note-inline">雇主規劃前項措施時，應參考中央主管機關發布之相關指引（即執行職務遭受不法侵害預防指引）。</span></div>
        </div>

        <div class="law-art">
          <span class="art-title">第303條之1（戶外高氣溫作業雇主義務）</span>
          <div class="art-body">雇主使勞工於高氣溫戶外環境從事作業，應採取下列危害預防措施：
一、<span class="hl">設置遮陽設施或陰涼休息場所</span>。
二、提供適當降溫設備及設施（如送風、噴霧等）。
三、<span class="hl">供應充足飲用水</span>，每小時提供勞工飲用水至少六百毫升。
四、教導勞工有關熱危害預防及緊急應變措施。
五、設置緊急聯絡及求救系統。</div>
        </div>
      </details>`,
  },
]

const LAW_TABS = [
  { id: 'all',      label: '全部' },
  { id: 'core',     label: '核心法規' },
  { id: 'health',   label: '健康管理' },
  { id: 'maternal', label: '母性保護' },
  { id: 'chem',     label: '化學性危害' },
  { id: 'dust',     label: '粉塵' },
  { id: 'heat',     label: '熱危害' },
  { id: 'monitor',  label: '監測' },
  { id: 'facility', label: '設施規則' },
]

function AccordionItem({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-100 leading-snug pr-2">{title}</span>
        <span className={`text-gray-400 text-lg shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div
          className="ref-body px-4 py-4 bg-gray-900 text-sm text-gray-200"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  )
}

export default function LawReference() {
  const [mainTab, setMainTab] = useState('guide')
  const [lawFilter, setLawFilter] = useState('all')

  const filteredLaws = lawFilter === 'all'
    ? LAW_SECTIONS
    : LAW_SECTIONS.filter(s => s.tag === lawFilter)

  return (
    <div className="min-h-screen bg-gray-900">
      <style>{`
        .ref-body .hl   { background: rgba(240,165,0,.25); color: #fbbf24; font-weight: 700; padding: 0 3px; border-radius: 3px; }
        .ref-body .cr   { color: #f87171; }
        .ref-body .cb   { color: #60a5fa; }
        .ref-body .cg   { color: #4ade80; }
        .ref-body .ref-item { margin-bottom: 12px; line-height: 1.8; }
        .ref-body .ref-note { background: rgba(240,165,0,.08); border: 1px solid rgba(240,165,0,.2); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #fbbf24; margin-top: 8px; }
        .ref-body .ref-warn { background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.25); border-radius: 8px; padding: 12px; font-size: 12px; color: #fcd34d; line-height: 1.9; margin-top: 8px; }
        .ref-body .ref-check { background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.2); border-radius: 8px; padding: 12px; font-size: 12px; color: #86efac; line-height: 2; margin-bottom: 8px; }
        .ref-body .ref-note-inline { display: inline; font-size: 11px; color: #60a5fa; margin-top: 4px; }
        .ref-body .ref-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        .ref-body .ref-table th { background: rgba(240,165,0,.15); color: #fbbf24; padding: 6px 8px; text-align: left; border-bottom: 1px solid #374151; }
        .ref-body .ref-table td { padding: 6px 8px; border-bottom: 1px solid #1f2937; vertical-align: top; }
        .ref-body .ref-table tr:last-child td { border-bottom: none; }
        .ref-body strong { color: #e5e7eb; }

        /* 完整條文展開樣式 */
        .ref-body details.full-law { margin-top: 16px; border-top: 1px solid rgba(255,255,255,.08); padding-top: 10px; }
        .ref-body details.full-law > summary { cursor: pointer; color: #60a5fa; font-size: 12px; list-style: none; padding: 6px 10px; background: rgba(96,165,250,.06); border-radius: 6px; border: 1px solid rgba(96,165,250,.2); }
        .ref-body details.full-law > summary::-webkit-details-marker { display: none; }
        .ref-body details.full-law > summary::before { content: "▶ "; font-size: 10px; }
        .ref-body details.full-law[open] > summary::before { content: "▼ "; }
        .ref-body details.full-law > summary:hover { background: rgba(96,165,250,.12); }
        .ref-body .law-art { margin-top: 10px; padding: 10px 12px; background: rgba(0,0,0,.3); border-radius: 6px; border-left: 3px solid #374151; }
        .ref-body .law-art:hover { border-left-color: #4b5563; }
        .ref-body .art-title { display: block; color: #f3f4f6; font-weight: 700; font-size: 13px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #1f2937; }
        .ref-body .art-body { font-size: 12px; line-height: 2.1; color: #d1d5db; white-space: pre-wrap; }
      `}</style>

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 pt-8 pb-5">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-gray-400 text-sm mb-3 inline-block">← 返回首頁</Link>
          <h1 className="text-xl font-bold text-white">⚖️ 法規查閱</h1>
          <p className="text-gray-400 text-sm mt-1">職業衛生管理甲級 ｜ 完整條文＋重點標色</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded-full">✅ 條文已核對</span>
            <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full">⚠️ 待官方確認標示</span>
            <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full">📜 含完整條文原文</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          {[
            { id: 'guide', label: '📋 指引速查' },
            { id: 'law',   label: '⚖️ 法規條文' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                mainTab === t.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">

        {/* ── 指引速查 ── */}
        {mainTab === 'guide' && (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              <span className="bg-yellow-900/40 text-yellow-400 px-1 rounded">黃底</span> = 關鍵數字／名詞，
              <span className="text-red-400">紅色</span> = 禁止/強制事項。資料來源均有法令依據。
            </p>
            {GUIDE_SECTIONS.map((s, i) => (
              <AccordionItem key={i} title={s.title} content={s.content} defaultOpen={i === 0} />
            ))}
          </div>
        )}

        {/* ── 法規條文 ── */}
        {mainTab === 'law' && (
          <div>
            <div className="flex overflow-x-auto gap-2 pb-2 mb-3 scrollbar-hide">
              {LAW_TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setLawFilter(t.id)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                    lawFilter === t.id
                      ? 'bg-yellow-500 text-black border-yellow-500 font-semibold'
                      : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              ✅ = 條文已核對 ｜ ⚠️ = 請自 law.moj.gov.tw 確認 ｜ 📜 = 點擊「展開完整條文」可閱讀原文
            </p>
            {filteredLaws.map((s, i) => (
              <AccordionItem key={i} title={s.title} content={s.content} defaultOpen={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
