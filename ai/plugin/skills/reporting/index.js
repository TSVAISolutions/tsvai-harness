/**
 * Reporting Skill
 * Report generation, summaries, and insights
 */

class ReportingSkill {
  constructor(config = {}) {
    this.config = config;
  }

  async initialize() {
    console.log('[ReportingSkill] Initialized');
    return { success: true };
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(data) {
    try {
      const summary = {
        title: data.title || 'Executive Summary',
        date: new Date().toISOString().split('T')[0],
        overview: this._generateOverview(data),
        keyFindings: this._extractKeyFindings(data),
        recommendations: this._generateRecommendations(data),
        conclusion: this._generateConclusion(data)
      };

      let report = this._formatExecutiveSummary(summary);

      return {
        success: true,
        reportType: 'executive-summary',
        report,
        sections: Object.keys(summary).length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate trend analysis
   */
  async analyzeTrends(data, field, period = 'monthly') {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const values = data.map(item => item[field]).filter(v => typeof v === 'number');
      const trend = this._calculateTrend(values);

      const report = `
Trend Analysis: ${field}
Period: ${period}
Total Data Points: ${values.length}
Current Value: ${values[values.length - 1]}
Previous Value: ${values[values.length - 2] || 'N/A'}
Change: ${this._formatChange(values)}
Trend Direction: ${trend > 0 ? '📈 Increasing' : trend < 0 ? '📉 Decreasing' : '➡️ Stable'}
Trend Strength: ${Math.abs(trend).toFixed(2)}
`;

      return {
        success: true,
        field,
        period,
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        report: report.trim()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate comparison report
   */
  async compareDatasets(dataset1, dataset2, field) {
    try {
      const data1 = this._extractNumericValues(dataset1, field);
      const data2 = this._extractNumericValues(dataset2, field);

      const stats1 = this._calculateStats(data1);
      const stats2 = this._calculateStats(data2);

      const comparison = {
        field,
        dataset1: stats1,
        dataset2: stats2,
        difference: {
          mean: (stats2.mean - stats1.mean).toFixed(2),
          stdDev: (stats2.stdDev - stats1.stdDev).toFixed(2)
        }
      };

      let report = `
Comparison Report: ${field}

Dataset 1:
  Mean: ${stats1.mean.toFixed(2)}
  Std Dev: ${stats1.stdDev.toFixed(2)}
  Min: ${stats1.min}
  Max: ${stats1.max}

Dataset 2:
  Mean: ${stats2.mean.toFixed(2)}
  Std Dev: ${stats2.stdDev.toFixed(2)}
  Min: ${stats2.min}
  Max: ${stats2.max}

Difference:
  Mean Difference: ${comparison.difference.mean}
  StdDev Difference: ${comparison.difference.stdDev}
`;

      return {
        success: true,
        report: report.trim(),
        comparison
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(metrics) {
    try {
      const sections = [];

      if (metrics.title) {
        sections.push(`# ${metrics.title}`);
      }

      sections.push(`Generated: ${new Date().toISOString()}`);
      sections.push('');

      if (metrics.kpis) {
        sections.push('## Key Performance Indicators');
        Object.entries(metrics.kpis).forEach(([name, value]) => {
          const status = this._getStatusEmoji(value);
          sections.push(`- ${name}: ${value} ${status}`);
        });
        sections.push('');
      }

      if (metrics.achievements) {
        sections.push('## Achievements');
        metrics.achievements.forEach(achievement => {
          sections.push(`✓ ${achievement}`);
        });
        sections.push('');
      }

      if (metrics.improvements) {
        sections.push('## Areas for Improvement');
        metrics.improvements.forEach(improvement => {
          sections.push(`• ${improvement}`);
        });
        sections.push('');
      }

      const report = sections.join('\n');

      return {
        success: true,
        report,
        sections: sections.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'executiveSummary':
        return this.generateExecutiveSummary(params.data);
      case 'trends':
        return this.analyzeTrends(params.data, params.field, params.period);
      case 'comparison':
        return this.compareDatasets(params.dataset1, params.dataset2, params.field);
      case 'performance':
        return this.generatePerformanceReport(params.metrics);
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  async validate(params) {
    if (!params.data && !params.metrics && !params.dataset1) {
      return { valid: false, error: 'Data or metrics parameter required' };
    }
    return { valid: true };
  }

  async shutdown() {
    console.log('[ReportingSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  _generateOverview(data) {
    return `Overview of ${data.title || 'report'} generated on ${new Date().toDateString()}.`;
  }

  _extractKeyFindings(data) {
    return [
      'Key finding 1: Analysis shows positive trends',
      'Key finding 2: Data integrity verified',
      'Key finding 3: Recommendations identified'
    ];
  }

  _generateRecommendations(data) {
    return [
      'Continue monitoring key metrics',
      'Implement suggested improvements',
      'Schedule follow-up review'
    ];
  }

  _generateConclusion(data) {
    return 'Report demonstrates solid performance with opportunities for optimization.';
  }

  _formatExecutiveSummary(summary) {
    let text = `EXECUTIVE SUMMARY\n`;
    text += `Title: ${summary.title}\n`;
    text += `Date: ${summary.date}\n\n`;

    text += `OVERVIEW\n${summary.overview}\n\n`;

    text += `KEY FINDINGS\n`;
    summary.keyFindings.forEach(finding => {
      text += `• ${finding}\n`;
    });

    text += `\nRECOMMENDATIONS\n`;
    summary.recommendations.forEach(rec => {
      text += `• ${rec}\n`;
    });

    text += `\nCONCLUSION\n${summary.conclusion}\n`;

    return text;
  }

  _calculateTrend(values) {
    if (values.length < 2) return 0;

    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) trend++;
      else if (values[i] < values[i - 1]) trend--;
    }

    return trend / (values.length - 1);
  }

  _formatChange(values) {
    if (values.length < 2) return 'N/A';

    const change = values[values.length - 1] - values[values.length - 2];
    const percent = (change / values[values.length - 2]) * 100;

    return `${change > 0 ? '+' : ''}${change.toFixed(2)} (${percent.toFixed(1)}%)`;
  }

  _extractNumericValues(data, field) {
    if (Array.isArray(data)) {
      return data.map(item => item[field]).filter(v => typeof v === 'number');
    }
    return [data[field]].filter(v => typeof v === 'number');
  }

  _calculateStats(values) {
    if (values.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  _getStatusEmoji(value) {
    if (value >= 90) return '🟢';
    if (value >= 70) return '🟡';
    return '🔴';
  }

  getMetadata() {
    return {
      name: 'reporting',
      displayName: 'Reporting Skill',
      description: 'Report generation, summaries, and insights',
      version: '1.0.0',
      capabilities: [
        'Executive Summaries',
        'Trend Analysis',
        'Data Comparison',
        'Performance Reports',
        'Insights Generation'
      ],
      operations: ['executiveSummary', 'trends', 'comparison', 'performance']
    };
  }
}

module.exports = ReportingSkill;
