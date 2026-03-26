# Polymarket API Integration

## API Endpoints

Polymarket provides **three separate APIs**:

### 1. Gamma API (Public - No Auth Required)
- **Base URL:** `https://gamma-api.polymarket.com`
- **Purpose:** Markets, events, tags, series, comments, sports, search, and public profiles
- **Key Endpoints:**
  - `GET /events` - List events
  - `GET /markets` - List markets
  - `GET /markets/{id}` - Get market by ID
  - `GET /markets?slug={slug}` - Get market by slug

### 2. Data API (Public - No Auth Required)
- **Base URL:** `https://data-api.polymarket.com`
- **Purpose:** User positions, trades, activity, holder data, open interest, leaderboards
- **Key Endpoints:**
  - `GET /user/{address}/positions` - Get user positions
  - `GET /user/{address}/trades` - Get user trades
  - `GET /leaderboard` - Get trader leaderboard

### 3. CLOB API (Mixed Auth)
- **Base URL:** `https://clob.polymarket.com`
- **Purpose:** Orderbook data, pricing, trading operations
- **Public Endpoints:** Order book, prices, spreads
- **Authenticated Endpoints:** Order placement, cancellation

## Current Implementation Issue

The JWT token provided is for **Heisenberg/Narrative API** (`https://narrative.agent.heisenberg.so`), which is a **different service** from the standard Polymarket APIs above.

### Options:

#### Option 1: Use Standard Polymarket APIs (Recommended)
- No authentication required
- Fully public data
- Simpler implementation
- No JWT token needed

#### Option 2: Use Heisenberg/Narrative API
- Requires valid JWT token
- Provides AI-powered insights
- More complex setup
- Currently returning 404 errors

## Recommendation

Switch to **Gamma API** for real market data:
- No authentication required
- Direct access to real Polymarket markets
- Simple REST endpoints
- Reliable and well-documented

## Example Request

```bash
# Get markets from Gamma API (no auth needed)
curl -X GET "https://gamma-api.polymarket.com/markets?limit=50"

# Response includes:
# - id, question, slug
# - volume, liquidity
# - yes_price, no_price
# - created_at, end_date
```

## Next Steps

1. Update `polymarketClient.ts` to use Gamma API
2. Remove JWT token requirement
3. Get real market data directly from Polymarket
4. Test with real data
