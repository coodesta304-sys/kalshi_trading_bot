# Kalshi AI Trading Bot

نظام تداول ذكي هجين على منصة Kalshi يجمع بين سرعة التنفيذ وذكاء الـ AI في تحليل الأخبار واتخاذ القرارات التجارية. يعمل النظام في بيئة التداول الافتراضي (Paper Trading) مع شفافية كاملة لقرارات البوت.

## 🎯 الهدف

بناء نظام تداول مؤتمت يستخدم **بيانات حقيقية من Polymarket** و **تحليل المشاعر من Twitter** لاتخاذ قرارات تداول ذكية في الأسواق التنبؤية.

**الميزات الرئيسية:**
- جلب بيانات حقيقية من Polymarket Gamma API
- تحليل المشاعر والاتجاهات من Twitter
- محرك تداول ذكي يجمع بين التحليل الفني والذكاء الاصطناعي
- محاكاة تداول افتراضية (Paper Trading) مع محفظة وهمية
- لوحة تحكم حية لمراقبة الأداء والإشارات
- نظام إشعارات شامل للأحداث المهمة

---

## 🏗️ معمارية النظام

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
│                    - Dashboard                              │
│                    - Settings                               │
│                    - Reports & Analytics                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    tRPC API Gateway
                         │
┌────────────────────────┴────────────────────────────────────┐
│              Backend (Node.js + Express + tRPC)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Core Services Layer                         │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐ │  │
│  │  │ Polymarket API  │  │ Twitter API (RapidAPI)  │ │  │
│  │  │ - Real Markets  │  │ - Sentiment Analysis    │ │  │
│  │  │ - Live Prices   │  │ - Trend Detection       │ │  │
│  │  └─────────────────┘  └──────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │    Trading Decision Engine                   │  │  │
│  │  │  - RSI Technical Analysis                    │  │  │
│  │  │  - Sentiment Score Integration               │  │  │
│  │  │  - Risk Management & Position Sizing         │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │    Paper Trading Engine                      │  │  │
│  │  │  - Virtual Portfolio Management              │  │  │
│  │  │  - Trade Execution Simulation                │  │  │
│  │  │  - P&L Calculation                           │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │    Background Jobs Service                   │  │  │
│  │  │  - Periodic Data Sync (1 min)                │  │  │
│  │  │  - Decision Making (2 min)                   │  │  │
│  │  │  - Portfolio Updates (30 sec)                │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Data Persistence Layer (Drizzle ORM)        │  │
│  │  - Markets & Orders                                 │  │
│  │  - AI Decisions & News Events                       │  │
│  │  - Portfolio Snapshots & Settings                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                         │
                   PostgreSQL Database
