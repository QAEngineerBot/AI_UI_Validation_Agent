import { ScreenValidationResult } from '../../core/types/validation.types';

import { ReportStyles } from './report.styles';
import { ReportDashboard } from './report.dashboard';

export class ReportTemplate {

  private readonly styles =
    new ReportStyles();

  private readonly dashboard =
    new ReportDashboard();

  build(
    results: ScreenValidationResult[]
  ): string {

    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>UI Test Report</title>

${this.styles.render()}

</head>

<body>

<div class="container">

${this.dashboard.render(results)}

${results.map(result => `

<div class="screen">

<h2>${result.screenName}</h2>

<p>

Status :

<b class="${result.status === 'PASS'
? 'pass'
: 'fail'}">

${result.status}

</b>

</p>

<div class="image-container">

<div class="image-card">

<h3>Expected Design</h3>

<div class="phone-frame">

<div class="phone-notch"></div>

<img
src="file:///${result.expectedImagePath.replace(/\\/g,'/')}"
alt="Expected"
/>

</div>

</div>

<div class="image-card">

<h3>Actual App</h3>

<div class="phone-frame">

<div class="phone-notch"></div>

<img
src="file:///${result.actualImagePath.replace(/\\/g,'/')}"
alt="Actual"
/>

</div>

</div>

</div>

<div class="summary-box">

<h3>AI Summary</h3>

<p>${result.comparison.summary}</p>

</div>

<h3 style="margin-top:25px;">Detected Issues</h3>

${
result.failedIssues.length === 0
? `<p>No UI issues detected.</p>`
: `
<table
style="
width:100%;
border-collapse:collapse;
margin-top:15px;
">

<thead>

<tr
style="
background:#1976d2;
color:white;
">

<th style="padding:12px;">Severity</th>

<th style="padding:12px;">Category</th>

<th style="padding:12px;">Description</th>

<th style="padding:12px;">Recommendation</th>

</tr>

</thead>

<tbody>

${result.failedIssues.map(issue=>`

<tr>

<td
style="
padding:12px;
border:1px solid #ddd;
">

${issue.severity}

</td>

<td
style="
padding:12px;
border:1px solid #ddd;
">

${issue.category}

</td>

<td
style="
padding:12px;
border:1px solid #ddd;
">

${issue.description}

</td>

<td
style="
padding:12px;
border:1px solid #ddd;
">

${issue.recommendation}

</td>

</tr>

`).join('')}

</tbody>

</table>
`
}

</div>

`).join('')}

</div>

</body>

</html>

`;

  }

}