# normalize-any-latlng

[![build](https://github.com/geolonia/normalize-any-latlng/actions/workflows/test.yml/badge.svg)](https://github.com/geolonia/normalize-any-latlng/actions/workflows/test.yml)

Normalize Any LatLng is a human readable Latitude/Longitude string normalizer.
You can see some examples in [src/index.test.ts](./src/index.test.ts).

## development

```shell
$ yarn
$ yarn test
```

## install

```shell
$ yarn add https://github.com/geolonia/normalize-any-latlng.git#latest
```

## Usage

### CLI

```shell
$ npx @geolonia/normalize-any-latlng '北緯32度53分9.35秒 東経130度11分9.34秒'
32.885930556 130.185927778
```

### JavaScript


```javascript
import { normalize } from '@geolonia/normalize-any-latlng'
const result = normalize('北緯32度53分9.35秒 東経130度11分9.34秒')

result[0].lat === 32.885930556  // true
result[0].lng === 130.185927778 // true
```
