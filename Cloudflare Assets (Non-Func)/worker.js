const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Action',
};

const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    try {
      // ── Password verification endpoint ──
      // Must run BEFORE request.formData(), because this request has a JSON body.
      if (request.headers.get('X-Action') === 'verify-password') {
        const body = await request.json();
        const valid = !!env.ADD_BOOK_PASSWORD && body.password === env.ADD_BOOK_PASSWORD;
        return new Response(JSON.stringify({ valid }), {
          status: 200, headers: JSON_HEADERS
        });
      }

      // ── ISBN lookup endpoint (also JSON body, so before formData()) ──
      if (request.headers.get('X-Action') === 'lookup-isbn') {
        const body = await request.json();
        let isbn = String(body.isbn || '').replace(/[^0-9Xx]/g, '').toUpperCase();
        if (isbn.length !== 10 && isbn.length !== 13) {
          return new Response(JSON.stringify({ found: false, error: 'Invalid ISBN' }), {
            status: 400, headers: JSON_HEADERS
          });
        }
        const { result, debug } = await lookupISBN(isbn);
        // "debug" is attached only when nothing was found, so failures can be diagnosed
        return new Response(JSON.stringify(result ? { found: true, ...result } : { found: false, debug }), {
          status: 200, headers: JSON_HEADERS
        });
      }

      // ── Book upload endpoint ──
      const formData = await request.formData();

      // Protect the upload with the same password
      if (!env.ADD_BOOK_PASSWORD || formData.get('password') !== env.ADD_BOOK_PASSWORD) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: JSON_HEADERS
        });
      }

      const bookJson = formData.get('book');
      const coverFile = formData.get('cover');
      const contentsFiles = formData.getAll('contents').filter((f) => f && typeof f !== 'string' && f.size > 0);

      if (!bookJson) {
        return new Response(JSON.stringify({ error: 'Missing book data' }), {
          status: 400, headers: JSON_HEADERS
        });
      }

      const book = JSON.parse(bookJson);
      const { stk, title } = book;
      const xx = stk.split('-')[0];

      const FOLDER_MAP = {
        "01":"01-Cestina","02":"02-Anglictina","03":"03-Nemcina",
        "04":"04-Spanelstina","05":"05-Matematika","06":"06-Ekonomie",
        "07":"07-Fyzika","08":"08-Chemie","09":"09-Biologie",
        "10":"10-Zemepis","11":"11-Historie","12":"12-IT",
        "13":"13-Hudebka","14":"14-Telocvik","15":"15-Vytvarka","16":"16-Vareni",
      };

      const subjectFolder = FOLDER_MAP[xx] || 'Ostatni';
      const bookFolder = `BOOK_FILES/${subjectFolder}/${title}`;
      const errors = [];

      // ── Upload JSON ──
      const jsonContent = btoa(unescape(encodeURIComponent(JSON.stringify(book, null, 2))));
      const jsonResult = await uploadToGitHub(
        env, `${bookFolder}/${title}.json`, jsonContent, `Přidána kniha: ${title}`
      );
      if (!jsonResult.ok) errors.push(`JSON: ${await jsonResult.text()}`);

      // ── Upload cover if provided ──
      if (coverFile && coverFile.size > 0) {
        const coverB64 = await fileToBase64(coverFile);
        const coverResult = await uploadToGitHub(
          env, `${bookFolder}/${coverFile.name}`, coverB64, `Obálka: ${title}`
        );
        if (!coverResult.ok) errors.push(`Cover: ${await coverResult.text()}`);
      }

      // ── Upload contents pages (one or several) ──
      // Sequential on purpose: parallel commits to the same branch can conflict on GitHub.
      for (const file of contentsFiles) {
        const b64 = await fileToBase64(file);
        const result = await uploadToGitHub(
          env, `${bookFolder}/${file.name}`, b64, `Obsah: ${title}`
        );
        if (!result.ok) errors.push(`Contents (${file.name}): ${await result.text()}`);
      }

      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: errors.join(', ') }), {
          status: 500, headers: JSON_HEADERS
        });
      }

      return new Response(JSON.stringify({ success: true, stk, folder: bookFolder }), {
        status: 200, headers: JSON_HEADERS
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: JSON_HEADERS
      });
    }
  }
};

