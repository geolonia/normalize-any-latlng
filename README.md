# normalize-any-latlng

[![build](https://github.com/geolonia/normalize-any-latlng/actions/workflows/test.yml/badge.svg)](https://github.com/geolonia/normalize-any-latlng/actions/workflows/test.yml)

`@geolonia/normalize-any-latLng` is a tool for normalizing Latitude and Longitude strings.

Here are some examples of how to use it:

```shell
$ npx -p @geolonia/normalize-any-latlng normalize-any-latlng '29°31′55″N 35°00′20″E' # 29.531944444444445 35.00555555555555
$ npx -p @geolonia/normalize-any-latlng normalize-any-latlng '북위37°34′00″ 동경126°58′41″' # 37.56666666666667 126.97805555555556
$ npx -p @geolonia/normalize-any-latlng normalize-any-latlng '남위34°36′12″ 서경58°22′54″' # -34.60333333333333 -58.38166666666667
$ npx -p @geolonia/normalize-any-latlng normalize-any-latlng '北緯32度53分9.35秒 東経130度11分9.34秒' # 32.885930555555554 130.18592777777778
$ npx -p @geolonia/normalize-any-latlng normalize-any-latlng '45°24′N 75°40′W' # 45.4 -75.66666666666667
```

You can see more normalization examples in [src/index.test.ts](./src/index.test.ts).

## development

```shell
$ git clone https://github.com/geolonia/normalize-any-latlng.git
$ cd normalize-any-latlng
$ npm install
$ npm test
```

## Usage

```shell
$ npm install @geolonia/normalize-any-latlng
```

### CLI

```shell
$ npx @geolonia/normalize-any-latlng '北緯32度53分9.35秒 東経130度11分9.34秒' # 32.885930556 130.185927778
```

### JavaScript/TypeScript


```javascript
import { normalize } from '@geolonia/normalize-any-latlng'
const result = normalize('北緯32度53分9.35秒 東経130度11分9.34秒')

assert(result[0].lat === 32.885930556)
assert(result[0].lng === 130.185927778)
```
