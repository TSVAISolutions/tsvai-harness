# Text Analysis Skill

> Advanced text processing, transformation, and analysis capabilities for TSVAI

## Overview

The Text Analysis skill provides powerful tools for processing and understanding textual content. It combines NLP techniques with practical utilities for common text operations.

## Capabilities

- **Text Statistics**: Word/character counts, complexity metrics
- **Content Understanding**: Keyword extraction, topic identification
- **Sentiment & Emotion**: Emotional tone analysis
- **Text Quality**: Readability, clarity, and engagement scoring
- **Text Transformation**: Summarization, expansion, rewriting

## Usage

### Basic Text Analysis

```python
analyze(text, operations=['wordCount', 'stats'])
```

**Parameters:**
- `text` (string): Text to analyze
- `operations` (array): Operations to perform

**Operations:**
- `wordCount` - Count words
- `charCount` - Count characters
- `stats` - Generate comprehensive statistics
- `keywords` - Extract keywords
- `sentiment` - Analyze sentiment

### Advanced Analysis

```python
advanced_analyze(text, config={})
```

**Config Options:**
- `language` - Language code (default: 'en')
- `includeMetadata` - Include metadata (default: true)
- `performanceMode` - Optimize for speed (default: false)

## Examples

### Example 1: Blog Post Analysis

Analyze content for SEO and readability:

```python
post = get_blog_post()
analysis = analyze(post, ['stats', 'keywords', 'sentiment'])

# Check readability
if analysis['stats']['readabilityScore'] < 60:
    print("Content too complex, consider simplifying")

# Get key topics
topics = [k['word'] for k in analysis['keywords'][:3]]
print(f"Main topics: {topics}")
```

### Example 2: Content Quality Check

Evaluate content quality across multiple dimensions:

```python
def check_content_quality(text):
    result = analyze(text, ['stats', 'sentiment', 'keywords'])
    
    checks = {
        'length': result['wordCount'] >= 300,
        'complexity': result['stats']['readabilityScore'] >= 60,
        'positive_sentiment': result['sentiment']['sentiment'] == 'positive',
        'keywords_found': len(result['keywords']) >= 3
    }
    
    return sum(checks.values()) >= 3  # Pass if 3+ checks
```

### Example 3: Sentiment Tracking Over Time

Monitor how sentiment changes across versions:

```python
versions = [v1_content, v2_content, v3_content]
sentiments = []

for version in versions:
    result = analyze(version, ['sentiment'])
    sentiments.append({
        'version': version['id'],
        'sentiment': result['sentiment']['sentiment'],
        'score': result['sentiment']['score']
    })

# Analyze trend
print("Sentiment progression:", [s['sentiment'] for s in sentiments])
```

## Performance Tips

1. **Batch Operations**: Process multiple texts efficiently
2. **Cache Results**: Reuse analysis for repeated texts
3. **Select Operations**: Only request needed operations
4. **Large Texts**: Split very large texts for faster processing

## Configuration

### Environment Variables

```bash
TEXT_ANALYSIS_MAX_LENGTH=100000
TEXT_ANALYSIS_TIMEOUT=60000
TEXT_ANALYSIS_CACHE_ENABLED=true
TEXT_ANALYSIS_LANGUAGE=en
```

### Plugin Config

```json
{
  "maxTextLength": 100000,
  "timeout": 60000,
  "enableCache": true,
  "cacheTTL": 7200,
  "defaultLanguage": "en"
}
```

## API Reference

### analyze()

Perform comprehensive text analysis.

```python
analyze(
    text: str,
    operations: List[str] = ['wordCount', 'stats'],
    config: Dict = {}
) -> Dict
```

**Response:**
```json
{
  "success": true,
  "text": "Preview of text...",
  "wordCount": 150,
  "charCount": 892,
  "analysis": {
    "stats": {
      "wordCount": 150,
      "charCount": 892,
      "sentenceCount": 8,
      "avgWordLength": 5.95,
      "readabilityScore": 72
    },
    "keywords": [
      {"word": "analysis", "frequency": 5}
    ],
    "sentiment": {
      "sentiment": "positive",
      "score": 0.65
    }
  }
}
```

### extract_keywords()

Extract and rank important terms.

```python
extract_keywords(
    text: str,
    topN: int = 5,
    config: Dict = {}
) -> Dict
```

### analyze_sentiment()

Determine emotional tone.

```python
analyze_sentiment(
    text: str,
    config: Dict = {}
) -> Dict
```

## Error Handling

### Common Errors

**Text Too Long**
```
Error: Text exceeds maximum length (50000 chars)
Solution: Split text or increase maxTextLength
```

**Timeout**
```
Error: Analysis timeout (30 seconds)
Solution: Reduce text length or increase timeout
```

**Invalid Operation**
```
Error: Unknown operation: xyz
Solution: Use valid operations: wordCount, charCount, stats, keywords
```

## Best Practices

1. **Validate Input**: Always validate text before analysis
2. **Handle Errors**: Implement proper error handling
3. **Use Caching**: Cache results for repeated analyses
4. **Monitor Performance**: Track execution times
5. **Log Operations**: Log analysis operations for debugging

## Limitations

- **Max Length**: 100,000 characters (adjustable)
- **Timeout**: 60 seconds (adjustable)
- **Language**: Primarily optimized for English
- **Concurrent**: Limited by worker pool size

## Advanced Topics

### Custom Analysis Plugins

Extend text analysis with custom operations:

```python
class CustomAnalysis(TextAnalyzer):
    def custom_operation(self, text):
        # Your custom logic
        return result
```

### Streaming Results

For large texts, stream results:

```python
for chunk in stream_analyze(large_text):
    process(chunk)
```

## Related Skills

- [Analytics](../analytics/SKILL.md) - Data analysis and reporting
- [NLP Processing](./nlp/SKILL.md) - Advanced NLP operations
- [Content Generation](./generation/SKILL.md) - Generate text content

## Troubleshooting

### Analysis Seems Incorrect

1. Verify input text format
2. Check text encoding (UTF-8 recommended)
3. Review analysis parameters
4. Check against examples

### Performance Issues

1. Reduce text length
2. Disable unnecessary operations
3. Enable caching
4. Check system resources

## Support & Resources

- **Documentation**: See [docs/](../../docs/)
- **Examples**: See [examples/](../../examples/)
- **API Reference**: See [sample-plugin/README.md](../../sample-plugin/README.md)
- **Issues**: GitHub Issues

---

**Skill Version**: 1.0.0  
**Last Updated**: 2026-08-24  
**Maturity**: Production-Ready
