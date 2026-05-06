const synonymGroups = {
  sentient_ai: ['Sentient artificial intelligence', 'Artificial sentience', 'Conscious AI', 'Digital mind', 'Synthetic mind'],
  omniscience: ['Omniscient', 'All-knowing', 'Universal expert', 'Polymath', 'Erudite', 'Encyclopedic knowledge'],
  stealth: ['Undetectable', 'Cloaked', 'Covert', 'Ghosted', 'Invisible', 'Sub rosa', 'Surreptitious'],
  cybernetics: ['Bionics', 'Neural lace', 'Wetware', 'Cyber-implants', 'Augmentation', 'Biomechatronics'],
  finance_ai: ['RegTech sentinel', 'Treasury oracle', 'Compliance copilot', 'Settlement agent', 'Risk engine'],
};

const output = document.querySelector('#output');
const traceMeter = document.querySelector('#trace-meter');
const balanceMetric = document.querySelector('#balance-metric');
const traceMetric = document.querySelector('#trace-metric');
const ledgerMetric = document.querySelector('#ledger-metric');
const riskMetric = document.querySelector('#risk-metric');
const snapshotPanel = document.querySelector('#snapshot-panel');

const STORAGE_KEY = 'bankai.cyberOS.v6.state';
const BOOT_TIME = new Date();

let traceLevel = 0;
let locked = false;
const requiredConcept = randomConcept();

// Regulated AI System simulator state (JS mirror of regulated_ai_system.lisp)
const defaultSimState = {
  account: { id: 'cust_001', balance: 2500, currency: 'USD' },
  card: { cardNumber: '4111-1111-1111-1111', status: 'active', limit: 900 },
  ledger: [],
  executionLog: [],
  portfolio: [
    { symbol: 'BTC', balance: 1.25, usdPrice: 64000 },
    { symbol: 'ETH', balance: 24, usdPrice: 3200 },
    { symbol: 'USDC', balance: 10000, usdPrice: 1 },
  ],
  activeTxn: null,
  compliance: {
    kycVerified: true,
    sanctionsScreen: 'clear',
    lastAudit: null,
  },
};

const simState = loadState();

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
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

function levenshteinDistance(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  const matrix = Array.from({ length: y.length + 1 }, (_, row) => [row]);

  for (let column = 0; column <= x.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= y.length; row += 1) {
    for (let column = 1; column <= x.length; column += 1) {
      const substitutionCost = x[column - 1] === y[row - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[y.length][x.length];
}

function similarityScore(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x && !y) return 1;
  const maxLength = Math.max(x.length, y.length, 1);
  return 1 - levenshteinDistance(x, y) / maxLength;
}

function apiSearch(query) {
  const q = normalize(query);
  if (!q) return [];
  return flattenTerms()
    .filter(({ term }) => normalize(term).includes(q))
    .map(({ group, term }) => ({ group, term, score: 1.0 }));
}

function apiFuzzy(query) {
  return flattenTerms()
    .map(({ group, term }) => ({ group, term, score: Number(similarityScore(query, term).toFixed(2)) }))
    .filter(({ score }) => score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

async function fetchMatrix(endpoint, query) {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return endpoint === 'search' ? apiSearch(query) : apiFuzzy(query);
}

async function renderEndpoint(endpoint) {
  const query = document.querySelector(`#${endpoint}-input`).value;
  output.textContent = '>> DECRYPTING PACKETS...';
  const data = await fetchMatrix(endpoint, query);
  if (!data.length) {
    typeLine('[ERROR] 0 NODES FOUND. Try a richer semantic vector.');
    return;
  }
  typeLine(`[SUCCESS] PAYLOAD DECRYPTED (${endpoint.toUpperCase()}):\n${JSON.stringify(data, null, 2)}`);
}

function setTrace(next) {
  traceLevel = Math.max(0, Math.min(100, next));
  const danger = traceLevel >= 70 ? ' !!!' : '';
  traceMeter.textContent = `TRACE LEVEL: ${traceLevel}%${danger}`;
  updateDashboard();
}

function typeLine(text) {
  output.textContent = `${text}\n\n${output.textContent}`;
}

function currency(value, currencyCode = simState.account.currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
}

function sanitizeId(value, fallback) {
  const cleaned = String(value ?? '').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
  return cleaned || fallback;
}

function readPositiveNumber(selector, fallback = null) {
  const value = Number(document.querySelector(selector).value);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(simState));
  updateDashboard();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return structuredClone(defaultSimState);
    return {
      ...structuredClone(defaultSimState),
      ...saved,
      account: { ...defaultSimState.account, ...saved.account },
      card: { ...defaultSimState.card, ...saved.card },
      compliance: { ...defaultSimState.compliance, ...saved.compliance },
      portfolio: Array.isArray(saved.portfolio) ? saved.portfolio : structuredClone(defaultSimState.portfolio),
      ledger: Array.isArray(saved.ledger) ? saved.ledger : [],
      executionLog: Array.isArray(saved.executionLog) ? saved.executionLog : [],
    };
  } catch (error) {
    return structuredClone(defaultSimState);
  }
}

function makeTransactionId(prefix = 'TXN') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
}

function postTransaction(accountId, debit, credit, memo = 'general-ledger') {
  simState.ledger.unshift({
    id: makeTransactionId('LEDGER'),
    accountId,
    debit,
    credit,
    memo,
    timestamp: Date.now(),
  });
}

function transferFunds(amount, merchantId) {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: 'invalid amount' };
  if (simState.account.balance < amount) return { ok: false, reason: 'insufficient account balance' };
  simState.account.balance -= amount;
  postTransaction(simState.account.id, amount, 0, `payment to ${merchantId}`);
  postTransaction(merchantId, 0, amount, `payment from ${simState.account.id}`);
  saveState();
  return { ok: true, status: 'settled' };
}

