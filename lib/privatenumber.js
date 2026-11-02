export const PRIVATE_NUMBER_BASE =
  String(process.env.TEMP_NUMBER_API_BASE || '').trim() || 'https://api.temp-number.com/v1';

const DEFAULT_TIMEOUT = 25000;

export function apiToken() {
  return String(process.env.TEMP_NUMBER_API_TOKEN || '').trim();
}

export function tokenConfigured() {
  return apiToken().length > 0;
}

export function setupHint() {
  return 'Private numbers are not connected yet. Add TEMP_NUMBER_API_TOKEN to your environment (get a token from the provider dashboard under API Access), then reload.';
}

function buildUrl(path, query) {
  const url = new URL(PRIVATE_NUMBER_BASE.replace(/\/+$/, '') + path);
  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function friendlyNetworkError(err) {
  const message = String((err && err.message) || '');
  if (/abort/i.test(message)) return 'The provider took too long to respond. Try again.';
  return 'Could not reach the private number provider. Try again in a moment.';
}

export async function tnCall(path, options = {}) {
  const token = apiToken();
  if (!token) {
    return { ok: false, status: 503, code: 'not_configured', error: setupHint() };
  }
  const method = String(options.method || 'GET').toUpperCase();
  const url = buildUrl(path, options.query);
  const headers = {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token
  };
  let body;
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  if (options.idempotencyKey) headers['Idempotency-Key'] = String(options.idempotencyKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
  try {
    const res = await fetch(url, { method, headers, body, cache: 'no-store', signal: controller.signal });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        code: (json && (json.code || json.error)) || 'provider_error',
        error: (json && (json.message || json.error)) || 'The provider rejected the request.',
        details: (json && json.details) || text.slice(0, 300),
        json
      };
    }
    return {
      ok: true,
      status: res.status,
      json,
      data: json && Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json,
      meta: (json && json.meta) || null
    };
  } catch (e) {
    return { ok: false, status: 502, code: 'network_error', error: friendlyNetworkError(e) };
  } finally {
    clearTimeout(timer);
  }
}

function pick(obj, keys, fallback) {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function unwrap(payload) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
}

function firstArray(value) {
  const source = unwrap(value);
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== 'object') return [];
  const preferred = ['data', 'items', 'results', 'countries', 'inventory', 'numbers', 'packages', 'messages', 'list'];
  for (const key of preferred) {
    if (Array.isArray(source[key])) return source[key];
  }
  for (const value2 of Object.values(source)) {
    if (Array.isArray(value2)) return value2;
  }
  return [];
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toPrice(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'object') {
    return toNumber(pick(value, ['amount', 'price', 'value', 'usd'], null));
  }
  const n = toNumber(String(value).replace(/[^0-9.\-]/g, ''));
  return n;
}

function toCurrency(value, fallback) {
  const raw = String(value || '').trim().toUpperCase();
  return raw || fallback || 'USD';
}

function normalizePackage(raw, fallbackCurrency) {
  if (typeof raw === 'string') {
    return { key: raw, label: raw, price: null, currency: fallbackCurrency, free: false };
  }
  const key = String(pick(raw, ['duration', 'key', 'id', 'code', 'slug'], 'oneMonth'));
  const price = toPrice(pick(raw, ['price', 'amount', 'cost', 'total', 'unit_price'], null));
  return {
    key,
    label: String(pick(raw, ['label', 'name', 'title', 'duration_label'], key)),
    price,
    currency: toCurrency(pick(raw, ['currency', 'ccy'], ''), fallbackCurrency),
    free: price === 0
  };
}

