/**
 * Code Analysis and Improvement Utility
 * Analyzes code patterns and suggests improvements based on project context
 */

export interface CodeAnalysisResult {
  file: string;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  category: 'performance' | 'maintainability' | 'accessibility' | 'security' | 'best-practices';
  message: string;
  line?: number;
  column?: number;
  severity: 1 | 2 | 3 | 4 | 5; // 5 is most severe
}

export interface CodeSuggestion {
  category: 'refactoring' | 'optimization' | 'documentation' | 'testing' | 'architecture';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  example?: string;
}

export interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
  testCoverage?: number;
  duplicatedLines?: number;
}

/**
 * Analyzes a code file and returns analysis results
 */
export function analyzeCodeFile(filePath: string, content: string): CodeAnalysisResult {
  const issues: CodeIssue[] = [];
  const suggestions: CodeSuggestion[] = [];
  
  // Basic metrics calculation
  const lines = content.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  
  const metrics: CodeMetrics = {
    linesOfCode: nonEmptyLines.length,
    complexity: calculateCyclomaticComplexity(content),
    maintainabilityIndex: calculateMaintainabilityIndex(content),
  };

  // Analyze for common issues
  analyzeReactHooks(content, issues, suggestions);
  analyzePerformance(content, issues, suggestions);
  analyzeAccessibility(content, issues, suggestions);
  analyzeBestPractices(content, issues, suggestions);
  analyzeGameSpecificPatterns(content, issues, suggestions);

  return {
    file: filePath,
    issues,
    suggestions,
    metrics,
  };
}

/**
 * Calculates cyclomatic complexity
 */
function calculateCyclomaticComplexity(content: string): number {
  const complexityKeywords = ['if', 'else', 'for', 'while', 'case', 'catch', '&&', '||', '?'];
  let complexity = 1; // Base complexity
  
  complexityKeywords.forEach(keyword => {
    const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

/**
 * Calculates maintainability index (simplified version)
 */
function calculateMaintainabilityIndex(content: string): number {
  const loc = content.split('\n').length;
  const complexity = calculateCyclomaticComplexity(content);
  const halsteadVolume = Math.log2(content.length) * content.length; // Simplified
  
  // Simplified maintainability index formula
  const maintainabilityIndex = Math.max(0, 
    171 - 5.2 * Math.log(halsteadVolume) - 0.23 * complexity - 16.2 * Math.log(loc)
  );
  
  return Math.round(maintainabilityIndex);
}

/**
 * Analyzes React hooks usage
 */
function analyzeReactHooks(content: string, issues: CodeIssue[], suggestions: CodeSuggestion[]): void {
  // Check for missing dependencies in useEffect
  const useEffectPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[^}]*},\s*\[[^\]]*\]/g;
  const matches = content.match(useEffectPattern);
  
  if (matches) {
    issues.push({
      type: 'warning',
      category: 'best-practices',
      message: 'Consider reviewing useEffect dependencies to avoid potential bugs',
      severity: 3,
    });
    
    suggestions.push({
      category: 'refactoring',
      title: 'Optimize useEffect Dependencies',
      description: 'Use useCallback for functions and useMemo for expensive computations to optimize re-renders',
      impact: 'medium',
      effort: 'low',
      example: `
// Instead of:
useEffect(() => {
  doSomething();
}, []);

// Consider:
const memoizedCallback = useCallback(() => {
  doSomething();
}, [dependency]);

useEffect(() => {
  memoizedCallback();
}, [memoizedCallback]);
      `,
    });
  }
}

/**
 * Analyzes performance patterns
 */
function analyzePerformance(content: string, issues: CodeIssue[], suggestions: CodeSuggestion[]): void {
  // Check for img tags that should be Next.js Image
  if (content.includes('<img') && content.includes('next/')) {
    issues.push({
      type: 'warning',
      category: 'performance',
      message: 'Consider using Next.js Image component for better performance',
      severity: 2,
    });
    
    suggestions.push({
      category: 'optimization',
      title: 'Use Next.js Image Component',
      description: 'Replace img tags with Next.js Image for automatic optimization, lazy loading, and better performance',
      impact: 'high',
      effort: 'low',
      example: `
// Instead of:
<img src="/image.png" alt="description" />

// Use:
import Image from 'next/image';
<Image src="/image.png" alt="description" width={100} height={100} />
      `,
    });
  }

  // Check for inefficient re-renders
  if (content.includes('useState') && content.includes('useEffect')) {
    suggestions.push({
      category: 'optimization',
      title: 'Consider State Optimization',
      description: 'Use state batching and reduce unnecessary re-renders with proper state structure',
      impact: 'medium',
      effort: 'medium',
    });
  }
}

/**
 * Analyzes accessibility patterns
 */
function analyzeAccessibility(content: string, issues: CodeIssue[], suggestions: CodeSuggestion[]): void {
  // Check for missing alt text
  if (content.match(/<img[^>]*src[^>]*>/g) && !content.includes('alt=')) {
    issues.push({
      type: 'error',
      category: 'accessibility',
      message: 'Images must have alt text for accessibility',
      severity: 4,
    });
  }

  // Check for proper heading structure
  if (content.includes('<h') && !content.includes('h1')) {
    suggestions.push({
      category: 'documentation',
      title: 'Improve Heading Structure',
      description: 'Ensure proper heading hierarchy (h1 → h2 → h3) for better accessibility and SEO',
      impact: 'medium',
      effort: 'low',
    });
  }
}

