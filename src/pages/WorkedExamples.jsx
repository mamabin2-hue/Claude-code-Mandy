import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────
   解題練習資料庫
   來源說明：
   ✅ = 依法令原文/考古題官方答案驗算
   ⚠️ = 依標準公式推算，請自行核對
   ───────────────────────────────────────────────────────── */

const FORMULA_REF = [
  {
    topic: '音功率級 Lw',
    formula: 'Lw = 10 × log₁₀(W / W₀)，W₀ = 10⁻¹² W',
    note: '✅ 聲學基本公式'
  },
  {
    topic: '半自由音場音壓級 Lp',
    formula: 'Lp = Lw − 8 − 20 × log₁₀(r)　r=距離(m)',
    note: '✅ 地面反射點音源；距離加倍→降6dB'
  },
  {
    topic: 'OSHA 5dB換算容許暴露時間',
    formula: 'T = 8 ÷ 2^((L − 90) / 5)　(hr)',
    note: '✅ OSHA標準；台灣§300查表用3dB換算'
  },
  {
    topic: 'TWA₈（8hr時量平均音壓級）',
    formula: 'TWA₈ = 16.61 × log₁₀(D / 100) + 90　D=劑量%',
    note: '✅ 試題答案多次驗算'
  },
  {
    topic: 'LAVG（實際工作時數≠8hr）',
    formula: 'LAVG = 16.61 × log₁₀(D/100 × 8/T_work) + 90',
    note: '✅'
  },
  {
    topic: '噪音合成加值表',
    formula: 'ΔL差: 0~1→+3, 2~4→+2, 5~9→+1, ≥10→+0（加在大值上）',
    note: '✅ 噪音測量業界標準'
  },
  {
    topic: '背景噪音扣除表',
    formula: 'ΔL差: 3→扣3, 4~5→扣2, 6~9→扣1, ≥10→扣0',
    note: '✅ 精確公式：L機器 = 10×log₁₀(10^(L量測/10)−10^(L背景/10))'
  },
  {
    topic: 'WBGT室內公式',
    formula: 'WBGT = 0.7×濕球 + 0.3×黑球',
    note: '✅ 高溫作業勞工作息時間標準§3'
  },
  {
    topic: 'WBGT戶外（有日曬）公式',
    formula: 'WBGT = 0.7×濕球 + 0.2×黑球 + 0.1×乾球',
    note: '✅'
  },
  {
    topic: 'WBGT時量平均',
    formula: 'WBGT_TWA = Σ(WBGTᵢ × tᵢ) / Σtᵢ',
    note: '✅'
  },
  {
    topic: '平均照度',
    formula: 'Ē = (E₁ + E₂ + ⋯ + Eₙ) / n',
    note: '✅ 職安衛設施規則§313'
  },
]

