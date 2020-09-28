# B2Trader

Node.js library for the B2Trader's API.

## Installation

```bash
npm install b2trader
```

## Usage

### PublicClient

```typescript
import { PublicClient } from "B2Trader";
const url = "https://api.b2bx.exchange:8443/trading"; // B2Trader's url
const client = new PublicClient({ url });
```

- `.getInstruments()`

```typescript
const instruments = await client.getInstruments();
```

## Test

```bash
npm test
```