async function uploadToGitHub(env, path, content, message) {
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`;

  // Check if file already exists (to get SHA for update)
  let sha = undefined;
  const check = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'AK-Knihovna-Worker',
    }
  });
  if (check.ok) {
    const existing = await check.json();
    sha = existing.sha;
  }

  return fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'AK-Knihovna-Worker',
    },
    body: JSON.stringify({ message, content, ...(sha ? { sha } : {}) }),
  });
}

async function fileToBase64(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

// ════════════════════════════════════════════════════════════════
//  ISBN LOOKUP  (runs on the server, so no browser CORS problems)
//  Sources are queried in parallel and merged field by field:
//  Open Library  →  K10plus (large German/European union catalogue)  →  DNB
// ════════════════════════════════════════════════════════════════
const UA = 'AK-Knihovna-Worker/1.0 (school library project)';

function isbn10to13(isbn) {
  if (isbn.length !== 10) return isbn;
  const core = '978' + isbn.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(core[i]) * (i % 2 === 0 ? 1 : 3);
  return core + ((10 - (sum % 10)) % 10);
}

async function getJson(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    redirect: 'follow',
    signal: AbortSignal.timeout(7000),
  });
  if (!r.ok) return null;
  return r.json();
}

const textOf = (d) => (typeof d === 'string' ? d : d?.value || '');

function isbn13to10(isbn13) {
  if (!isbn13.startsWith('978') || isbn13.length !== 13) return '';
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
}

// Hyphenation for Czech/Slovak ISBNs (group 80). Aleph's ISBN index is hyphen-sensitive.
// Registrant length by range: 00-19 -> 2, 200-699 -> 3, 7000-8499 -> 4, 85000-89999 -> 5, 900000-999999 -> 6
function hyphenateCz(isbn13) {
  if (!isbn13.startsWith('97880') || isbn13.length !== 13) return null;
  const rest = isbn13.slice(5, 12);
  const d = rest[0];
  let len;
  if (d === '0' || d === '1') len = 2;
  else if ('23456'.includes(d)) len = 3;
  else if (d === '7' || (d === '8' && Number(rest[1]) <= 4)) len = 4;
  else if (d === '8') len = 5;
  else len = 6;
  const reg = rest.slice(0, len);
  const pub = rest.slice(len);
  const isbn10 = isbn13to10(isbn13);
  return {
    h13: `978-80-${reg}-${pub}-${isbn13[12]}`,
    h10: isbn10 ? `80-${reg}-${pub}-${isbn10[9]}` : '',
  };
}

async function lookupISBN(isbnRaw) {
  const isbn13 = isbn10to13(isbnRaw);
  const isbn10 = isbnRaw.length === 10 ? isbnRaw : isbn13to10(isbn13);
  const hy = hyphenateCz(isbn13);
  // Order matters for the Aleph catalogue: hyphenated forms first
  const ids = [hy?.h13, hy?.h10, isbn13, isbn10].filter(Boolean);

  const nkcr = ['Národní knihovna ČR', (t) => fromNKCR(ids, isbn13, t)];
  const rest = [
    ['Open Library', () => fromOpenLibrary(isbn13)],
    ['K10plus', () => fromK10plus(isbn13)],
    ['DNB', () => fromDNB(isbn13)],
  ];
  // Czech/Slovak ISBNs (978-80) -> Czech catalogues have priority; otherwise they are fallbacks.
  const isCzech = isbn13.startsWith('97880');
  const sources = isCzech ? [nkcr, ...rest] : [...rest, nkcr];

  const traces = sources.map(() => []);
  const settled = await Promise.allSettled(sources.map(([, fn], i) => fn(traces[i])));

  const merged = { title: '', author: '', year: '', description: '', keywords: [], sources: [] };
  const debug = { isbn: isbn13, tried: ids };
  settled.forEach((res, i) => {
    const name = sources[i][0];
    if (res.status === 'rejected') {
      debug[name] = { result: 'error', error: String(res.reason?.message || res.reason), trace: traces[i] };
      return;
    }
    if (!res.value || !res.value.title) {
      debug[name] = { result: 'nothing found', trace: traces[i] };
      return;
    }
    debug[name] = { result: 'ok' };
    const r = res.value;
    merged.sources.push(name);
    for (const f of ['title', 'author', 'year', 'description']) {
      if (!merged[f] && r[f]) merged[f] = r[f];
    }
    if (!merged.keywords.length && r.keywords?.length) merged.keywords = r.keywords;
  });

  return { result: merged.title ? merged : null, debug };
}

// ── Czech National Library (Aleph X-service) ──
async function alephFetch(query, trace, tries = 4) {
  // The catalogue blocks some Cloudflare egress IPs. Each attempt may leave from a different IP,
  // so a few retries often get through.
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const r = await fetch(`https://aleph.nkp.cz/X?${query}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(6000),
      });
      const text = await r.text();
      trace.push({ attempt, status: r.status, body: text.slice(0, 120).replace(/\s+/g, ' ') });
      // Aleph reports blocks as an HTML error page (sometimes with status 200): treat as failure
      if (r.ok && !/^\s*<html/i.test(text)) return text;
    } catch (e) {
      trace.push({ attempt, error: String(e.message || e) });
    }
    if (attempt < tries) await new Promise((res) => setTimeout(res, 250));
  }
  return null;
}

