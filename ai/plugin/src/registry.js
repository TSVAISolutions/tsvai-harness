/**
 * Plugin Registry
 * Provides API for discovering and querying available plugins/skills
 */

class PluginRegistry {
  constructor(loader) {
    this.loader = loader;
    this.metadata = new Map();
    this.index = {
      byName: new Map(),
      byCategory: new Map(),
      byCapability: new Map()
    };
  }

  /**
   * Build registry indexes from discovered skills
   */
  async build() {
    console.log('[Registry] Building indexes...');

    for (const [skillId, skillInfo] of this.loader.registry) {
      const [category, name] = skillId.split(':');

      // Store metadata
      this.metadata.set(skillId, skillInfo);

      // Index by name
      this.index.byName.set(name, skillId);

      // Index by category
      if (!this.index.byCategory.has(category)) {
        this.index.byCategory.set(category, []);
      }
      this.index.byCategory.get(category).push(skillId);

      // Index by capability
      for (const capability of skillInfo.capabilities || []) {
        if (!this.index.byCapability.has(capability)) {
          this.index.byCapability.set(capability, []);
        }
        this.index.byCapability.get(capability).push(skillId);
      }
    }

    console.log(`[Registry] Built indexes: ${this.metadata.size} skills`);
    return this;
  }

  /**
   * Find skills by name
   */
  findByName(name) {
    const skillId = this.index.byName.get(name);
    return skillId ? this.metadata.get(skillId) : null;
  }

  /**
   * Find skills by category
   */
  findByCategory(category) {
    const skillIds = this.index.byCategory.get(category) || [];
    return skillIds.map(id => this.metadata.get(id));
  }

  /**
   * Find skills by capability
   */
  findByCapability(capability) {
    const skillIds = this.index.byCapability.get(capability) || [];
    return skillIds.map(id => this.metadata.get(id));
  }

  /**
   * Search skills by query
   * Searches name, description, and capabilities
   */
  search(query) {
    const results = [];
    const q = query.toLowerCase();

    for (const [skillId, skill] of this.metadata) {
      // Check name
      if (skill.name.toLowerCase().includes(q) ||
          skill.displayName.toLowerCase().includes(q) ||
          skill.description.toLowerCase().includes(q)) {
        results.push({ skillId, skill, score: 1 });
      }
      // Check capabilities
      else if (skill.capabilities.some(cap => cap.toLowerCase().includes(q))) {
        results.push({ skillId, skill, score: 0.8 });
      }
    }

    // Sort by score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * List all available skills
   */
  listAll() {
    const skills = [];
    for (const [skillId, skill] of this.metadata) {
      const [category, name] = skillId.split(':');
      skills.push({
        id: skillId,
        category,
        name,
        displayName: skill.displayName,
        description: skill.description,
        capabilities: skill.capabilities,
        version: skill.version
      });
    }
    return skills;
  }

  /**
   * Get registry summary
   */
  summary() {
    return {
      totalSkills: this.metadata.size,
      categories: Array.from(this.index.byCategory.keys()),
      categoryCounts: Object.fromEntries(
        Array.from(this.index.byCategory.entries()).map(([cat, ids]) => [cat, ids.length])
      ),
      capabilities: Array.from(this.index.byCapability.keys()),
      capabilityCounts: Object.fromEntries(
        Array.from(this.index.byCapability.entries()).map(([cap, ids]) => [cap, ids.length])
      )
    };
  }

  /**
   * Get detailed skill info
   */
  getSkillInfo(skillId) {
    const skill = this.metadata.get(skillId);
    if (!skill) return null;

    const [category, name] = skillId.split(':');

    return {
      id: skillId,
      category,
      name,
      displayName: skill.displayName,
      description: skill.description,
      capabilities: skill.capabilities,
      version: skill.version,
      path: skill.path
    };
  }

  /**
   * Validate skill compatibility
   * Check if skill supports given operation
   */
  supportsOperation(skillId, operation) {
    const skill = this.metadata.get(skillId);
    if (!skill) return false;

    // Basic check - if operation matches any capability name
    return (skill.capabilities || []).some(cap =>
      cap.toLowerCase().replace(/\s+/g, '-') === operation.toLowerCase().replace(/\s+/g, '-')
    );
  }

  /**
   * Export registry as JSON
   */
  toJSON() {
    return {
      skills: Array.from(this.metadata.entries()).map(([id, skill]) => ({
        id,
        ...skill
      })),
      indexes: {
        categories: Array.from(this.index.byCategory.keys()),
        capabilities: Array.from(this.index.byCapability.keys())
      },
      summary: this.summary()
    };
  }
}

module.exports = PluginRegistry;
