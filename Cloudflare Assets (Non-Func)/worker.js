const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
      const formData = await request.formData();
      const bookJson = formData.get('book');
      const coverFile = formData.get('cover');
      const contentsFile = formData.get('contents');

      if (!bookJson) {
        return new Response(JSON.stringify({ error: 'Missing book data' }), {
          status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
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

      // ── Upload contents page if provided ──
      if (contentsFile && contentsFile.size > 0) {
        const contentsB64 = await fileToBase64(contentsFile);
        const contentsResult = await uploadToGitHub(
          env, `${bookFolder}/${contentsFile.name}`, contentsB64, `Obsah: ${title}`
        );
        if (!contentsResult.ok) errors.push(`Contents: ${await contentsResult.text()}`);
      }

      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: errors.join(', ') }), {
          status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, stk, folder: bookFolder }), {
        status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
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
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
