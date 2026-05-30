import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────
// 資料來源說明
// ✅ = 條文已核對自 knowledge_cards.json / law_changes.json / shukeyi 解答
// ⚠️ = 條文出現頻率高但無現成驗證原文，標示後請自全國法規資料庫核對
// ─────────────────────────────────────────────────────────────

// ── 指引速查 ──────────────────────────────────────────────────
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

// ── 法規條文 ──────────────────────────────────────────────────
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
      <div class="ref-item"><strong>第6條第3項</strong>（授權訂定標準）<br>→ 粉塵危害預防標準、職安衛設施規則等依此授權</div>
      <div class="ref-item"><strong>第12條第2項</strong>（容許暴露標準）<br>→ 勞工作業場所容許暴露標準依此訂定</div>
      <div class="ref-item"><strong class="hl">第19條第1項</strong>（高溫作業工時限制）<br>在高溫場所工作之勞工，雇主不得使其每日工作時間超過 <span class="cr">六小時</span>。</div>
      <div class="ref-item"><strong>第22條之1</strong>（職場霸凌防治，2026年施行）<br>雇主應採取適當之預防及保護措施，防止職場霸凌之發生。所稱職場霸凌，指…持續以冒犯、威脅、冷落、孤立、侮辱或其他不當之言詞或行為，致其身心健康遭受危害。</div>
      <div class="ref-item"><strong>§26～29</strong>（承攬管理）<br>原事業單位交付承攬，§26應事前告知危害；§27協議組織；§28禁止連鎖承攬；§29提供必要安全衛生設施</div>
      <div class="ref-item"><strong>§37</strong>（職災通報）<br>雇主對職業災害應即採取必要急救、搶救措施；死亡/重傷立即通報主管機關</div>
      <div class="ref-item"><strong>§40</strong>（刑事罰）最高3年以下有期徒刑<br><strong>§43</strong>（行政罰）違反雇主義務：<span class="hl">3萬至30萬</span><br><strong>§45</strong>（行政罰）含不法侵害違規：<span class="hl">3萬至15萬</span></div>`,
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
      未滿40歲 → 每 <span class="hl">5年</span> 1次<br>
      40歲以上未滿65歲 → 每 <span class="hl">3年</span> 1次<br>
      65歲以上 → 每 <span class="hl">1年</span> 1次</div>
      <div class="ref-item"><strong>第19條</strong>（健康檢查記錄保存）<br>一般健康檢查記錄：<span class="hl">7年</span></div>
      <div class="ref-item"><strong>第20條</strong>（特殊健康檢查記錄保存）<br>特殊健康檢查：<span class="hl">10年</span>；游離輻射/石綿/致癌物等高風險：<span class="hl">30年</span></div>
      <div class="ref-item"><strong class="hl">第21條</strong>（特殊健康管理4級制）<br>
      <table class="ref-table">
        <tr><th>級別</th><th>判定標準</th><th>雇主應採措施</th></tr>
        <tr><td class="cg">第一級</td><td>無異常 / 與工作無關</td><td>繼續原工作，定期追蹤</td></tr>
        <tr><td class="cb">第二級</td><td>異常，與工作無關</td><td>健康指導</td></tr>
        <tr><td style="color:#fb923c">第三級</td><td>異常，<strong>無法確定是否與工作有關</strong></td><td>安排至醫療機構進一步檢查</td></tr>
        <tr><td class="cr">第四級</td><td>異常，<strong>與工作有關</strong></td><td>醫師書面意見＋立即改善；評估調整工作</td></tr>
      </table>
      <span class="ref-note-inline">⚠️ 第三級≠「與工作有關」；第三級是「無法確定」，第四級才是「與工作有關」</span></div>`,
  },
  {
    tag: 'maternal',
    title: '【法規3】女性勞工母性健康保護實施辦法（109年修正）✅',
    content: `
      <div class="ref-item"><span class="hl">修正施行</span>：2020/09/16（部分條文2021/03/01）</div>
      <div class="ref-item"><strong>§2</strong>（適用門檻）<br>僱用 <span class="hl">100人以上</span>之事業單位，應依本辦法訂定母性健康保護計畫</div>
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
      第一級（低風險）：暴露量 &lt; <span class="hl">1/2 BE（生物暴露指標）</span> → 繼續原工作<br>
      第二級（中風險）：<span class="hl">1/2 BE ≤ 暴露 &lt; BE</span> → 採取危害預防措施<br>
      第三級（高風險）：暴露量 ≥ <span class="hl">BE</span> 或超過容許標準 → 調整工作或停止作業</div>
      <div class="ref-item"><strong>附表二/三</strong>（禁止從事作業）<br>
      附表二：禁止<strong>妊娠中</strong>女性從事的有害性工作（含鉛作業/游離輻射/重物搬運等）<br>
      附表三：禁止<strong>分娩後未滿1年</strong>女性從事的有害性工作</div>`,
  },
  {
    tag: 'monitor',
    title: '【法規4】作業環境監測實施辦法（相關條文）✅ 依監測實施辦法§7、§8、§12',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第12條第1項</div>
      <div class="ref-item"><strong>§7</strong>（應實施作業環境監測之作業）<br>
      特別危害健康作業（有機溶劑/特化/鉛/石綿/噪音/粉塵等）、坑內作業等</div>
      <div class="ref-item"><strong>§8</strong>（監測頻率）<br>
      <table class="ref-table">
        <tr><th>作業類別</th><th>監測頻率</th></tr>
        <tr><td>特別危害健康作業（有機/特化/鉛/石綿/粉塵）</td><td class="hl">每6個月1次</td></tr>
        <tr><td>噪音作業</td><td class="hl">每6個月1次</td></tr>
        <tr><td>高溫作業</td><td class="hl">每年1次</td></tr>
        <tr><td>坑內作業（粉塵/噪音）</td><td class="hl">每3個月1次</td></tr>
      </table></div>
      <div class="ref-item"><strong>§12</strong>（監測記錄保存）<br>
      一般：<span class="hl">3年</span>｜石綿/游離輻射/致癌物：<span class="hl">30年</span></div>`,
  },
  {
    tag: 'chem',
    title: '【法規5】危害性化學品標示及通識規則（GHS）✅ 依§5、§7、§12、附表一、附表四',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第10條；採GHS（全球化學品統一分類及標示制度）</div>
      <div class="ref-item"><strong>§5</strong>（標示義務）<br>
      雇主對含有危害性化學品之容器，應注意標示下列事項：<br>
      ① 名稱　② 危害圖式　③ 警示語　④ 危害警告訊息　⑤ 危害防範措施　⑥ 製造者/供應者名稱及聯絡資訊</div>
      <div class="ref-item"><strong>§7</strong>（危害圖式形狀）<br>
      菱形外框，<span class="hl">紅色底框、白色背景</span>，內含黑色符號<br>
      共 <span class="hl">9種</span> 危害圖示：爆炸性、易燃性、氧化性、加壓氣體、腐蝕性、急毒性、健康危害、環境危害、嚴重健康危害</div>
      <div class="ref-item"><strong>§12</strong>（SDS 提供義務）<br>雇主對含危害性化學品，應提供中文安全資料表（SDS）給勞工，並每 <span class="hl">3年</span> 至少複查一次</div>
      <div class="ref-item"><strong>附表四</strong>（SDS 16個必填欄位）<br>
      1.化學品名稱　2.危害辨識　3.成分/組成　4.急救措施　5.滅火措施<br>
      6.洩漏處理　7.安全操作與儲存　8.暴露控制/個人防護<br>
      9.物理/化學性質　10.安定性/反應性　11.毒理資訊　12.生態資訊<br>
      13.廢棄處置　14.運輸資訊　15.法規資訊　16.其他資訊</div>`,
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
      ③ 合併第一/二種粉塵為結晶型游離二氧化矽，統一容許濃度 <span class="hl">0.1 mg/m³</span></div>`,
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
      <div class="ref-item"><strong class="hl">第12條</strong>（得免設置工程控制之條件）<br>符合臨時性/時間短暫/期間短暫，且供給適當呼吸防護具</div>
      <div class="ref-item"><strong>第22條</strong>（清掃）<br>每日清掃 <span class="hl">1次</span> 以上；每月用真空吸塵器或水沖洗 <span class="hl">1次</span>；<span class="cr">禁止乾式掃帚</span></div>`,
  },
  {
    tag: 'heat',
    title: '【法規8】高溫作業勞工作息時間標準（103.07.01）✅',
    content: `
      <div class="ref-item"><span class="hl">法源</span>：職業安全衛生法第19條第2項</div>
      <div class="ref-item"><strong>第2條</strong>（8種高溫作業）<br>
      鍋爐房｜灼熱金屬壓軋鍛造｜鑄造間處理熔融金屬｜金屬加熱熔煉｜搪瓷/玻璃/電石/熔爐｜蒸汽火車輪船機房｜蒸汽操作燒窯｜其他主管機關指定</div>
      <div class="ref-item"><strong>第3條</strong>（WBGT公式）室內：<span class="hl">0.7濕球＋0.3黑球</span>；戶外：<span class="hl">0.7濕球＋0.2黑球＋0.1乾球</span></div>
      <div class="ref-item"><strong>第4條</strong>（工作分類）<br>
      <span class="cg">輕工作</span>：坐/立操機器｜<span class="cb">中度工作</span>：走動提舉推動｜<span class="cr">重工作</span>：鏟掘推全身運動</div>
      <div class="ref-item"><strong class="hl">第5條</strong>（連續作業WBGT門檻）輕 <span class="hl">30.6°C</span>、中 <span class="hl">28.0°C</span>、重 <span class="hl">25.9°C</span>；每日不得超過 <span class="cr">6小時</span></div>
      <div class="ref-item"><strong>第6條</strong>（薪資保障）降低工時之勞工，原有工資<span class="cr">不得減少</span></div>`,
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
      <div class="ref-item"><strong>第9條</strong>（第四級禁止）除緊急救援外，禁止穿著不透氣防護衣及重體力作業</div>`,
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
      <div class="ref-item"><strong>§277</strong>（呼吸防護具選用）雇主使勞工使用呼吸防護具，應依作業性質、毒性及危害濃度選擇適當防護具，並維護其有效性</div>
      <div class="ref-item"><strong>§303-1</strong>（戶外高氣溫作業）設遮陽設施、降溫設備、適當休息場所、充足飲用水</div>
      <div class="ref-item"><strong>§324-3</strong>（不法侵害預防）應採取危害辨識、預防管理措施、教育訓練、當事人個案管理</div>
      <div class="ref-item"><strong>§324-6</strong>（戶外作業熱危害）訂定熱危害預防計畫＋教育訓練＋緊急醫療通報</div>`,
  },
]

// ── Tab 分類 ─────────────────────────────────────────────────
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

// ── AccordionItem ─────────────────────────────────────────────
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

// ── 主元件 ───────────────────────────────────────────────────
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
        .ref-body .ref-note-inline { display: block; font-size: 11px; color: #60a5fa; margin-top: 4px; }
        .ref-body .ref-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        .ref-body .ref-table th { background: rgba(240,165,0,.15); color: #fbbf24; padding: 6px 8px; text-align: left; border-bottom: 1px solid #374151; }
        .ref-body .ref-table td { padding: 6px 8px; border-bottom: 1px solid #1f2937; vertical-align: top; }
        .ref-body .ref-table tr:last-child td { border-bottom: none; }
        .ref-body strong { color: #e5e7eb; }
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
            {/* Sub filter tabs */}
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
              ✅ = 條文已核對（來自知識卡片/術科解答/修法記錄）｜⚠️ = 請自全國法規資料庫（law.moj.gov.tw）確認
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
