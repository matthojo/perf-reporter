module.exports = `
{{#if before}}
{{ before }}
{{/if}}
<!--START_LOG-->
{{#each data}}
## Page: {{this.testUrl}}
<details>
  <summary>Test Information</summary>
  <a href="{{this.median.firstView.pages.details}}">Details</a> &middot; 
  <a href="{{this.median.firstView.pages.checklist}}">Checklist</a> &middot; 
  <a href="{{this.median.firstView.pages.breakdown}}">Breakdown</a> &middot; 
  <a href="{{this.median.firstView.pages.domains}}">Domains</a> &middot; 
  <a href="https://whatdoesmysitecost.com/test/{{this.id}}">Cost</a>
  <br /><br />
  <b>Summary:</b> <a href="{{this.summary}}">{{this.id}}</a><br/>
  <b>Location:</b> {{this.location}}<br/>
  <b>Connectivity:</b> {{this.connectivity}}<br/>
  <b>Latency:</b> {{this.latency}}
</details>
<details>
  <summary>Test Results</summary>

| Metric  | Value |
| ------- | ------|
{{#each this.average.firstView}}
| {{@key}} | {{this}}  |
{{/each}}
</details>

---
{{/each}}
<!--END_LOG-->
{{#if updated}}
<b>Updated:</b> <a href="{{updated.by}}">{{ updated.time }}</a>

---
{{/if}}
{{#if after}}
{{ after }}
{{/if}}
`