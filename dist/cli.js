import { normalize } from './index';
const latlngStr = process.argv[2];
if (!latlngStr) {
    process.stderr.write(`Invalid LatLng string: ${latlngStr}\n`);
    process.exit(1);
}
else {
    const [{ lat, lng }] = normalize(latlngStr);
    process.stdout.write(`${lat} ${lng}\n`);
    process.exit(0);
}
