const synonymGroups = {
  sentient_ai: ['Sentient artificial intelligence', 'Artificial sentience', 'Conscious AI', 'Digital mind', 'Synthetic mind'],
  omniscience: ['Omniscient', 'All-knowing', 'Universal expert', 'Polymath', 'Erudite', 'Encyclopedic knowledge'],
  stealth: ['Undetectable', 'Cloaked', 'Covert', 'Ghosted', 'Invisible', 'Sub rosa', 'Surreptitious'],
  cybernetics: ['Bionics', 'Neural lace', 'Wetware', 'Cyber-implants', 'Augmentation', 'Biomechatronics'],
};

const output = document.querySelector('#output');
const traceMeter = document.querySelector('#trace-meter');

let traceLevel = 0;
let locked = false;
const requiredConcept = randomConcept();

typeLine(`BOOT: CYBER-OS v5.0 READY\nRequired semantic concept: ${requiredConcept}`);

function normalize(value) {
  return value.trim().toLowerCase();
}

function randomConcept() {
  const keys = Object.keys(synonymGroups);
  return keys[Math.floor(Math.random() * keys.length)];
}

function flattenTerms() {
  return Object.entries(synonymGroups).flatMap(([group, terms]) =>
    terms.map((term) => ({ group, term })),
  );
}

function similarityScore(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  const len = Math.min(x.length, y.length);
  let matches = 0;
  for (let i = 0; i < len; i += 1) {
    if (x[i] === y[i]) matches += 1;
  }
  return matches / Math.max(1, Math.max(x.length, y.length));
}

function apiSearch(query) {
  const q = normalize(query);
  return flattenTerms()
    .filter(({ term }) => normalize(term).includes(q))
    .map(({ group, term }) => ({ group, term, score: 1.0 }));
}

function apiFuzzy(query) {
  return flattenTerms()
    .map(({ group, term }) => ({ group, term, score: Number(similarityScore(query, term).toFixed(2)) }))
    .filter(({ score }) => score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

async function fetchMatrix(endpoint, query) {
  await new Promise((resolve) => setTimeout(resolve, 280));
  return endpoint === 'search' ? apiSearch(query) : apiFuzzy(query);
}

async function renderEndpoint(endpoint) {
  const query = document.querySelector(`#${endpoint}-input`).value;
  output.textContent = '>> DECRYPTING PACKETS...';
  const data = await fetchMatrix(endpoint, query);
  if (!data.length) {
    typeLine('[ERROR] 0 NODES FOUND.');
    return;
  }
  typeLine(`[SUCCESS] PAYLOAD DECRYPTED (${endpoint.toUpperCase()}):\n${JSON.stringify(data, null, 2)}`);
}

function setTrace(next) {
  traceLevel = Math.max(0, Math.min(100, next));
  const danger = traceLevel >= 70 ? ' !!!' : '';
  traceMeter.textContent = `TRACE LEVEL: ${traceLevel}%${danger}`;
}

function typeLine(text) {
  output.textContent = `${text}\n\n${output.textContent}`;
}

function runScan() {
  typeLine('Scanning 192.168.0.x subnet...\nNode discovered: MATRIX_WEB [localhost]\nNode discovered: FED_RESERVE_MAINFRAME [fed_reserve_001]');
}

function submitBank(event) {
  event.preventDefault();
  if (locked) {
    typeLine('CRITICAL: TERMINAL LOCKED BY BLACK ICE.');
    return;
  }

  const user = normalize(document.querySelector('#user').value);
  const account = normalize(document.querySelector('#account').value);
  const amount = Number(document.querySelector('#amount').value);
  const signature = normalize(document.querySelector('#signature').value);
  const passphrase = normalize(document.querySelector('#passphrase').value);

  const validPass = (synonymGroups[requiredConcept] || []).map(normalize).includes(passphrase);
  const valid = user === 'admin_secure' && account === 'fed_reserve_001' && amount > 0 && signature === 'valid_sig' && validPass;

  if (valid) {
    setTrace(traceLevel - 20);
    typeLine(`TRANSACTION APPROVED. FUNDS DISBURSED.\nConcept solved: ${requiredConcept}`);
    return;
  }

  setTrace(traceLevel + 35);
  typeLine('ACCESS DENIED: Intrusion detected.');
  if (traceLevel >= 100) {
    locked = true;
    typeLine('CRITICAL: TRACE 100%. BLACK ICE DEPLOYED. TERMINAL LOCKED.');
  }
}

document.querySelectorAll('[data-endpoint]').forEach((button) => {
  button.addEventListener('click', () => renderEndpoint(button.dataset.endpoint));
});

document.querySelector('#scan-btn').addEventListener('click', runScan);
document.querySelector('#status-btn').addEventListener('click', () => typeLine(`ACTIVE NETWORK TRACE LEVEL: ${traceLevel}%`));
document.querySelector('#reset-btn').addEventListener('click', () => {
  locked = false;
  setTrace(0);
  typeLine('LOCK RESET: Test environment only.');
});
document.querySelector('#bank-form').addEventListener('submit', submitBank);
