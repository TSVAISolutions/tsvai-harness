/**
 * Consensus Engine
 * Enables consensus-based decision making across agents
 * Integrates with consilient component for agreement resolution
 */

class ConsensusEngine {
  constructor(armyAgents, config = {}) {
    this.armyAgents = armyAgents;
    this.config = {
      quorumThreshold: config.quorumThreshold || 0.5,
      votingTimeout: config.votingTimeout || 30000,
      conflictResolution: config.conflictResolution || 'majority',
      ...config
    };

    this.proposals = new Map(); // proposalId -> proposal
    this.votes = new Map(); // proposalId -> votes
    this.decisions = new Map(); // proposalId -> decision
    this.proposalCounter = 0;
  }

  /**
   * Propose a decision to agents
   */
  async proposeDecision(proposal) {
    const proposalId = this._generateProposalId();

    const proposalObj = {
      id: proposalId,
      ...proposal,
      status: 'voting',
      createdAt: new Date().toISOString(),
      votesRequired: null,
      votes: {}
    };

    this.proposals.set(proposalId, proposalObj);
    this.votes.set(proposalId, {});

    // Gather votes from agents with capability
    const agents = this.armyAgents.findAgentsByCapability(proposal.capability);

    proposalObj.votesRequired = Math.ceil(agents.length * this.config.quorumThreshold);

    // Collect votes in parallel
    const votePromises = agents.map(agent =>
      this._getVoteFromAgent(agent, proposalObj)
    );

    try {
      const results = await Promise.race([
        Promise.all(votePromises),
        this._votingTimeout(this.config.votingTimeout)
      ]);

      // Process votes
      const decision = this._tabulateVotes(proposalObj);

      proposalObj.status = 'decided';
      proposalObj.decision = decision;
      this.decisions.set(proposalId, decision);

      return {
        proposalId,
        decided: true,
        decision: decision.outcome,
        consensus: decision.consensus,
        votes: decision.votesSummary
      };
    } catch (error) {
      proposalObj.status = 'failed';
      proposalObj.error = error.message;

      return {
        proposalId,
        decided: false,
        error: error.message
      };
    }
  }

  /**
   * Record vote for proposal
   */
  recordVote(proposalId, agentId, vote, reasoning = '') {
    const proposal = this.proposals.get(proposalId);

    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    if (proposal.status !== 'voting') {
      throw new Error(`Proposal not in voting state: ${proposalId}`);
    }

    proposal.votes[agentId] = {
      vote,
      reasoning,
      timestamp: new Date().toISOString()
    };

    this.votes.get(proposalId)[agentId] = vote;

    // Check if we have quorum
    const voteCount = Object.keys(proposal.votes).length;
    if (voteCount >= proposal.votesRequired) {
      proposal.status = 'quorum-reached';
    }

    return { success: true, proposalId, recorded: true };
  }

  /**
   * Resolve conflict between divergent proposals
   */
  resolveConflict(proposals, context = {}) {
    if (proposals.length === 0) {
      return { success: false, error: 'No proposals to resolve' };
    }

    if (proposals.length === 1) {
      return {
        success: true,
        resolved: true,
        outcome: proposals[0],
        confidence: 1.0,
        conflictLevel: 0
      };
    }

    // Calculate consensus score for each proposal
    const scores = proposals.map((prop, idx) => ({
      index: idx,
      proposal: prop,
      score: this._calculateConsensusScore(prop, context),
      supportLevel: this._calculateSupportLevel(prop, context)
    }));

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    const topProposal = scores[0];
    const secondProposal = scores.length > 1 ? scores[1] : null;

    // Determine conflict level
    const conflictLevel = secondProposal
      ? Math.abs(topProposal.score - secondProposal.score)
      : 0;

    return {
      success: true,
      resolved: true,
      outcome: topProposal.proposal,
      confidence: topProposal.supportLevel,
      conflictLevel,
      allProposals: scores.map(s => ({
        proposal: s.proposal,
        score: s.score,
        supportLevel: s.supportLevel
      }))
    };
  }

