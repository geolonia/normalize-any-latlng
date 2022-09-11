# normalize-any-latlng

Normalize Any LatLng or (NAL) is a human readable Latitude/Longitude string normalizer.

## development

```shell
$ yarn
$ yarn test
```

## install

### CLI

```shell
$ yarn add global git@github.com:geolonia/normalize-any-latlng.git#latest
$ normalize-any-latlng '北緯32度53分9.35秒 東経130度11分9.34秒'
```

### JavaScript

```javascript
import { normalize } from '@geolonia/normalize-any-latlng'
const result = normalize('北緯32度53分9.35秒 東経130度11分9.34秒')

result[0].lat === 32.885930556  // true
result[0].lng === 130.185927778 // true
```