async function fromNKCR(ids, id13, trace) {
  const searches = ids.map((id) => `sbn=${id}`).concat(`wrd=${id13}`);

  for (const base of ['nkc', 'skc']) {
    for (const request of searches) {
      const found = await alephFetch(`op=find&base=${base}&request=${encodeURIComponent(request)}`, trace);
      if (found === null) return null; // catalogue unreachable/blocked: stop here, the trace shows why
      const set = found?.match(/<set_number>\s*(\d+)\s*<\/set_number>/)?.[1];
      const count = Number(found?.match(/<no_records>\s*(\d+)\s*<\/no_records>/)?.[1] || 0);
      if (!set || count < 1) continue;

      const xml = await alephFetch(`op=present&base=${base}&set_number=${set}&set_entry=1`, trace);
      const rec = xml ? parseMarc(xml) : null;
      if (rec) return rec;
    }
  }
  return null;
}

// ── Open Library ──
async function fromOpenLibrary(isbn) {
  const out = { keywords: [] };
  const ed = await getJson(`https://openlibrary.org/isbn/${isbn}.json`);

  if (ed && ed.title) {
    out.title = ed.title;
    out.year = (ed.publish_date || '').match(/\d{4}/)?.[0] || '';
    out.description = textOf(ed.description);

    if (ed.authors?.length) {
      const names = await Promise.all(
        ed.authors.slice(0, 3).map((a) =>
          getJson(`https://openlibrary.org${a.key}.json`).then((j) => j?.name).catch(() => null)
        )
      );
      out.author = names.filter(Boolean).join(', ');
    }

    const workKey = ed.works?.[0]?.key;
    if (workKey) {
      const w = await getJson(`https://openlibrary.org${workKey}.json`).catch(() => null);
      if (w) {
        if (!out.description) out.description = textOf(w.description);
        if (w.subjects?.length) out.keywords = w.subjects.slice(0, 3);
      }
    }
    return out;
  }

  // Fallback: search index
  const s = await getJson(
    `https://openlibrary.org/search.json?q=isbn:${isbn}&fields=title,author_name,first_publish_year,subject&limit=1`
  );
  const d = s?.docs?.[0];
  if (!d?.title) return null;
  return {
    title: d.title,
    author: (d.author_name || []).slice(0, 3).join(', '),
    year: d.first_publish_year ? String(d.first_publish_year) : '',
    description: '',
    keywords: (d.subject || []).slice(0, 3),
  };
}

// ── Library catalogues via SRU (MARCXML) ──
function fromK10plus(isbn) {
  return fromSRU(
    `https://sru.k10plus.de/gvk?version=1.1&operation=searchRetrieve&maximumRecords=1&recordSchema=marcxml&query=${encodeURIComponent('pica.isb=' + isbn)}`
  );
}

function fromDNB(isbn) {
  return fromSRU(
    `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&maximumRecords=1&recordSchema=MARC21-xml&query=${encodeURIComponent('isbn=' + isbn)}`
  );
}

async function fromSRU(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  return parseMarc(await r.text());
}

// Works for MARCXML (datafield/code) and Aleph oai_marc (varfield/label)
function parseMarc(xml) {
  if (!/datafield|varfield/.test(xml)) return null;

  const title = cleanMarc(marcSubfields(xml, '245')[0]?.a);
  if (!title) return null;

  const authorRaw = marcSubfields(xml, '100')[0]?.a || marcSubfields(xml, '700')[0]?.a || '';
  const imprint = marcSubfields(xml, '264')[0]?.c || marcSubfields(xml, '260')[0]?.c || '';

  const kw = [];
  for (const tag of ['650', '653', '689', '655']) {
    for (const f of marcSubfields(xml, tag)) {
      const v = cleanMarc(f.a);
      if (v && !kw.includes(v)) kw.push(v);
    }
  }

  return {
    title,
    author: flipName(cleanMarc(authorRaw)),
    year: imprint.match(/\d{4}/)?.[0] || '',
    description: cleanMarc(marcSubfields(xml, '520')[0]?.a),
    keywords: kw.slice(0, 3),
  };
}

function decodeXml(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');
}

function marcSubfields(xml, tag) {
  const results = [];
  const fieldRe = new RegExp(
    `<(?:\\w+:)?(?:datafield|varfield)[^>]*\\b(?:tag|id)="${tag}"[^>]*>([\\s\\S]*?)</(?:\\w+:)?(?:datafield|varfield)>`, 'g'
  );
  let m;
  while ((m = fieldRe.exec(xml))) {
    const subs = {};
    const subRe = /<(?:\w+:)?subfield[^>]*\b(?:code|label)="(\w)"[^>]*>([\s\S]*?)<\/(?:\w+:)?subfield>/g;
    let sf;
    while ((sf = subRe.exec(m[1]))) {
      if (!(sf[1] in subs)) subs[sf[1]] = decodeXml(sf[2]).trim();
    }
    results.push(subs);
  }
  return results;
}

function cleanMarc(s) {
  if (!s) return '';
  return s
    .replace(/[\u0098\u009c\u00ac]/g, '')       // non-sorting markers
    .replace(/[\s\/:;,=]+$/, '')                 // trailing ISBD punctuation
    .trim();
}

function flipName(name) {
  // "Tolkien, J. R. R." -> "J. R. R. Tolkien"
  const parts = name.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
}
