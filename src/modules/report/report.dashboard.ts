import { ScreenValidationResult } from '../../core/types/validation.types';

export class ReportDashboard {

  render(results: ScreenValidationResult[]): string {

    const total = results.length;

    const pass = results.filter(r => r.status === 'PASS').length;

    const fail = results.filter(r => r.status === 'FAIL').length;

    const successRate =
      total === 0
        ? 0
        : Math.round((pass / total) * 100);

    return `

<div class="header">

<h1>AI UI Validation Report</h1>

<p>
Generated :
${new Date().toLocaleString()}
</p>

</div>

<div class="summary">

<div class="card">

<h2>${total}</h2>

<p>Total Screens</p>

</div>

<div class="card">

<h2 class="pass">${pass}</h2>

<p>PASS</p>

</div>

<div class="card">

<h2 class="fail">${fail}</h2>

<p>FAIL</p>

</div>

<div class="card">

<h2 class="rate">${successRate}%</h2>

<p>Success Rate</p>

</div>

</div>

`;

  }

}