const PROBLEMS = [
  /* ═══════════════════════════════════════
     SECTION 1：音功率級 / 音壓級
     ═══════════════════════════════════════ */
  {
    id: 'N-01',
    topic: '噪音',
    subtopic: 'Lw → Lp 換算',
    title: '機器音功率級計算後求距離音壓級',
    source: '⚠️ 依聲學公式推算，格式參照歷年術科計算題',
    question: `某機器聲音功率 W = 0.01 W，置於戶外地面上（半自由音場）。
請計算：
（1）該機器的音功率級 Lw
（2）距離機器 10 m 處的音壓級 Lp`,
    relatedCards: ['kc-PHYS-012'],
    steps: [
      {
        label: '第一步：計算音功率級 Lw',
        content: `Lw = 10 × log₁₀(W / W₀)
   = 10 × log₁₀(0.01 / 10⁻¹²)
   = 10 × log₁₀(10⁻² / 10⁻¹²)
   = 10 × log₁₀(10¹⁰)
   = 10 × 10
   = 100 dB`
      },
      {
        label: '第二步：計算音壓級 Lp（半自由音場）',
        content: `Lp = Lw − 8 − 20 × log₁₀(r)
   = 100 − 8 − 20 × log₁₀(10)
   = 100 − 8 − 20 × 1
   = 72 dB`
      }
    ],
    answer: '（1）Lw = 100 dB　（2）Lp = 72 dB',
    knowledgePoints: [
      '半自由音場：音源在地面，聲音向半球面輻射，面積=2πr²',
      '距離加倍（10m→20m）時：Lp降低 6 dB',
      '自由音場（無反射）：Lp = Lw − 11 − 20×log₁₀(r)'
    ]
  },
  {
    id: 'N-02',
    topic: '噪音',
    subtopic: 'Lw → Lp 距離影響',
    title: '距離加倍時音壓級的變化量',
    source: '⚠️ 依聲學公式推算',
    question: `同一台機器（Lw=100dB，半自由音場），
在距離 r₁=5m 時 Lp₁=？
在距離 r₂=10m（加倍）時 Lp₂=？
距離加倍，音壓級降低多少？`,
    relatedCards: ['kc-PHYS-012'],
    steps: [
      {
        label: 'r₁=5m時',
        content: `Lp₁ = 100 − 8 − 20×log₁₀(5)
     = 100 − 8 − 20×0.699
     = 100 − 8 − 13.98
     = 78.02 ≈ 78 dB`
      },
      {
        label: 'r₂=10m時',
        content: `Lp₂ = 100 − 8 − 20×log₁₀(10)
     = 100 − 8 − 20
     = 72 dB`
      },
      {
        label: '距離加倍的降低量',
        content: `降低量 = Lp₁ − Lp₂ = 78 − 72 = 6 dB

公式推導：20×log₁₀(2r/r) = 20×log₁₀(2) = 20×0.301 ≈ 6 dB
【結論】距離加倍 → 音壓級降低 6 dB（半自由音場點音源）`
      }
    ],
    answer: '距離加倍，音壓級降低 6 dB',
    knowledgePoints: [
      '這是考試常出的「判斷」題：距離加倍降6dB（點音源）',
      '線音源（如道路交通）距離加倍只降3dB',
      '自由音場也適用同樣規則（降6dB）'
    ]
  },
  {
    id: 'N-03',
    topic: '噪音',
    subtopic: '容許暴露時間（OSHA）',
    title: '噪音87dB的容許暴露時間',
    source: '✅ OSHA標準；87dB=12.13hr 由試題答案驗算',
    question: `依美國OSHA噪音標準（5dB換算率，基準90dB=8hr），
噪音音壓級 87 dB(A) 的容許暴露時間為多少小時？`,
    relatedCards: ['kc-PHYS-001', 'kc-PHYS-013'],
    steps: [
      {
        label: '套用OSHA容許時間公式',
        content: `T = 8 ÷ 2^((L − 90) / 5)

L = 87 dB
(L − 90) = 87 − 90 = −3
(L − 90) / 5 = −3 / 5 = −0.6

T = 8 ÷ 2^(−0.6)
  = 8 ÷ 0.6598
  ≈ 12.13 小時`
      },
      {
        label: '對照驗算',
        content: `・90dB → T = 8÷2^0 = 8hr ✓
・95dB → T = 8÷2^1 = 4hr ✓
・100dB→ T = 8÷2^2 = 2hr ✓
・87dB → T ≈ 12.13hr ✅（試題答案驗算）`
      }
    ],
    answer: '12.13 小時（≈12小時8分）',
    knowledgePoints: [
      '此公式適用OSHA 5dB換算標準',
      '台灣法規（設施規則§300）用「3dB換算」，85dB=無時限，90dB=8hr',
      '考試常指定用哪套標準，務必看清楚題目！'
    ]
  },
  {
    id: 'N-04',
    topic: '噪音',
    subtopic: '劑量→TWA₈',
    title: '由噪音劑量D%計算8小時時量平均音壓級',
    source: '✅ TWA₈公式由多道試題答案驗算',
    question: `某勞工工作8小時，使用噪音劑量計測得累積暴露劑量 D = 150%。
請計算該勞工的8小時時量平均音壓級（TWA₈）。`,
    relatedCards: ['kc-PHYS-001'],
    steps: [
      {
        label: '套用TWA₈公式',
        content: `TWA₈ = 16.61 × log₁₀(D / 100) + 90

D = 150（%數值，不除以100）
D/100 = 150/100 = 1.5

TWA₈ = 16.61 × log₁₀(1.5) + 90
      = 16.61 × 0.1761 + 90
      = 2.924 + 90
      = 92.9 dB`
      },
      {
        label: '判斷是否超標',
        content: `台灣法規（§300）：90dB=8hr容許上限
92.9dB > 90dB → 超過法規標準（D>100%即超標）

D=150% > 100% → 已超標，需採改善措施`
      }
    ],
    answer: 'TWA₈ = 92.9 dB（已超過台灣法規90dB/8hr標準）',
    knowledgePoints: [
      'D=100%表示剛好在容許上限；D>100%即超標',
      '台灣§300：TWA₈超過90dB即違規',
      '劑量計適用於變動性噪音或移動型作業'
    ]
  },
  {
    id: 'N-05',
    topic: '噪音',
    subtopic: '多音源合成（加值表）',
    title: '三個噪音源合成計算',
    source: '✅ 加值表為業界標準；精確公式驗算',
    question: `工廠內有三台機器同時運轉：
甲機：88 dB(A)
乙機：85 dB(A)
丙機：82 dB(A)
求三台機器合成後的噪音音壓級。`,
    relatedCards: ['kc-PHYS-013'],
    steps: [
      {
        label: '方法一：加值表法（由大到小）',
        content: `步驟1：先合成甲+乙
 甲88dB，乙85dB，差值=3 → 加值表：差2~4→+2
 甲+乙合成 = 88 + 2 = 90 dB

步驟2：再合成（甲+乙）+丙
 (甲+乙)=90dB，丙82dB，差值=8 → 差5~9→+1
 三台合成 = 90 + 1 = 91 dB`
      },
      {
        label: '方法二：精確公式驗算',
        content: `L合 = 10 × log₁₀(10^(88/10) + 10^(85/10) + 10^(82/10))
     = 10 × log₁₀(6.310×10⁸ + 3.162×10⁸ + 1.585×10⁸)
     = 10 × log₁₀(11.057×10⁸)
     = 10 × log₁₀(1.1057×10⁹)
     = 10 × 9.0437
     = 90.44 dB ≈ 90 dB（加值表結果相符）`
      }
    ],
    answer: '三台機器合成噪音約 90~91 dB(A)',
    knowledgePoints: [
      '兩個相同音量的音源合成→增加3dB（如88+88=91dB）',
      '差值≥10dB的小音源可忽略不計',
      '加值表是快速估算，精確計算用對數公式'
    ]
  },
  {
    id: 'N-06',
    topic: '噪音',
    subtopic: '背景噪音扣除',
    title: '扣除背景噪音求機器本身噪音',
    source: '✅ 背景音扣除為噪音量測標準程序',
    question: `量測廠房內某機器噪音：
・機器運轉時量測值：95 dB(A)
・機器停止（背景噪音）：88 dB(A)

請問該機器本身的噪音音壓級為何？`,
    relatedCards: ['kc-PHYS-013'],
    steps: [
      {
        label: '方法一：扣除表（快速估算）',
        content: `差值 ΔL = 量測值 − 背景值 = 95 − 88 = 7 dB

查背景噪音扣除表：
差值 6~9 dB → 扣除 1 dB

機器噪音 = 95 − 1 = 94 dB(A)`
      },
      {
        label: '方法二：精確公式',
        content: `L機器 = 10 × log₁₀(10^(L量測/10) − 10^(L背景/10))
       = 10 × log₁₀(10^9.5 − 10^8.8)
       = 10 × log₁₀(3.162×10⁹ − 6.310×10⁸)
       = 10 × log₁₀(2.531×10⁹)
       = 10 × 9.403
       = 94.03 dB ≈ 94 dB（與扣除表結果一致）`
      },
      {
        label: '判斷背景噪音是否可忽略',
        content: `差值=7dB → 在 6~9dB 區間 → 背景有影響，需扣除
若差值≥10dB → 背景可忽略，量測值=機器噪音`
      }
    ],
    answer: '機器本身噪音 = 94 dB(A)',
    knowledgePoints: [
      '背景噪音差值<3dB時，量測結果不可靠（背景干擾太大）',
      '差值≥10dB，背景可忽略不計',
      '正式量測規定：背景噪音須比量測對象低至少3dB'
    ]
  },

  /* ═══════════════════════════════════════
     SECTION 2：WBGT 高溫計算
     ═══════════════════════════════════════ */
  {
    id: 'W-01',
    topic: '高溫WBGT',
    subtopic: 'WBGT計算（室內）',
    title: '室內高溫作業WBGT計算',
    source: '✅ 公式來自高溫作業勞工作息時間標準§3',
    question: `某室內鑄造廠量測三種溫度：
・自然濕球溫度（Tnwb）= 28°C
・黑球溫度（Tg）= 42°C

（1）計算WBGT值
（2）判斷是否符合輕工作連續作業規定（WBGT上限30°C）`,
    relatedCards: ['kc-PHYS-003', 'kc-PHYS-005'],
    steps: [
      {
        label: '第一步：套用室內WBGT公式',
        content: `室內（無日曬）：WBGT = 0.7×Tnwb + 0.3×Tg

WBGT = 0.7 × 28 + 0.3 × 42
     = 19.6 + 12.6
     = 32.2°C`
      },
      {
        label: '第二步：判斷是否超標',
        content: `輕工作連續作業WBGT上限 = 30°C（§5）

32.2°C > 30°C → 超過輕工作連續作業上限

→ 屬高溫作業，應採取：
  ・縮短連續作業時間
  ・增加休息頻率
  ・工程降溫措施`
      }
    ],
    answer: 'WBGT = 32.2°C，超過輕工作連續作業上限（30°C），屬高溫作業',
    knowledgePoints: [
      '室內公式口訣「三七」：黑球3、濕球7',
      '自然濕球感測：溫度、濕度、風速三效應',
      '黑球感測：輻射熱（直徑15cm、厚0.5mm中空黑色銅球）'
    ]
  },
  {
    id: 'W-02',
    topic: '高溫WBGT',
    subtopic: 'WBGT時量平均',
    title: '非均勻高溫暴露WBGT時量平均計算',
    source: '✅ 公式來自高溫作業勞工作息時間標準',
    question: `某勞工8小時工作日的高溫暴露情形如下：
・工作時（6小時）：WBGT = 33°C
・休息時（2小時）：WBGT = 28°C

（1）計算時量平均WBGT
（2）若為輕工作，判斷是否符合連續作業規定`,
    relatedCards: ['kc-PHYS-014', 'kc-PHYS-005'],
    steps: [
      {
        label: '計算WBGT時量平均',
        content: `WBGT_TWA = Σ(WBGTᵢ × tᵢ) / Σtᵢ

         = (33 × 6 + 28 × 2) / (6 + 2)
         = (198 + 56) / 8
         = 254 / 8
         = 31.75°C`
      },
      {
        label: '判斷是否超標',
        content: `輕工作連續作業WBGT上限 = 30°C

31.75°C > 30°C → 超過上限

→ 屬高溫作業，需調整作息：
  ・例如改為「45分工作 / 15分休息」的間歇作息`
      }
    ],
    answer: 'WBGT_TWA = 31.75°C，超過輕工作上限（30°C），需調整作息制度',
    knowledgePoints: [
      '時量平均就是「時間加權平均」，在熱環境時間越長影響越大',
      '休息場所WBGT越低，能有效降低時量平均值',
      '高溫作業定義：須同時符合①高溫作業種類 ②時量平均WBGT超標'
    ]
  },
  {
    id: 'W-03',
    topic: '高溫WBGT',
    subtopic: '戶外WBGT計算',
    title: '戶外有日曬環境WBGT計算',
    source: '✅ 公式來自高溫作業勞工作息時間標準§3',
    question: `戶外施工現場（有日曬）量測：
・自然濕球溫度（Tnwb）= 26°C
・黑球溫度（Tg）= 45°C
・乾球溫度（Ta）= 35°C

計算WBGT，並判斷對重工作（連續作業上限25°C）是否超標。`,
    relatedCards: ['kc-PHYS-003', 'kc-PHYS-005'],
    steps: [
      {
        label: '套用戶外（有日曬）WBGT公式',
        content: `戶外有日曬：WBGT = 0.7×Tnwb + 0.2×Tg + 0.1×Ta

WBGT = 0.7 × 26 + 0.2 × 45 + 0.1 × 35
     = 18.2 + 9.0 + 3.5
     = 30.7°C`
      },
      {
        label: '判斷是否超標',
        content: `重工作連續作業WBGT上限 = 25°C（§5）

30.7°C > 25°C → 大幅超過重工作上限

→ 應立即：
  ①縮短連續作業時間（間歇作業）
  ②提供遮蔭、降溫措施
  ③補充水分與電解質`
      }
    ],
    answer: 'WBGT = 30.7°C，遠超重工作連續作業上限（25°C）',
    knowledgePoints: [
      '戶外公式口訣「七二一」：濕球7、黑球2、乾球1',
      '重工作上限最嚴（25°C），輕工作最寬（30°C）',
      '黑球溫度受太陽輻射影響最大，戶外大幅高於乾球溫度'
    ]
  },
  {
    id: 'W-04',
    topic: '高溫WBGT',
    subtopic: '代謝率與熱舒適因子',
    title: '識別熱舒適物理因子與代謝率',
    source: '✅ 四因子來自考古題答案；代謝率來自試題答案驗算',
    question: `（1）影響熱舒適感覺的四個物理環境因子為何？
（2）依高溫作業分類，重工作、中度工作、輕工作和休息的代謝率（kcal/hr）各為多少？`,
    relatedCards: ['kc-PHYS-015', 'kc-PHYS-004'],
    steps: [
      {
        label: '四個熱舒適物理因子',
        content: `1. 溫度（乾球溫度/空氣溫度）
2. 濕度（相對濕度）
3. 輻射熱（平均輻射溫度）
4. 氣流速度（風速）

常見干擾選項（不屬於熱舒適物理因子）：
・噪音、照度、氣壓
→ 這三項影響人體舒適但不是「熱舒適物理因子」`
      },
      {
        label: '工作代謝率分類（kcal/hr）',
        content: `休息   ：100 kcal/hr
輕工作 ：150 kcal/hr（坐/站操縱機器）
中度工作：300 kcal/hr（走動、推拉提舉）
重工作 ：400 kcal/hr（全身激烈運動、鏟挖）

記憶技巧：100→150→300→400（1.5倍→2倍→1.33倍）`
      }
    ],
    answer: '四因子：溫度、濕度、輻射熱、氣流速度；代謝率：休100、輕150、中300、重400 kcal/hr',
    knowledgePoints: [
      'WBGT三種溫度計恰好涵蓋四因子：自然濕球→溫濕度+風速，黑球→輻射熱，乾球→氣溫',
      '代謝率越高，在同一WBGT環境中越容易中暑',
      '重工作WBGT上限最嚴（25°C）正是因為代謝率高（400 kcal/hr）'
    ]
  },

  /* ═══════════════════════════════════════
     SECTION 3：照度計算
     ═══════════════════════════════════════ */
  {
    id: 'L-01',
    topic: '照度',
    subtopic: '平均照度計算',
    title: '辦公室多點照度量測後計算平均照度',
    source: '✅ 平均照度計算依職安衛設施規則§313規定',
    question: `某辦公室設置12個照度量測點，各點量測值如下（lux）：
350、380、320、400、360、390、340、410、370、380、350、360

（1）計算平均照度
（2）判斷是否符合一般辦公室照度標準（最低200 lux）`,
    relatedCards: ['kc-PHYS-016'],
    steps: [
      {
        label: '計算各點總和',
        content: `350 + 380 + 320 + 400 + 360 + 390 + 340 + 410 + 370 + 380 + 350 + 360
= 4410 lux`
      },
      {
        label: '計算平均照度',
        content: `Ē = 總和 / 量測點數
  = 4410 / 12
  = 367.5 lux`
      },
      {
        label: '判斷是否符合標準',
        content: `職安衛設施規則§313，一般辦公室最低照度 = 200 lux

367.5 lux > 200 lux → 符合規定

但注意：任何單點不得低於平均值的 1/3（約122 lux）
最低量測點 320 lux > 122 lux → 均勻度也符合`
      }
    ],
    answer: '平均照度 = 367.5 lux，符合一般辦公室最低標準（200 lux）',
    knowledgePoints: [
      '平均照度 = 算術平均（各點總和/點數）',
      '量測高度：距地面0.8~1m（工作面高度）',
      '辦公室200lux、精密作業500lux、超精密1000lux'
    ]
  },
  {
    id: 'L-02',
    topic: '照度',
    subtopic: '法規照度標準',
    title: '不同作業場所照度標準判斷',
    source: '✅ 依職業安全衛生設施規則§313',
    question: `依職業安全衛生設施規則規定，下列場所的最低照度標準各為多少lux？
（1）一般倉儲作業
（2）一般辦公室
（3）精密電子組裝作業
（4）超精密光學量測作業`,
    relatedCards: ['kc-PHYS-016'],
    steps: [
      {
        label: '查閱§313照度標準表',
        content: `（1）一般倉儲  → 最低 20 lux（室外走道、一般倉儲）
（2）一般辦公室→ 最低 200 lux
（3）精密電子  → 最低 500 lux（精密作業）
（4）超精密光學→ 最低 1000 lux（超精密作業）`
      },
      {
        label: '記憶技巧',
        content: `走道倉儲：20 lux（最暗）
盥洗室走廊：50 lux
辦公室：200 lux
精密作業：500 lux
超精密：1000 lux

→ 20 → 50 → 200 → 500 → 1000（各差約2.5~4倍）`
      }
    ],
    answer: '（1）20 lux　（2）200 lux　（3）500 lux　（4）1000 lux',
    knowledgePoints: [
      '照度標準從§313，常考「配對」題型',
      '辦公室200是基準點，精密×2.5，超精密×5',
      '照度不足易造成視覺疲勞，增加職業災害風險'
    ]
  }
]

