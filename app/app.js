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
  typeLine('Scanning 192.168.0.x subnet...\nNode discovered: MATRIX_WEB [localhost]\nNode discovered: FED_RESERVE_MAINFRAME [fed_reserve_001]\nNode discovered: REGULATED_AI_SETTLEMENT [finance_sim]');
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

// Regulated AI System simulator state (JS mirror of regulated_ai_system.lisp)
const simState = {
  account: { id: 'cust_001', balance: 2500, currency: 'USD' },
  card: { cardNumber: '4111-1111-1111-1111', status: 'active', limit: 900 },
  ledger: [],
  executionLog: [],
  portfolio: [
    { symbol: 'BTC', balance: 1.25 },
    { symbol: 'ETH', balance: 24 },
    { symbol: 'USDC', balance: 10000 },
  ],
  activeTxn: null,
};

function postTransaction(accountId, debit, credit) {
  simState.ledger.unshift({ accountId, debit, credit, timestamp: Date.now() });
}

function transferFunds(amount, merchantId) {
  if (simState.account.balance < amount) return null;
  simState.account.balance -= amount;
  postTransaction(simState.account.id, amount, 0);
  postTransaction(merchantId, 0, amount);
  return 'settled';
}

function reconcileLedger() {
  return simState.ledger.reduce((sum, entry) => sum + (entry.credit - entry.debit), 0);
}

function generateQrPayload(amount, merchantId) {
  return `PAY|CARD:${simState.card.cardNumber}|AMOUNT:${amount}|MERCHANT:${merchantId}`;
}

function processQrPayment() {
  const amount = Number(document.querySelector('#qr-amount').value);
  const merchantId = document.querySelector('#merchant-id').value.trim() || 'merchant_unknown';
  if (simState.card.status !== 'active') {
    typeLine('[QR] PAYMENT DECLINED: card is not active.');
    return;
  }
  if (amount > simState.card.limit) {
    typeLine(`[QR] PAYMENT DECLINED: amount ${amount} > card limit ${simState.card.limit}.`);
    return;
  }
  const settled = transferFunds(amount, merchantId);
  if (!settled) {
    typeLine('[QR] PAYMENT DECLINED: insufficient account balance.');
    return;
  }

  const payload = generateQrPayload(amount, merchantId);
  const net = reconcileLedger();
  typeLine(`[QR] PAYMENT SETTLED\nPayload: ${payload}\nBalance: ${simState.account.balance.toFixed(2)} ${simState.account.currency}\nLedger net (credit-debit): ${net.toFixed(2)}`);
}

function updateTxnReadout() {
  const el = document.querySelector('#txn-status');
  if (!simState.activeTxn) {
    el.textContent = 'TXN: none';
    return;
  }
  const t = simState.activeTxn;
  el.textContent = `TXN: ${t.id} | amount ${t.amount} | status ${t.status}`;
}

function authorizePayment() {
  const amount = Number(document.querySelector('#qr-amount').value) || 1;
  simState.activeTxn = {
    id: `TXN-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    amount,
    status: 'authorized',
  };
  updateTxnReadout();
  typeLine(`[PAYMENT] authorized ${simState.activeTxn.id} for ${amount}.`);
}

function capturePayment() {
  if (!simState.activeTxn) {
    typeLine('[PAYMENT] no transaction to capture.');
    return;
  }
  simState.activeTxn.status = 'captured';
  updateTxnReadout();
  typeLine(`[PAYMENT] captured ${simState.activeTxn.id}.`);
}

function refundPayment() {
  if (!simState.activeTxn) {
    typeLine('[PAYMENT] no transaction to refund.');
    return;
  }
  simState.activeTxn.status = 'refunded';
  updateTxnReadout();
  typeLine(`[PAYMENT] refunded ${simState.activeTxn.id}.`);
}

function stakeAssets(aprPercentage = 6) {
  simState.portfolio = simState.portfolio.map((wallet) => {
    const reward = wallet.balance * (aprPercentage / 100);
    return { ...wallet, balance: Number((wallet.balance + reward).toFixed(6)) };
  });
  typeLine(`[STAKING] Applied ${aprPercentage}% APR reward across portfolio.`);
}

function portfolioAllocation() {
  const total = simState.portfolio.reduce((sum, wallet) => sum + wallet.balance, 0);
  const allocation = simState.portfolio.map((wallet) => ({
    asset: wallet.symbol,
    percentage: total > 0 ? Number(((wallet.balance / total) * 100).toFixed(4)) : 0,
  }));
  typeLine(`[ANALYTICS] Portfolio allocation\n${JSON.stringify(allocation, null, 2)}`);
}

function auditWalletIntegrity(threshold = 5000) {
  const alerts = simState.portfolio
    .filter((wallet) => wallet.balance > threshold)
    .map((wallet) => ({
      alert: 'High balance threshold exceeded',
      wallet: wallet.symbol,
      balance: wallet.balance,
    }));
  typeLine(`[AUDIT] Integrity check\n${JSON.stringify(alerts.length ? alerts : ['No anomalies'], null, 2)}`);
}

function projectGrowth(rate = 9, years = 3) {
  const projected = simState.portfolio.map((wallet) => ({
    asset: wallet.symbol,
    projectedBalance: Number((wallet.balance * ((1 + rate / 100) ** years)).toFixed(6)),
  }));
  typeLine(`[FORECAST] ${years}y at ${rate}% annual growth\n${JSON.stringify(projected, null, 2)}`);
}

function reflectiveCycle() {
  const outcome = document.querySelector('#reflection-outcome').value.trim() || 'no-outcome';
  simState.executionLog.unshift({ timestamp: Date.now(), message: `Outcome integrated: ${outcome}` });
  typeLine(`[REFLECTION] complete\nLatest: ${simState.executionLog[0].message}\nTotal log entries: ${simState.executionLog.length}`);
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
document.querySelector('#qr-btn').addEventListener('click', processQrPayment);
document.querySelector('#auth-btn').addEventListener('click', authorizePayment);
document.querySelector('#capture-btn').addEventListener('click', capturePayment);
document.querySelector('#refund-btn').addEventListener('click', refundPayment);
document.querySelector('#stake-btn').addEventListener('click', () => stakeAssets(6));
document.querySelector('#alloc-btn').addEventListener('click', portfolioAllocation);
document.querySelector('#audit-btn').addEventListener('click', () => auditWalletIntegrity(5000));
document.querySelector('#growth-btn').addEventListener('click', () => projectGrowth(9, 3));
document.querySelector('#reflect-btn').addEventListener('click', reflectiveCycle);

updateTxnReadout();
