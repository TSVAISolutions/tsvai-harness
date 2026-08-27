# TSVAI Plugin System - Complete API Reference

Comprehensive documentation for all 7 skills and their operations.

---

## Table of Contents

1. [Analytics Skill](#analytics-skill)
2. [Text Analysis Skill](#text-analysis-skill)
3. [Data Processing Skill](#data-processing-skill)
4. [Content Generation Skill](#content-generation-skill)
5. [NLP Processing Skill](#nlp-processing-skill)
6. [Quality Assurance Skill](#quality-assurance-skill)
7. [Reporting Skill](#reporting-skill)

---

## Analytics Skill

**ID:** `analytics:analytics`  
**MCP Tool:** `analytics_analytics`

### Operations

#### 1. Analyze Text
Perform comprehensive text analysis.

```javascript
await system.executeTool('analytics_analytics', {
  operation: 'analyze',
  params: {
    text: 'Your text here',
    operations: ['wordCount', 'stats', 'keywords', 'sentiment', 'metrics']
  }
})
```

**Parameters:**
- `text` (string, required): Text to analyze
- `operations` (array): Operations to perform (default: all)

**Response:**
```json
{
  "success": true,
  "wordCount": 15,
  "charCount": 89,
  "stats": {
    "wordCount": 15,
    "charCount": 89,
    "sentenceCount": 2,
    "avgWordLength": 5.9,
    "readabilityScore": 72
  },
  "keywords": [...],
  "sentiment": {...}
}
```

#### 2. Extract Keywords
Extract and rank keywords by frequency.

```javascript
await system.executeTool('analytics_analytics', {
  operation: 'keywords',
  params: {
    text: 'Your text here',
    topN: 5
  }
})
```

**Parameters:**
- `text` (string, required): Text to analyze
- `topN` (number): Number of keywords to return (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "keywords": [
    { "word": "text", "frequency": 3, "relevance": 0.15 },
    { "word": "analysis", "frequency": 2, "relevance": 0.10 }
  ]
}
```

#### 3. Analyze Sentiment
Detect sentiment (positive/negative/neutral).

```javascript
await system.executeTool('analytics_analytics', {
  operation: 'sentiment',
  params: { text: 'This is wonderful!' }
})
```

**Response:**
```json
{
  "success": true,
  "sentiment": "positive",
  "score": 0.85,
  "confidence": 0.92
}
```

#### 4. Get Statistics
Detailed text statistics.

```javascript
await system.executeTool('analytics_analytics', {
  operation: 'stats',
  params: { text: 'Your text here' }
})
```

---

## Text Analysis Skill

**ID:** `text-analysis:text-analysis`  
**MCP Tool:** `text_analysis_text_analysis`

### Operations

#### 1. Parse Into Sentences
Break text into sentences.

```javascript
await system.executeTool('text_analysis_text_analysis', {
  operation: 'sentences',
  params: { text: 'First sentence. Second sentence.' }
})
```

**Response:**
```json
{
  "success": true,
  "sentenceCount": 2,
  "sentences": [
    {
      "index": 0,
      "text": "First sentence",
      "length": 14,
      "wordCount": 2
    }
  ]
}
```

#### 2. Parse Paragraphs
Break text into paragraphs.

```javascript
await system.executeTool('text_analysis_text_analysis', {
  operation: 'paragraphs',
  params: { text: 'Para 1\n\nPara 2' }
})
```

#### 3. Extract Words
Find unique words and frequencies.

```javascript
await system.executeTool('text_analysis_text_analysis', {
  operation: 'words',
  params: {
    text: 'Your text here',
    options: { caseSensitive: false, minLength: 2 }
  }
})
```

**Response:**
```json
{
  "success": true,
  "totalWords": 15,
  "uniqueWords": 12,
  "words": ["analysis", "here", "text", "your"],
  "wordFrequency": [
    { "word": "the", "frequency": 3 },
    { "word": "is", "frequency": 2 }
  ]
}
```

#### 4. Detect Patterns
Find emails, URLs, dates, hashtags, mentions.

```javascript
await system.executeTool('text_analysis_text_analysis', {
  operation: 'patterns',
  params: { text: 'Email: test@example.com, URL: https://example.com' }
})
```

**Response:**
```json
{
  "success": true,
  "patterns": {
    "emails": [{ "value": "test@example.com", "position": 7 }],
    "urls": [{ "value": "https://example.com", "position": 40 }],
    "dates": [...],
    "hashtags": [...],
    "mentions": [...]
  }
}
```

#### 5. Extract Between Delimiters
Find text between markers.

```javascript
await system.executeTool('text_analysis_text_analysis', {
  operation: 'extractBetween',
  params: {
    text: 'Start [content here] End',
    startDelimiter: '[',
    endDelimiter: ']'
  }
})
```

#### 6. Find Similar Sentences
Compare sentences for similarity.

```javascript
await system.executeTool('text_analysis_text_analysis', {
  operation: 'findSimilar',
  params: {
    text: 'The cat sat on the mat',
    referenceText: 'A cat sits on the mat',
    threshold: 0.7
  }
})
```

---

## Data Processing Skill

**ID:** `data-processing:data-processing`  
**MCP Tool:** `data_processing_data_processing`

### Operations

#### 1. Convert Format
Convert between JSON and CSV.

```javascript
await system.executeTool('data_processing_data_processing', {
  operation: 'convert',
  params: {
    data: '[{"name":"John","age":30}]',
    fromFormat: 'json',
    toFormat: 'csv'
  }
})
```

**Response:**
```json
{
  "success": true,
  "fromFormat": "json",
  "toFormat": "csv",
  "result": "name,age\nJohn,30",
  "size": 18
}
```

#### 2. Transform Data
Map fields.

```javascript
await system.executeTool('data_processing_data_processing', {
  operation: 'transform',
  params: {
    data: [{ "firstName": "John", "lastName": "Doe" }],
    mapping: { "firstName": "first_name", "lastName": "last_name" }
  }
})
```

#### 3. Filter Data
Filter by predicate.

```javascript
await system.executeTool('data_processing_data_processing', {
  operation: 'filter',
  params: {
    data: [{ "id": 1, "active": true }, { "id": 2, "active": false }],
    predicate: 'item.active === true'
  }
})
```

#### 4. Aggregate Data
Sum, average, count, min, max.

```javascript
await system.executeTool('data_processing_data_processing', {
  operation: 'aggregate',
  params: {
    data: [{ "value": 10 }, { "value": 20 }, { "value": 30 }],
    operation: 'sum',
    field: 'value'
  }
})
```

**Operations:** `sum`, `avg`, `count`, `max`, `min`

#### 5. Flatten Data
Flatten nested arrays.

```javascript
await system.executeTool('data_processing_data_processing', {
  operation: 'flatten',
  params: {
    data: [[1, 2], [3, 4], [5]],
    depth: 1
  }
})
```

#### 6. Chunk Data
Split into batches.

```javascript
await system.executeTool('data_processing_data_processing', {
  operation: 'chunk',
  params: {
    data: [1, 2, 3, 4, 5],
    chunkSize: 2
  }
})
```

---

## Content Generation Skill

**ID:** `content-generation:content-generation`  
**MCP Tool:** `content_generation_content_generation`

### Operations

#### 1. Generate Report
Create formatted reports.

```javascript
await system.executeTool('content_generation_content_generation', {
  operation: 'report',
  params: {
    data: { title: 'Monthly Report', metric1: 100, metric2: 200 },
    reportType: 'summary' // 'summary', 'detailed', 'technical'
  }
})
```

#### 2. Generate List
Format as bullet, numbered, markdown, HTML.

```javascript
await system.executeTool('content_generation_content_generation', {
  operation: 'list',
  params: {
    items: ['item1', 'item2', 'item3'],
    format: 'bullet' // 'bullet', 'numbered', 'markdown', 'html'
  }
})
```

#### 3. Generate Table
Create formatted tables.

```javascript
await system.executeTool('content_generation_content_generation', {
  operation: 'table',
  params: {
    data: [
      { "name": "John", "age": 30 },
      { "name": "Jane", "age": 25 }
    ],
    format: 'markdown' // 'markdown', 'html', 'csv'
  }
})
```

#### 4. Fill Template
Use built-in or custom templates.

```javascript
await system.executeTool('content_generation_content_generation', {
  operation: 'template',
  params: {
    templateName: 'email', // 'email', 'memo', 'letter'
    data: {
      subject: 'Hello',
      recipient: 'John',
      body: 'This is the email body',
      sender: 'Jane'
    }
  }
})
```

#### 5. Generate Outline
Create structured outlines.

```javascript
await system.executeTool('content_generation_content_generation', {
  operation: 'outline',
  params: {
    title: 'Project Plan',
    sections: [
      { title: 'Overview', subsections: ['Goals', 'Scope'] },
      { title: 'Timeline', subsections: ['Phase 1', 'Phase 2'] }
    ]
  }
})
```

---

## NLP Processing Skill

**ID:** `nlp-processing:nlp-processing`  
**MCP Tool:** `nlp_processing_nlp_processing`

### Operations

#### 1. Tokenize
Break text into tokens.

```javascript
await system.executeTool('nlp_processing_nlp_processing', {
  operation: 'tokenize',
  params: { text: 'Hello world test' }
})
```

**Response:**
```json
{
  "success": true,
  "tokenCount": 3,
  "tokens": [
    { "index": 0, "value": "Hello", "length": 5 },
    { "index": 1, "value": "world", "length": 5 },
    { "index": 2, "value": "test", "length": 4 }
  ]
}
```

#### 2. Extract Entities
Named Entity Recognition.

```javascript
await system.executeTool('nlp_processing_nlp_processing', {
  operation: 'entities',
  params: { text: 'John works at Google in New York' }
})
```

#### 3. Detect Language
Identify language.

```javascript
await system.executeTool('nlp_processing_nlp_processing', {
  operation: 'language',
  params: { text: 'The quick brown fox' }
})
```

**Response:**
```json
{
  "success": true,
  "language": "English",
  "confidence": 0.95
}
```

#### 4. Part-of-Speech Tagging
Tag word types.

```javascript
await system.executeTool('nlp_processing_nlp_processing', {
  operation: 'pos',
  params: { text: 'The quick brown fox jumps' }
})
```

#### 5. Extract Noun Phrases
Find noun phrases.

```javascript
await system.executeTool('nlp_processing_nlp_processing', {
  operation: 'nounPhrases',
  params: { text: 'The quick brown fox jumps over the lazy dog' }
})
```

---

## Quality Assurance Skill

**ID:** `quality-assurance:quality-assurance`  
**MCP Tool:** `quality_assurance_quality_assurance`

### Operations

#### 1. Validate Structure
Check against schema.

```javascript
await system.executeTool('quality_assurance_quality_assurance', {
  operation: 'validate',
  params: {
    data: { name: 'John', email: 'john@example.com' },
    schema: {
      name: { required: true, type: 'string' },
      email: { required: true, type: 'string' }
    }
  }
})
```

#### 2. Calculate Metrics
Quality scoring.

```javascript
await system.executeTool('quality_assurance_quality_assurance', {
  operation: 'metrics',
  params: { data: { field1: 'value1', field2: 'value2' } }
})
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "completeness": 1.0,
    "consistency": 0.95,
    "accuracy": 0.85,
    "uniformity": 0.90
  },
  "overallQuality": 0.925,
  "rating": "Excellent"
}
```

#### 3. Test Ranges
Check value ranges.

```javascript
await system.executeTool('quality_assurance_quality_assurance', {
  operation: 'ranges',
  params: {
    data: [{ "value": 50 }, { "value": 75 }, { "value": 200 }],
    field: 'value',
    min: 0,
    max: 100
  }
})
```

#### 4. Detect Anomalies
Find statistical outliers.

```javascript
await system.executeTool('quality_assurance_quality_assurance', {
  operation: 'anomalies',
  params: {
    data: [{ "value": 10 }, { "value": 12 }, { "value": 11 }, { "value": 100 }],
    field: 'value',
    threshold: 2
  }
})
```

#### 5. Check Duplicates
Find duplicate records.

```javascript
await system.executeTool('quality_assurance_quality_assurance', {
  operation: 'duplicates',
  params: {
    data: [{ "id": 1 }, { "id": 2 }, { "id": 1 }],
    field: 'id'
  }
})
```

---

## Reporting Skill

**ID:** `reporting:reporting`  
**MCP Tool:** `reporting_reporting`

### Operations

#### 1. Generate Executive Summary
Create executive summary reports.

```javascript
await system.executeTool('reporting_reporting', {
  operation: 'executiveSummary',
  params: { data: { title: 'Q1 Report', metric: 'value' } }
})
```

#### 2. Analyze Trends
Trend detection and analysis.

```javascript
await system.executeTool('reporting_reporting', {
  operation: 'trends',
  params: {
    data: [{ "value": 10 }, { "value": 12 }, { "value": 15 }],
    field: 'value',
    period: 'monthly'
  }
})
```

**Response:**
```json
{
  "success": true,
  "field": "value",
  "period": "monthly",
  "trend": "increasing",
  "report": "Trend Analysis: value..."
}
```

#### 3. Compare Datasets
Compare two datasets.

```javascript
await system.executeTool('reporting_reporting', {
  operation: 'comparison',
  params: {
    dataset1: [{ "value": 10 }, { "value": 20 }],
    dataset2: [{ "value": 15 }, { "value": 25 }],
    field: 'value'
  }
})
```

#### 4. Generate Performance Report
Create performance reports with KPIs.

```javascript
await system.executeTool('reporting_reporting', {
  operation: 'performance',
  params: {
    metrics: {
      title: 'Q1 Performance',
      kpis: { 'Revenue': 100000, 'Users': 5000 },
      achievements: ['Goal 1 met', 'Goal 2 met'],
      improvements: ['Need faster response times']
    }
  }
})
```

---

## Common Response Format

All operations follow this structure:

```json
{
  "success": true/false,
  "error": "error message (if success=false)",
  "result": { "operation-specific data" }
}
```

---

## Error Codes

- `400` - Invalid parameters
- `404` - Skill/operation not found
- `422` - Validation failed
- `500` - Internal error

---

## Rate Limits

- **No hard limits** for local execution
- **Recommended:** <100 concurrent operations
- **Timeout:** 30 seconds per operation (configurable)

---

## Best Practices

1. **Validate inputs** before calling operations
2. **Handle errors** gracefully
3. **Cache results** when appropriate
4. **Use operations** that match your use case
5. **Monitor performance** for large datasets

---

**Version:** 1.0.0  
**Last Updated:** 2026-08-28  
**Status:** Stable
