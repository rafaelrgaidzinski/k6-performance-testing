import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Trend existente
export const getProductsDuration = new Trend('get_products_duration', true);
export const getProductsWaiting = new Trend('get_products_waiting', true);
export const RateResponseTimeOK = new Rate('response_time_ok');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    get_products_duration: ['p(90)<6800'],
    get_products_waiting: ['p(90)<5000'],
    response_time_ok: ['rate>0.90']
  },

  stages: [
    { duration: '17s', target: 7 },
    { duration: '17s', target: 15 },
    { duration: '17s', target: 23 },
    { duration: '17s', target: 31 },
    { duration: '17s', target: 39 },
    { duration: '17s', target: 47 },
    { duration: '17s', target: 55 },
    { duration: '17s', target: 63 },
    { duration: '17s', target: 71 },
    { duration: '17s', target: 79 },
    { duration: '17s', target: 87 },
    { duration: '17s', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://fakestoreapi.com';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}/products`, params);

  // Trends
  getProductsDuration.add(res.timings.duration);
  getProductsWaiting.add(res.timings.waiting);

  // Rates
  RateResponseTimeOK.add(res.timings.duration < 2000);

  check(res, {
    'GET Players - Status 200': () => res.status === OK
  });
}
