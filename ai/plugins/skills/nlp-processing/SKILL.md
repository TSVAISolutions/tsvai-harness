# NLP Processing Skill

> Advanced natural language processing with TSVAI

## Overview

Advanced NLP capabilities including entity recognition, topic modeling, and semantic analysis.

## Capabilities

- Named entity recognition (NER)
- Topic modeling and classification
- Semantic similarity analysis
- Language detection
- Text segmentation and tokenization

## Usage

```javascript
// Perform NER on text
const entities = await nlpProcessor.extractEntities(text, {
  types: ['PERSON', 'ORG', 'LOCATION']
});

// Classify text
const classification = await nlpProcessor.classify(text, {
  categories: ['positive', 'negative', 'neutral']
});
```

---

**Skill Version**: 1.0.0