```

---

## 📊 تدفق البيانات

### 1. جلب البيانات الحقيقية

```
Polymarket Gamma API (https://gamma-api.polymarket.com)
    ↓
    ├─ GET /markets → 50 سوق حقيقي
    ├─ Prices & Volume
    └─ Market Metadata
    
    ↓ معالجة البيانات
    
Twitter API (via RapidAPI)
    ↓
    ├─ Search Tweets
    ├─ Sentiment Analysis
    └─ Trend Detection
```

### 2. اتخاذ القرارات

```
Real Market Data + Sentiment Analysis
    ↓
Trading Decision Engine
    ├─ RSI Technical Analysis
    ├─ Sentiment Score (0-1)
    ├─ Confidence Calculation
    └─ Signal Generation (BUY/SELL/HOLD)
    
    ↓
Risk Manager
    ├─ Position Sizing
    ├─ Stop Loss Calculation
    └─ Take Profit Levels
    
    ↓
Paper Trading Engine
    └─ Virtual Trade Execution
```

### 3. عرض النتائج

```
Dashboard
    ├─ Portfolio Overview
    │   ├─ Total Balance
    │   ├─ Available Balance
    │   ├─ P&L (Profit/Loss)
    │   └─ Win Rate
    │
    ├─ Trading Signals
    │   ├─ AI Detected Opportunities
    │   ├─ Confidence Scores
    │   └─ Market Insights
    │
    ├─ Market Predictions
    │   ├─ Real-time Market Data
    │   ├─ Price Movements
    │   └─ Volume Analysis
    │
    └─ Trends & Sentiment
        ├─ Twitter Trends
        ├─ Market Sentiment
        └─ Social Signals
```

---

## 🚀 البدء السريع

### المتطلبات

- Node.js 22.13.0+
- pnpm (مدير الحزم)
- PostgreSQL (قاعدة البيانات)
- RapidAPI Key (للوصول إلى Twitter API)

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/coodesta304-sys/kalshi_trading_bot.git
cd kalshi_trading_bot

# تثبيت الحزم
pnpm install

# إعداد متغيرات البيئة
cp .env.example .env
# عدّل .env بـ:
# - DATABASE_URL: اتصال قاعدة البيانات
# - RAPIDAPI_KEY: مفتاح RapidAPI
# - TWITTER_API_HOST: مضيف Twitter API

# تشغيل الخادم
pnpm dev

# تشغيل الاختبارات
pnpm test
```

---

## 📁 هيكل المشروع

```
kalshi_trading_bot/
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # لوحة التحكم الرئيسية
│   │   │   ├── Settings.tsx        # إعدادات المخاطر والتداول
│   │   │   ├── Reports.tsx         # التقارير والإحصائيات
│   │   │   └── Notifications.tsx   # الإشعارات
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx # تخطيط لوحة التحكم
│   │   │   └── ui/                 # مكونات shadcn/ui
│   │   ├── lib/
│   │   │   └── trpc.ts            # عميل tRPC
│   │   └── App.tsx                # التوجيه الرئيسي
│   └── index.html
│
├── server/                          # Backend (Node.js)
│   ├── services/
│   │   ├── polymarketClient.ts     # عميل Polymarket API
│   │   ├── twitterClient.ts        # عميل Twitter API
│   │   ├── tradingDecisionEngine.ts # محرك اتخاذ القرارات
│   │   ├── paperTradingEngine.ts   # محاكاة التداول
│   │   ├── riskManager.ts          # إدارة المخاطر
│   │   ├── notificationService.ts  # نظام الإشعارات
│   │   └── backgroundJobs.ts       # المهام الدورية
│   ├── db.ts                        # مساعدات قاعدة البيانات
│   ├── routers.ts                   # مسارات tRPC
│   └── _core/                       # البنية الأساسية
│       ├── trpc.ts                 # إعداد tRPC
│       ├── context.ts              # السياق والمصادقة
│       └── ...
│
├── drizzle/
│   ├── schema.ts                    # تعريف جداول قاعدة البيانات
│   └── migrations/                  # ملفات الهجرة
│
├── shared/                          # الأنواع والثوابت المشتركة
│   └── const.ts
│
└── package.json
```

---

## 🔌 التكاملات الخارجية

### 1. Polymarket Gamma API

**الغرض:** جلب بيانات الأسواق الحقيقية

```typescript
// مثال
const markets = await polymarketClient.getMarkets();
// النتيجة: 50 سوق مع الأسعار والحجم والسيولة
```

**الـ Endpoints:**
- `GET /markets` - قائمة الأسواق
- `GET /markets/{id}` - تفاصيل السوق

**المميزات:**
- لا يتطلب مصادقة
- بيانات حقيقية مباشرة من Polymarket
- تحديثات فورية

### 2. Twitter API (via RapidAPI)

**الغرض:** تحليل المشاعر والاتجاهات

```typescript
// مثال
const tweets = await twitterClient.searchTweets("Bitcoin prediction");
const sentiment = twitterClient.aggregateSentiment(tweets);
// النتيجة: تحليل المشاعر (إيجابي/سلبي/محايد)
```

**الـ Endpoints:**
- `GET /search` - البحث عن التغريدات
- `GET /trends` - الاتجاهات الحالية

**المميزات:**
- تحليل المشاعر التلقائي
- كشف الاتجاهات
- حساب درجة الملاءمة

---

## 🧠 محرك اتخاذ القرارات

### الخوارزمية

```
1. جلب بيانات السوق الحقيقية
   ↓
2. حساب مؤشر RSI (Relative Strength Index)
   - RSI > 70: السوق في ذروة الشراء (SELL)
   - RSI < 30: السوق في ذروة البيع (BUY)
   - 30-70: محايد (HOLD)
   ↓
3. جلب تحليل المشاعر من Twitter
   - درجة إيجابية: تقوي إشارة BUY
   - درجة سلبية: تقوي إشارة SELL
   ↓
4. دمج الإشارات
   - الثقة = (RSI Score + Sentiment Score) / 2
   ↓
5. إدارة المخاطر
   - حساب حجم المركز
   - تحديد Stop Loss و Take Profit
   ↓
6. تنفيذ التداول الافتراضي
   - تسجيل الصفقة
   - حساب P&L
```

### مثال عملي

```
السوق: "Will Bitcoin reach $100,000 by end of 2025?"
السعر الحالي: 65% (نعم)

RSI Analysis:
- RSI = 72 → ذروة شراء → SELL Signal

Twitter Sentiment:
- 60% tweets إيجابية
- Sentiment Score = 0.60

Decision:
- Signal: SELL (من RSI)
- Confidence: (72% + 60%) / 2 = 66%
- Position Size: 1% من المحفظة
- Stop Loss: 70% (خسارة 5%)
- Take Profit: 60% (ربح 5%)
```

---

## 📊 قاعدة البيانات

### الجداول الرئيسية

```sql
-- الأسواق
CREATE TABLE kalshi_markets (
  id TEXT PRIMARY KEY,
  question TEXT,
  slug TEXT,
  volume DECIMAL,
  yes_price DECIMAL,
  no_price DECIMAL,
  category TEXT,
  end_date TIMESTAMP,
  liquidity DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- الطلبات والصفقات
CREATE TABLE trading_orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  market_id TEXT,
  side TEXT, -- 'buy' or 'sell'
  quantity INTEGER,
  entry_price DECIMAL,
  current_price DECIMAL,
  stop_loss DECIMAL,
  take_profit DECIMAL,
  status TEXT, -- 'open', 'closed', 'stopped'
  pnl DECIMAL,
  created_at TIMESTAMP,
  closed_at TIMESTAMP
);

-- قرارات الـ AI
CREATE TABLE ai_decisions (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  market_id TEXT,
  signal TEXT, -- 'BUY', 'SELL', 'HOLD'
  confidence DECIMAL,
  reason TEXT,
  created_at TIMESTAMP
);

-- لقطات المحفظة
CREATE TABLE portfolio_snapshots (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  total_balance DECIMAL,
  available_balance DECIMAL,
  realized_pnl DECIMAL,
  unrealized_pnl DECIMAL,
  win_rate DECIMAL,
  created_at TIMESTAMP
);
```

---

## 🧪 الاختبارات

```bash
# تشغيل جميع الاختبارات
pnpm test

# تشغيل اختبار معين
pnpm test server/services/polymarketClient.test.ts

# مع التغطية
pnpm test -- --coverage
```

**الاختبارات الحالية:**
- ✅ Trading Decision Engine (9 اختبارات)
- ✅ Paper Trading Engine (12 اختبار)
- ✅ Notification Service (12 اختبار)
- ✅ Polymarket Client (4 اختبارات)
- ✅ Authentication (1 اختبار)

**المجموع: 38 اختبار** ✅

---

## 🔐 متغيرات البيئة

```env
# قاعدة البيانات
DATABASE_URL=postgresql://user:password@localhost:5432/kalshi_trading_bot

# المصادقة
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# APIs الخارجية
RAPIDAPI_KEY=your-rapidapi-key
TWITTER_API_HOST=twitter-api45.p.rapidapi.com

# Polymarket (اختياري - يستخدم Gamma API العام)
POLYMARKET_JWT_TOKEN=your-jwt-token

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
```

---

## 📈 الميزات الحالية

- ✅ جلب بيانات حقيقية من Polymarket
- ✅ تحليل المشاعر من Twitter
- ✅ محرك تداول ذكي (RSI + Sentiment)
- ✅ محاكاة تداول افتراضية
- ✅ لوحة تحكم حية
- ✅ نظام إشعارات
- ✅ إدارة المخاطر
- ✅ تقارير الأداء

---

## 🚀 الميزات المستقبلية

1. **WebSocket للتحديثات الفورية**
   - استبدال الاستطلاع بـ WebSocket
   - تقليل الكمون من 10 ثوانٍ إلى <100ms

2. **استراتيجيات تداول متعددة**
   - MACD (Moving Average Convergence Divergence)
   - Moving Averages (MA)
   - Bollinger Bands
   - مقارن الأداء بين الاستراتيجيات

3. **تقارير متقدمة**
   - Sharpe Ratio
   - Sortino Ratio
   - Maximum Drawdown
   - تصدير PDF

4. **التعلم الآلي**
   - تحسين نماذج التنبؤ
   - تحليل الأنماط التاريخية
   - تحسين معاملات الإشارات

5. **التداول الحقيقي**
   - تكامل مع Kalshi API
   - تنفيذ الصفقات الحقيقية
   - إدارة المحفظة الحقيقية

---

## 📞 الدعم والمساهمة

للإبلاغ عن المشاكل أو المساهمة في المشروع، يرجى فتح issue أو pull request على GitHub.

---

## 📄 الترخيص

MIT License - انظر ملف LICENSE للتفاصيل.

---

## 👨‍💻 المطور

تم بناء هذا المشروع بواسطة فريق التطوير.

---

**آخر تحديث:** مارس 2026
**الإصدار:** 1.0.0
**الحالة:** جاهز للإنتاج ✅
