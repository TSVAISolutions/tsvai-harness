/**
 * Content Generation Skill
 * Generate structured content, templates, and formatted output
 */

class ContentGenerationSkill {
  constructor(config = {}) {
    this.config = config;
    this.templates = new Map();
  }

  async initialize() {
    this._loadDefaultTemplates();
    console.log('[ContentGenerationSkill] Initialized');
    return { success: true };
  }

  /**
   * Generate report from data
   */
  async generateReport(data, reportType = 'summary') {
    try {
      let report = '';

      switch (reportType.toLowerCase()) {
        case 'summary':
          report = this._generateSummaryReport(data);
          break;
        case 'detailed':
          report = this._generateDetailedReport(data);
          break;
        case 'technical':
          report = this._generateTechnicalReport(data);
          break;
        default:
          return { success: false, error: `Unknown report type: ${reportType}` };
      }

      return {
        success: true,
        reportType,
        report,
        length: report.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate list with formatting
   */
  async generateList(items, format = 'bullet') {
    try {
      if (!Array.isArray(items)) {
        return { success: false, error: 'Items must be an array' };
      }

      let list = '';

      switch (format.toLowerCase()) {
        case 'bullet':
          list = items.map(item => `• ${item}`).join('\n');
          break;
        case 'numbered':
          list = items.map((item, i) => `${i + 1}. ${item}`).join('\n');
          break;
        case 'markdown':
          list = items.map(item => `- ${item}`).join('\n');
          break;
        case 'html':
          list = `<ul>\n${items.map(item => `  <li>${item}</li>`).join('\n')}\n</ul>`;
          break;
        default:
          return { success: false, error: `Unknown format: ${format}` };
      }

      return {
        success: true,
        format,
        itemCount: items.length,
        result: list
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate table
   */
  async generateTable(data, format = 'markdown') {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return { success: false, error: 'Data must be non-empty array' };
      }

      const headers = Object.keys(data[0]);
      let table = '';

      switch (format.toLowerCase()) {
        case 'markdown':
          table = this._generateMarkdownTable(headers, data);
          break;
        case 'html':
          table = this._generateHtmlTable(headers, data);
          break;
        case 'csv':
          table = this._generateCsvTable(headers, data);
          break;
        default:
          return { success: false, error: `Unknown format: ${format}` };
      }

      return {
        success: true,
        format,
        rows: data.length,
        columns: headers.length,
        result: table
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fill template with data
   */
  async fillTemplate(templateName, data) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        return { success: false, error: `Template not found: ${templateName}` };
      }

      let result = template;

      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
      }

      return {
        success: true,
        template: templateName,
        result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create structured outline
   */
  async generateOutline(title, sections) {
    try {
      let outline = `# ${title}\n\n`;

      sections.forEach((section, i) => {
        outline += `## ${i + 1}. ${section.title}\n`;
        if (section.subsections) {
          section.subsections.forEach((sub, j) => {
            outline += `   ${i + 1}.${j + 1} ${sub}\n`;
          });
        }
        outline += '\n';
      });

      return {
        success: true,
        title,
        sectionCount: sections.length,
        result: outline
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'report':
        return this.generateReport(params.data, params.reportType);
      case 'list':
        return this.generateList(params.items, params.format);
      case 'table':
        return this.generateTable(params.data, params.format);
      case 'template':
        return this.fillTemplate(params.templateName, params.data);
      case 'outline':
        return this.generateOutline(params.title, params.sections);
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  async validate(params) {
    if (!params.data && !params.items && !params.templateName) {
      return { valid: false, error: 'Data or items parameter required' };
    }
    return { valid: true };
  }

  async shutdown() {
    this.templates.clear();
    console.log('[ContentGenerationSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  _generateSummaryReport(data) {
    let report = '=== SUMMARY REPORT ===\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    for (const [key, value] of Object.entries(data)) {
      report += `${key}: ${value}\n`;
    }

    return report;
  }

  _generateDetailedReport(data) {
    let report = '=== DETAILED REPORT ===\n\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Items: ${Object.keys(data).length}\n\n`;

    for (const [key, value] of Object.entries(data)) {
      report += `### ${key}\n`;
      if (typeof value === 'object') {
        report += JSON.stringify(value, null, 2) + '\n\n';
      } else {
        report += `${value}\n\n`;
      }
    }

    return report;
  }

  _generateTechnicalReport(data) {
    return `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }

  _generateMarkdownTable(headers, data) {
    const sep = '|' + headers.map(() => '---|').join('');
    const headerRow = '| ' + headers.join(' | ') + ' |';

    const rows = data.map(row => {
      const cells = headers.map(h => row[h] || '');
      return '| ' + cells.join(' | ') + ' |';
    }).join('\n');

    return `${headerRow}\n${sep}\n${rows}`;
  }

  _generateHtmlTable(headers, data) {
    let html = '<table>\n  <thead>\n    <tr>\n';
    headers.forEach(h => {
      html += `      <th>${h}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n  <tbody>\n';

    data.forEach(row => {
      html += '    <tr>\n';
      headers.forEach(h => {
        html += `      <td>${row[h] || ''}</td>\n`;
      });
      html += '    </tr>\n';
    });

    html += '  </tbody>\n</table>';
    return html;
  }

  _generateCsvTable(headers, data) {
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += headers.map(h => row[h] || '').join(',') + '\n';
    });
    return csv;
  }

  _loadDefaultTemplates() {
    this.templates.set('email', `Subject: {{subject}}\n\nDear {{recipient}},\n\n{{body}}\n\nBest regards,\n{{sender}}`);
    this.templates.set('memo', `MEMORANDUM\n\nTO: {{to}}\nFROM: {{from}}\nDATE: {{date}}\nRE: {{subject}}\n\n{{body}}`);
    this.templates.set('letter', `{{date}}\n\n{{recipient}}\n\nDear {{salutation}},\n\n{{body}}\n\nSincerely,\n{{sender}}`);
  }

  getMetadata() {
    return {
      name: 'content-generation',
      displayName: 'Content Generation Skill',
      description: 'Generate structured content, templates, and formatted output',
      version: '1.0.0',
      capabilities: [
        'Report Generation',
        'List Formatting',
        'Table Creation',
        'Template Filling',
        'Outline Generation'
      ],
      operations: ['report', 'list', 'table', 'template', 'outline']
    };
  }
}

module.exports = ContentGenerationSkill;