  /**
   * Get proposal status
   */
  getProposal(proposalId) {
    return this.proposals.get(proposalId) || null;
  }

  /**
   * Get decision for proposal
   */
  getDecision(proposalId) {
    return this.decisions.get(proposalId) || null;
  }

  /**
   * List recent proposals
   */
  listProposals(status = null, limit = 50) {
    let proposals = Array.from(this.proposals.values());

    if (status) {
      proposals = proposals.filter(p => p.status === status);
    }

    return proposals
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Get consensus statistics
   */
  getStatistics() {
    const proposals = Array.from(this.proposals.values());

    const byStatus = {
      voting: 0,
      'quorum-reached': 0,
      decided: 0,
      failed: 0
    };

    const consensusRates = [];
    let avgConflictLevel = 0;
    let conflictCount = 0;

    proposals.forEach(proposal => {
      byStatus[proposal.status] = (byStatus[proposal.status] || 0) + 1;

      if (proposal.decision) {
        consensusRates.push(proposal.decision.consensus);
        if (proposal.decision.consensusLevel < 0.8) {
          avgConflictLevel += proposal.decision.consensusLevel;
          conflictCount++;
        }
      }
    });

    const avgConsensus = consensusRates.length > 0
      ? consensusRates.reduce((a, b) => a + b, 0) / consensusRates.length
      : 0;

    avgConflictLevel = conflictCount > 0 ? avgConflictLevel / conflictCount : 0;

    return {
      totalProposals: proposals.length,
      byStatus,
      averageConsensus: Math.round(avgConsensus * 100),
      averageConflictLevel: Math.round(avgConflictLevel * 100),
      timestamp: new Date().toISOString()
    };
  }

  // ============ Private Methods ============

  async _getVoteFromAgent(agent, proposal) {
    try {
      const result = await this.armyAgents.callAgent(agent.id, 'vote', {
        proposalId: proposal.id,
        proposal: proposal.content
      });

      this.recordVote(proposal.id, agent.id, result.vote, result.reasoning);

      return { agentId: agent.id, vote: result.vote };
    } catch (error) {
      console.error(`Error getting vote from agent ${agent.id}:`, error);
      return { agentId: agent.id, error: error.message };
    }
  }

  _tabulateVotes(proposal) {
    const votes = Object.values(proposal.votes);

    if (votes.length === 0) {
      return {
        outcome: 'no-votes',
        consensus: 0,
        consensusLevel: 0,
        votesSummary: {}
      };
    }

    // Count votes
    const voteCounts = {};
    let consensus = null;

    votes.forEach(voteObj => {
      const vote = voteObj.vote;
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    });

    // Determine outcome by strategy
    if (this.config.conflictResolution === 'majority') {
      consensus = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0][0];
    } else if (this.config.conflictResolution === 'unanimous') {
      const allSame = Object.keys(voteCounts).length === 1;
      consensus = allSame ? Object.keys(voteCounts)[0] : 'conflict';
    }

    // Calculate consensus level (0-1)
    const consensusLevel = (voteCounts[consensus] || 0) / votes.length;

    return {
      outcome: consensus,
      consensus,
      consensusLevel,
      votesSummary: voteCounts
    };
  }

  _calculateConsensusScore(proposal, context) {
    let score = 0;

    // Base score from proposal strength
    if (proposal.confidence) {
      score += proposal.confidence * 0.5;
    }

    // Context-based weighting
    if (context.priority && proposal.priority === context.priority) {
      score += 0.3;
    }

    if (context.deadline && proposal.deadline <= context.deadline) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  _calculateSupportLevel(proposal, context) {
    if (!proposal.votes) return 0;

    const totalVotes = Object.keys(proposal.votes).length;
    if (totalVotes === 0) return 0;

    const supportVotes = Object.values(proposal.votes).filter(
      v => v.vote === 'yes' || v.vote === 'support'
    ).length;

    return supportVotes / totalVotes;
  }

  _generateProposalId() {
    return `prop-${Date.now()}-${++this.proposalCounter}`;
  }

  _votingTimeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Voting timeout exceeded'));
      }, ms);
    });
  }
}

module.exports = ConsensusEngine;