export function normalizeCatalog(payload) {
  const metaCurrency = toCurrency(pick(payload, ['currency', 'settlement_currency'], ''), 'USD');
  const rows = firstArray(payload);
  const countries = rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const code = String(pick(row, ['country_code', 'code', 'iso', 'iso2', 'countryCode'], '')).toUpperCase();
      const name = String(pick(row, ['country_name', 'name', 'label', 'country'], code));
      if (!code && !name) return null;
      const rawPackages = pick(row, ['packages', 'durations', 'prices', 'plans'], []);
      const packages = (Array.isArray(rawPackages) ? rawPackages : [])
        .map((p) => normalizePackage(p, metaCurrency))
        .filter((p) => p.key);
      const freeCount = packages.filter((p) => p.free).length;
      return {
        code,
        name,
        flag: String(pick(row, ['flag', 'emoji'], '')),
        packages,
        freeCount,
        cheapest: packages.reduce((min, p) => (p.price !== null && (min === null || p.price < min) ? p.price : min), null),
        currency: metaCurrency
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  return { countries, currency: metaCurrency };
}

export function normalizeInventory(payload) {
  const rows = firstArray(payload);
  const items = rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const code = String(pick(row, ['country_code', 'code', 'iso', 'country'], '')).toUpperCase();
      const name = String(pick(row, ['country_name', 'name', 'country'], code));
      const available = toNumber(pick(row, ['available', 'in_stock', 'stock', 'count', 'quantity', 'units'], null));
      return {
        code,
        name,
        flag: String(pick(row, ['flag', 'emoji'], '')),
        available,
        types: firstArray(pick(row, ['types', 'number_types', 'routes'], [])).map((t) =>
          typeof t === 'string' ? t : String(pick(t, ['type', 'id', 'name'], ''))
        ).filter(Boolean),
        price: toPrice(pick(row, ['price', 'amount', 'from', 'starting_price'], null))
      };
    })
    .filter((row) => row && (row.code || row.name));
  return { items };
}

export function normalizeNumbers(payload) {
  const rows = firstArray(payload);
  const items = rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const id = pick(row, ['id', 'number_id', 'uuid'], null);
      const number = String(pick(row, ['phone_number', 'number', 'msisdn', 'phone'], ''));
      if (!id && !number) return null;
      return {
        id,
        number,
        code: String(pick(row, ['country_code', 'country'], '')).toUpperCase(),
        country: String(pick(row, ['country_name', 'country'], '')),
        flag: String(pick(row, ['flag', 'emoji'], '')),
        type: String(pick(row, ['number_type', 'type'], '')),
        status: String(pick(row, ['status', 'state'], '')),
        purchased: String(pick(row, ['purchase_date', 'created_at', 'bought_at'], '')),
        expires: String(pick(row, ['expire_date', 'expires_at', 'expiry'], '')),
        email: String(pick(row, ['email', 'email_address', 'privnum_email'], ''))
      };
    })
    .filter(Boolean);
  return { items };
}

export function normalizeMessages(payload) {
  const rows = firstArray(payload);
  const items = rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const message = String(pick(row, ['message', 'body', 'text', 'content', 'sms'], ''));
      const code = String(pick(row, ['otp', 'code', 'verification_code', 'pin'], ''));
      const sender = String(pick(row, ['sender', 'from', 'originator'], ''));
      if (!message && !code) return null;
      return {
        sender,
        message,
        code,
        time: String(pick(row, ['time', 'received_at', 'created_at', 'date'], ''))
      };
    })
    .filter(Boolean);
  return { items };
}

export function normalizeAccount(payload) {
  const source = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object' ? payload.data : payload;
  return {
    balance: toPrice(pick(source, ['balance', 'wallet_balance', 'credit', 'funds'], null)),
    currency: toCurrency(pick(source, ['currency', 'settlement_currency'], ''), 'USD'),
    name: String(pick(source, ['name', 'account_name', 'email'], '')),
    email: String(pick(source, ['email'], ''))
  };
}

export function formatMoney(amount, currency) {
  if (amount === null || amount === undefined) return '—';
  const cur = currency || 'USD';
  const value = Number(amount);
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return cur === 'USD' ? '$' + formatted : formatted + ' ' + cur;
}