const TOPICS = ['全部', '噪音', '高溫WBGT', '照度']

export default function WorkedExamples() {
  const [activeTab, setActiveTab] = useState('全部')
  const [revealedIds, setRevealedIds] = useState({})
  const [showFormulas, setShowFormulas] = useState(false)

  const filtered = activeTab === '全部' ? PROBLEMS : PROBLEMS.filter(p => p.topic === activeTab)

  const toggleReveal = (id) => setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 pt-8 pb-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="text-blue-200 text-sm hover:text-white mb-3 inline-block">← 返回首頁</Link>
          <h1 className="text-2xl font-bold">解題練習區</h1>
          <p className="text-blue-200 text-sm mt-1">計算題逐步解析 × 公式 × 知識點</p>
          <p className="text-blue-300 text-xs mt-1">
            ✅ = 依法令/考古題答案驗算　⚠️ = 依標準公式推算，請自行核對
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Formula Reference Panel */}
        <div className="mb-4">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="w-full bg-indigo-700 text-white rounded-xl px-4 py-3 font-semibold flex items-center justify-between"
          >
            <span>📐 計算公式速查</span>
            <span className="text-sm">{showFormulas ? '收起 ▲' : '展開 ▼'}</span>
          </button>
          {showFormulas && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-b-xl p-4">
              <div className="space-y-3">
                {FORMULA_REF.map((f, i) => (
                  <div key={i} className="border-b border-indigo-100 pb-2 last:border-0">
                    <p className="font-semibold text-indigo-900 text-sm">{f.topic}</p>
                    <p className="font-mono text-sm text-indigo-800 bg-white rounded px-2 py-1 mt-1">{f.formula}</p>
                    <p className="text-xs text-indigo-500 mt-0.5">{f.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Topic Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {TOPICS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Problem Count */}
        <p className="text-gray-500 text-sm mb-4">共 {filtered.length} 題</p>

        {/* Problems */}
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Problem Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.topic === '噪音' ? 'bg-blue-100 text-blue-700' :
                    p.topic === '高溫WBGT' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{p.topic}</span>
                  <span className="text-xs text-gray-400">{p.subtopic}</span>
                  <span className="ml-auto text-xs text-gray-400 font-mono">{p.id}</span>
                </div>
                <h3 className="font-semibold text-gray-800">{p.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{p.source}</p>
              </div>

              {/* Question */}
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.question}</p>
              </div>

              {/* Related Knowledge Cards */}
              <div className="px-4 py-2 bg-blue-50 flex flex-wrap gap-1">
                <span className="text-xs text-blue-500">相關知識卡：</span>
                {p.relatedCards.map(c => (
                  <span key={c} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">{c}</span>
                ))}
              </div>

              {/* Reveal Button */}
              <div className="px-4 py-3">
                <button
                  onClick={() => toggleReveal(p.id)}
                  className={`w-full py-2 rounded-xl font-medium text-sm transition-colors ${
                    revealedIds[p.id]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  {revealedIds[p.id] ? '✓ 收起解答' : '查看逐步解析'}
                </button>
              </div>

              {/* Solution */}
              {revealedIds[p.id] && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Steps */}
                  {p.steps.map((step, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">{step.label}</p>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{step.content}</pre>
                    </div>
                  ))}

                  {/* Answer */}
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-3">
                    <p className="text-xs font-bold text-green-700 mb-1">最終答案</p>
                    <p className="text-sm text-green-900 font-semibold">{p.answer}</p>
                  </div>

                  {/* Knowledge Points */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-700 mb-2">📌 重要知識點</p>
                    <ul className="space-y-1">
                      {p.knowledgePoints.map((kp, i) => (
                        <li key={i} className="text-xs text-amber-900">・{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <Link to="/knowledge" className="text-blue-600 text-sm hover:underline">→ 前往知識卡片複習相關概念</Link>
        </div>
      </div>
    </div>
  )
}
