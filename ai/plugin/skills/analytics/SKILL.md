# Analytics Skill

> Comprehensive data analysis and insights generation for TSVAI

## Overview

The Analytics skill provides tools for analyzing text, generating insights, and producing reports on content statistics and patterns.

## Capabilities

- **Text Analysis**: Comprehensive statistics on content
- **Keyword Analysis**: Extract and rank important terms
- **Sentiment Analysis**: Understand emotional tone
- **Readability Scoring**: Assess content complexity
- **Trend Analysis**: Identify patterns in data

## Usage

### Analyze Text

```python
analyze_text(text, operations=['wordCount', 'stats', 'keywords'])
```

**Parameters:**
- `text` (string): Text to analyze
- `operations` (list): Operations to perform

**Returns:**
```json
{
  "success": true,
  "wordCount": 150,
  "charCount": 892,
  "stats": {
    "avgWordLength": 5.95,
    "readabilityScore": 72
  },
  "keywords": [...]
}
```

### Extract Keywords

```python
extract_keywords(text, topN=5)
```

**Parameters:**
- `text` (string): Text to analyze
- `topN` (number): Number of keywords to return

**Returns:**
```json
{
  "keywords": [
    {"word": "analysis", "frequency": 8},
    {"word": "data", "frequency": 6}
  ]
}
```

### Analyze Sentiment

```python
analyze_sentiment(text)
```

**Parameters:**
- `text` (string): Text to analyze

**Returns:**
```json
{
  "sentiment": "positive",
  "score": 0.72,
  "confidence": 0.85
}
```

## Examples

### Example 1: Content Analysis

Analyze blog post readability and key topics:

```python
result = analyze_text(blog_content, ['stats', 'keywords'])
print(f"Readability: {result['stats']['readabilityScore']}")
print(f"Key topics: {[k['word'] for k in result['keywords'][:5]]}")
```

### Example 2: Sentiment Tracking

Monitor sentiment across multiple documents:

```python
documents = [doc1, doc2, doc3]
sentiments = [analyze_sentiment(doc)['sentiment'] for doc in documents]
positive_count = sum(1 for s in sentiments if s == 'positive')
```

### Example 3: Content Quality Report

Generate quality report for content:

```python
stats = analyze_text(content, ['stats'])
quality = {
  'readability': stats['stats']['readabilityScore'],
  'wordCount': stats['wordCount'],
  'avgSentenceLength': stats['stats']['avgSentenceLength']
}
```

## Configuration

### Environment Variables

```bash
ANALYTICS_MAX_TEXT_LENGTH=50000
ANALYTICS_CACHE_TTL=3600
ANALYTICS_DEBUG=false
```

### Runtime Options

```python
config = {
    'maxLength': 50000,
    'enableCache': True,
    'cacheTTL': 3600
}
```

## Best Practices

1. **Batch Processing**: Use batch operations for multiple texts
2. **Caching**: Enable caching for repeated analyses
3. **Error Handling**: Handle timeouts and validation errors
4. **Performance**: Monitor execution time for large texts

## Limitations

- Maximum text length: 50,000 characters (configurable)
- Timeout: 30 seconds (configurable)
- Concurrent requests: Limited by worker pool
- Language: Primarily English

## Related Skills

- [Text Analysis](../text-analysis/SKILL.md) - Advanced text processing
- [Data Extraction](./data-extraction/SKILL.md) - Extract structured data
- [Reporting](./reporting/SKILL.md) - Generate reports

## Support

- **Issues**: GitHub Issues
- **Documentation**: See ../../../docs/
- **Examples**: See ../../../examples/

---

**Skill Version**: 1.0.0  
**Last Updated**: 2026-08-24  
**Status**: Stable