/**
 * Analyzes general best practices
 */
function analyzeBestPractices(content: string, issues: CodeIssue[], suggestions: CodeSuggestion[]): void {
  // Check for console.log statements
  if (content.includes('console.log')) {
    issues.push({
      type: 'warning',
      category: 'best-practices',
      message: 'Remove console.log statements from production code',
      severity: 2,
    });
  }

  // Check for proper error handling
  if (content.includes('try') && !content.includes('catch')) {
    issues.push({
      type: 'warning',
      category: 'best-practices',
      message: 'Try blocks should have corresponding catch blocks',
      severity: 3,
    });
  }

  // Check for TypeScript usage
  if (!content.includes('interface') && !content.includes('type') && content.includes('function')) {
    suggestions.push({
      category: 'refactoring',
      title: 'Add Type Definitions',
      description: 'Define proper TypeScript interfaces and types for better type safety',
      impact: 'high',
      effort: 'medium',
    });
  }
}

/**
 * Analyzes game-specific patterns for this project
 */
function analyzeGameSpecificPatterns(content: string, issues: CodeIssue[], suggestions: CodeSuggestion[]): void {
  // Game mechanics improvements
  if (content.includes('gameMechanics') || content.includes('useGameStore')) {
    suggestions.push({
      category: 'architecture',
      title: 'Game State Management Enhancement',
      description: 'Consider implementing a more robust game state machine for complex interactions',
      impact: 'high',
      effort: 'high',
      example: `
// Consider using a state machine pattern:
enum GameState {
  IDLE = 'idle',
  RUNNING = 'running',
  JUMPING = 'jumping',
  DEAD = 'dead',
  COMPLETED = 'completed'
}

const gameStateMachine = {
  transitions: {
    [GameState.IDLE]: [GameState.RUNNING],
    [GameState.RUNNING]: [GameState.JUMPING, GameState.DEAD],
    [GameState.JUMPING]: [GameState.RUNNING, GameState.COMPLETED],
    // ... more transitions
  }
};
      `,
    });
  }

  // Animation performance
  if (content.includes('framer-motion') && content.includes('animate')) {
    suggestions.push({
      category: 'optimization',
      title: 'Optimize Animations',
      description: 'Use transform and opacity for better animation performance, consider will-change CSS property',
      impact: 'medium',
      effort: 'low',
    });
  }

  // Level progression logic
  if (content.includes('useLevels') || content.includes('completed')) {
    suggestions.push({
      category: 'architecture',
      title: 'Level Progression System',
      description: 'Implement a more flexible level progression system with prerequisites and branching paths',
      impact: 'medium',
      effort: 'high',
    });
  }
}

/**
 * Generates an improvement report for the entire project
 */
export function generateProjectReport(analysisResults: CodeAnalysisResult[]): string {
  const totalIssues = analysisResults.reduce((sum, result) => sum + result.issues.length, 0);
  const totalSuggestions = analysisResults.reduce((sum, result) => sum + result.suggestions.length, 0);
  const avgComplexity = analysisResults.reduce((sum, result) => sum + result.metrics.complexity, 0) / analysisResults.length;
  const avgMaintainability = analysisResults.reduce((sum, result) => sum + result.metrics.maintainabilityIndex, 0) / analysisResults.length;

  let report = `# Code Analysis Report\n\n`;
  report += `## Overview\n`;
  report += `- **Files Analyzed**: ${analysisResults.length}\n`;
  report += `- **Total Issues**: ${totalIssues}\n`;
  report += `- **Total Suggestions**: ${totalSuggestions}\n`;
  report += `- **Average Complexity**: ${avgComplexity.toFixed(1)}\n`;
  report += `- **Average Maintainability**: ${avgMaintainability.toFixed(1)}/100\n\n`;

  // Group issues by category
  const issuesByCategory = new Map<string, number>();
  const suggestionsByCategory = new Map<string, number>();

  analysisResults.forEach(result => {
    result.issues.forEach(issue => {
      issuesByCategory.set(issue.category, (issuesByCategory.get(issue.category) || 0) + 1);
    });
    result.suggestions.forEach(suggestion => {
      suggestionsByCategory.set(suggestion.category, (suggestionsByCategory.get(suggestion.category) || 0) + 1);
    });
  });

  report += `## Issues by Category\n`;
  Array.from(issuesByCategory.entries())
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      report += `- **${category}**: ${count} issues\n`;
    });

  report += `\n## Suggestions by Category\n`;
  Array.from(suggestionsByCategory.entries())
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      report += `- **${category}**: ${count} suggestions\n`;
    });

  report += `\n## Top Priority Improvements\n`;
  
  // Get high-impact, low-effort suggestions
  const prioritySuggestions = analysisResults
    .flatMap(result => result.suggestions)
    .filter(suggestion => suggestion.impact === 'high' && suggestion.effort === 'low')
    .slice(0, 5);

  prioritySuggestions.forEach((suggestion, index) => {
    report += `${index + 1}. **${suggestion.title}**: ${suggestion.description}\n`;
  });

  return report;
}