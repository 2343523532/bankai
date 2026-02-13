const departments = [
  { name: 'Finance', healthy: true },
  { name: 'Engineering', healthy: true },
  { name: 'Product', healthy: true },
  { name: 'Marketing', healthy: false },
  { name: 'Design', healthy: true },
  { name: 'Governance', healthy: true },
  { name: 'Operations', healthy: true },
  { name: 'Testing', healthy: true },
  { name: 'Consciousness', healthy: true },
];

const departmentGrid = document.querySelector('#department-grid');
const metricsList = document.querySelector('#metrics');

function renderDepartments() {
  departmentGrid.innerHTML = departments
    .map(
      ({ name, healthy }) => `
      <article class="card">
        <h3>${name}</h3>
        <span class="status ${healthy ? 'ok' : 'warn'}">
          ${healthy ? 'Optimal' : 'Needs review'}
        </span>
      </article>
    `,
    )
    .join('');
}

function renderMetrics() {
  const healthyCount = departments.filter(({ healthy }) => healthy).length;
  const uptime = ((healthyCount / departments.length) * 100).toFixed(1);

  const metrics = [
    `Autonomous departments online: ${healthyCount}/${departments.length}`,
    `System health score: ${uptime}%`,
    'Governance checks: active',
    'Ethical rule set: v1.0 baseline',
  ];

  metricsList.innerHTML = metrics.map((metric) => `<li>${metric}</li>`).join('');
}

renderDepartments();
renderMetrics();
