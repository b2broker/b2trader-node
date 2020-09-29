# B2Trader ![CI](https://github.com/b2broker/b2trader-node/workflows/CI/badge.svg) [![GitHub version](https://badge.fury.io/gh/b2broker%2Fb2trader-node.svg)](https://badge.fury.io/gh/b2broker%2Fb2trader-node) [![npm version](https://badge.fury.io/js/b2trader.svg)](https://badge.fury.io/js/b2trader) [![Known Vulnerabilities](https://snyk.io/test/github/b2broker/b2trader-node/badge.svg)](https://snyk.io/test/github/b2broker/b2trader-node) [![Coverage Status](https://coveralls.io/repos/github/b2broker/b2trader-node/badge.svg?branch=master)](https://coveralls.io/github/b2broker/b2trader-node?branch=master) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![GitHub top language](https://img.shields.io/github/languages/top/b2broker/b2trader-node) ![node-current](https://img.shields.io/node/v/b2trader) ![npm](https://img.shields.io/npm/dt/b2trader) ![License](https://img.shields.io/github/license/b2broker/b2trader-node)

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

- `.getAssets()`

```typescript
const assets = await client.getAssets();
```

- `.getListOfInstruments()`

```typescript
const instruments = await client.getListOfInstruments();
```

- `.getOrderBookSnapshot()`

```typescript
const instrument = "btc_usd";
const snapshot = await client.getOrderBookSnapshot({ instrument });
```

## Test

```bash
npm test
```