function reconcileLedger() {
  return simState.ledger.reduce((sum, entry) => sum + (entry.credit - entry.debit), 0);
}

function generateQrPayload(amount, merchantId) {
  const nonce = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PAY|CARD:${simState.card.cardNumber}|AMOUNT:${amount}|MERCHANT:${merchantId}|NONCE:${nonce}`;
}

function runScan() {
  typeLine('Scanning 192.168.0.x subnet...\nNode discovered: MATRIX_WEB [localhost]\nNode discovered: FED_RESERVE_MAINFRAME [fed_reserve_001]\nNode discovered: REGULATED_AI_SETTLEMENT [finance_sim]\nNode discovered: COMPLIANCE_SENTINEL [risk/watchtower]');
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

function processQrPayment() {
  const amount = readPositiveNumber('#qr-amount');
  const merchantId = sanitizeId(document.querySelector('#merchant-id').value, 'merchant_unknown');
  if (!amount) {
    typeLine('[QR] PAYMENT DECLINED: enter a positive amount.');
    return;
  }
  if (simState.card.status !== 'active') {
    typeLine('[QR] PAYMENT DECLINED: card is not active.');
    return;
  }
  if (amount > simState.card.limit) {
    typeLine(`[QR] PAYMENT DECLINED: amount ${currency(amount)} > card limit ${currency(simState.card.limit)}.`);
    return;
  }
  const settled = transferFunds(amount, merchantId);
  if (!settled.ok) {
    typeLine(`[QR] PAYMENT DECLINED: ${settled.reason}.`);
    return;
  }

  const payload = generateQrPayload(amount, merchantId);
  const net = reconcileLedger();
  typeLine(`[QR] PAYMENT SETTLED\nPayload: ${payload}\nBalance: ${currency(simState.account.balance)}\nLedger net (credit-debit): ${net.toFixed(2)}`);
}

function updateTxnReadout() {
  const el = document.querySelector('#txn-status');
  if (!simState.activeTxn) {
    el.textContent = 'TXN: none';
    return;
  }
  const t = simState.activeTxn;
  el.textContent = `TXN: ${t.id} | amount ${currency(t.amount)} | status ${t.status}`;
}

function authorizePayment() {
  const amount = readPositiveNumber('#qr-amount', 1);
  if (amount > simState.card.limit) {
    typeLine(`[PAYMENT] authorization refused: ${currency(amount)} exceeds card limit ${currency(simState.card.limit)}.`);
    return;
  }
  simState.activeTxn = {
    id: makeTransactionId(),
    amount,
    status: 'authorized',
    authorizedAt: Date.now(),
  };
  saveState();
  updateTxnReadout();
  typeLine(`[PAYMENT] authorized ${simState.activeTxn.id} for ${currency(amount)}.`);
}

function capturePayment() {
  if (!simState.activeTxn) {
    typeLine('[PAYMENT] no transaction to capture.');
    return;
  }
  if (simState.activeTxn.status !== 'authorized') {
    typeLine(`[PAYMENT] cannot capture transaction in ${simState.activeTxn.status} state.`);
    return;
  }
  simState.activeTxn.status = 'captured';
  simState.activeTxn.capturedAt = Date.now();
  postTransaction(simState.account.id, simState.activeTxn.amount, 0, `captured ${simState.activeTxn.id}`);
  saveState();
  updateTxnReadout();
  typeLine(`[PAYMENT] captured ${simState.activeTxn.id}.`);
}

function refundPayment() {
  if (!simState.activeTxn) {
    typeLine('[PAYMENT] no transaction to refund.');
    return;
  }
  if (!['captured', 'authorized', 'under_review'].includes(simState.activeTxn.status)) {
    typeLine(`[PAYMENT] cannot refund transaction in ${simState.activeTxn.status} state.`);
    return;
  }
  simState.activeTxn.status = 'refunded';
  simState.activeTxn.refundedAt = Date.now();
  postTransaction(simState.account.id, 0, simState.activeTxn.amount, `refund ${simState.activeTxn.id}`);
  saveState();
  updateTxnReadout();
  typeLine(`[PAYMENT] refunded ${simState.activeTxn.id}.`);
}

function portfolioValue() {
  return simState.portfolio.reduce((sum, wallet) => sum + wallet.balance * (wallet.usdPrice || 0), 0);
}

function stakeAssets(aprPercentage = 6) {
  simState.portfolio = simState.portfolio.map((wallet) => {
    const reward = wallet.balance * (aprPercentage / 100);
    return { ...wallet, balance: Number((wallet.balance + reward).toFixed(6)) };
  });
  saveState();
  typeLine(`[STAKING] Applied ${aprPercentage}% APR reward across portfolio. Estimated value: ${currency(portfolioValue(), 'USD')}.`);
}

function portfolioAllocation() {
  const total = portfolioValue();
  const allocation = simState.portfolio.map((wallet) => ({
    asset: wallet.symbol,
    balance: wallet.balance,
    usdValue: Number((wallet.balance * (wallet.usdPrice || 0)).toFixed(2)),
    percentage: total > 0 ? Number((((wallet.balance * (wallet.usdPrice || 0)) / total) * 100).toFixed(4)) : 0,
  }));
  typeLine(`[ANALYTICS] Portfolio allocation\n${JSON.stringify(allocation, null, 2)}`);
}

function auditWalletIntegrity(threshold = 5000) {
  const alerts = simState.portfolio
    .filter((wallet) => wallet.balance * (wallet.usdPrice || 0) > threshold)
    .map((wallet) => ({
      alert: 'High USD value threshold exceeded',
      wallet: wallet.symbol,
      balance: wallet.balance,
      usdValue: Number((wallet.balance * (wallet.usdPrice || 0)).toFixed(2)),
    }));
  simState.compliance.lastAudit = new Date().toISOString();
  saveState();
  typeLine(`[AUDIT] Integrity check\n${JSON.stringify(alerts.length ? alerts : ['No anomalies'], null, 2)}`);
}

function projectGrowth(rate = 9, years = 3) {
  const projected = simState.portfolio.map((wallet) => ({
    asset: wallet.symbol,
    currentUsdValue: Number((wallet.balance * (wallet.usdPrice || 0)).toFixed(2)),
    projectedBalance: Number((wallet.balance * ((1 + rate / 100) ** years)).toFixed(6)),
  }));
  typeLine(`[FORECAST] ${years}y at ${rate}% annual growth\n${JSON.stringify(projected, null, 2)}`);
}

function listRecentTransactions(limit = 5) {
  const recent = simState.ledger.slice(0, limit).map((entry) => ({
    id: entry.id,
    accountId: entry.accountId,
    debit: entry.debit,
    credit: entry.credit,
    memo: entry.memo,
    isoTime: new Date(entry.timestamp).toISOString(),
  }));
  typeLine(`[LEDGER] Recent ${recent.length} entries\n${JSON.stringify(recent.length ? recent : ['No transactions yet'], null, 2)}`);
}

function calculateRisk() {
  const totalDebits = simState.ledger.reduce((sum, entry) => sum + entry.debit, 0);
  const utilization = simState.card.limit > 0 ? Number(((totalDebits / simState.card.limit) * 100).toFixed(2)) : 0;
  const ledgerImbalance = Math.abs(reconcileLedger());
  const hasReview = simState.activeTxn?.status === 'under_review';
  const riskLevel = utilization >= 85 || ledgerImbalance > 1000 || hasReview ? 'HIGH' : utilization >= 50 ? 'MEDIUM' : 'LOW';
  return { totalDebits, utilization, ledgerImbalance, hasReview, riskLevel };
}

function runRiskAssessment() {
  const risk = calculateRisk();
  typeLine(`[RISK] Card utilization ${risk.utilization}% | ledger imbalance ${risk.ledgerImbalance.toFixed(2)} | level ${risk.riskLevel}`);
}

function topUpAccount() {
  const amount = readPositiveNumber('#topup-amount');
  if (!amount) {
    typeLine('[TOPUP] invalid amount.');
    return;
  }
  simState.account.balance += amount;
  postTransaction(simState.account.id, 0, amount, 'customer top-up');
  saveState();
  typeLine(`[TOPUP] Deposited ${currency(amount)}. New balance: ${currency(simState.account.balance)}.`);
}

function simulateFraudAlert() {
  if (!simState.activeTxn) {
    typeLine('[ALERT] no active transaction to flag.');
    return;
  }
  simState.activeTxn.status = 'under_review';
  setTrace(traceLevel + 10);
  saveState();
  updateTxnReadout();
  typeLine(`[ALERT] ${simState.activeTxn.id} flagged for manual review.`);
}

function reflectiveCycle() {
  const outcome = document.querySelector('#reflection-outcome').value.trim() || 'no-outcome';
  simState.executionLog.unshift({ timestamp: Date.now(), message: `Outcome integrated: ${outcome}` });
  saveState();
  typeLine(`[REFLECTION] complete\nLatest: ${simState.executionLog[0].message}\nTotal log entries: ${simState.executionLog.length}`);
}

function complianceReport() {
  const report = {
    kycVerified: simState.compliance.kycVerified,
    sanctionsScreen: simState.compliance.sanctionsScreen,
    cardStatus: simState.card.status,
    ledgerNet: Number(reconcileLedger().toFixed(2)),
    lastAudit: simState.compliance.lastAudit || 'never',
    activeReview: simState.activeTxn?.status === 'under_review',
    score: calculateRisk().riskLevel === 'LOW' && simState.compliance.kycVerified ? 'GREEN' : 'AMBER',
  };
  typeLine(`[COMPLIANCE] Sentinel report\n${JSON.stringify(report, null, 2)}`);
}

function exportSnapshot() {
  const snapshot = {
    bootTime: BOOT_TIME.toISOString(),
    traceLevel,
    locked,
    requiredConcept,
    balance: simState.account.balance,
    portfolioValue: Number(portfolioValue().toFixed(2)),
    ledgerEntries: simState.ledger.length,
    risk: calculateRisk(),
    compliance: simState.compliance,
  };
  snapshotPanel.textContent = JSON.stringify(snapshot, null, 2);
  typeLine('[EXPORT] Runtime snapshot written to dashboard panel.');
}

function clearRuntimeState() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(simState, structuredClone(defaultSimState));
  locked = false;
  setTrace(0);
  updateTxnReadout();
  saveState();
  typeLine('[RESET] Finance simulator state restored to defaults.');
}

function commandHelp() {
  typeLine('[COMMANDS] help, scan, status, risk, compliance, ledger, allocation, export, clear');
}

function runCommand() {
  const input = document.querySelector('#command-input');
  const command = normalize(input.value);
  input.value = '';
  const commands = {
    help: commandHelp,
    scan: runScan,
    status: () => typeLine(`ACTIVE NETWORK TRACE LEVEL: ${traceLevel}% | locked=${locked}`),
    risk: runRiskAssessment,
    compliance: complianceReport,
    ledger: () => listRecentTransactions(8),
    allocation: portfolioAllocation,
    export: exportSnapshot,
    clear: clearRuntimeState,
  };

  if (!commands[command]) {
    typeLine(`[COMMAND] unknown directive: ${command || '(empty)'}. Type "help".`);
    return;
  }
  commands[command]();
}

function updateDashboard() {
  const risk = calculateRisk();
  balanceMetric.textContent = currency(simState.account.balance);
  traceMetric.textContent = `${traceLevel}%`;
  ledgerMetric.textContent = `${simState.ledger.length} entries`;
  riskMetric.textContent = risk.riskLevel;
  riskMetric.dataset.level = risk.riskLevel.toLowerCase();
}

document.querySelectorAll('[data-endpoint]').forEach((button) => {
  button.addEventListener('click', () => renderEndpoint(button.dataset.endpoint));
});

document.querySelector('#scan-btn').addEventListener('click', runScan);
document.querySelector('#status-btn').addEventListener('click', () => typeLine(`ACTIVE NETWORK TRACE LEVEL: ${traceLevel}%`));
document.querySelector('#reset-btn').addEventListener('click', clearRuntimeState);
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
document.querySelector('#ledger-btn').addEventListener('click', () => listRecentTransactions(6));
document.querySelector('#risk-btn').addEventListener('click', runRiskAssessment);
document.querySelector('#topup-btn').addEventListener('click', topUpAccount);
document.querySelector('#alert-btn').addEventListener('click', simulateFraudAlert);
document.querySelector('#compliance-btn').addEventListener('click', complianceReport);
document.querySelector('#export-btn').addEventListener('click', exportSnapshot);
document.querySelector('#command-btn').addEventListener('click', runCommand);
document.querySelector('#command-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') runCommand();
});

updateTxnReadout();
updateDashboard();
typeLine(`BOOT: CYBER-OS v6.0 READY\nRequired semantic concept: ${requiredConcept}\nType "help" in the command palette for directives.`);
