/**
 * Documentation Generator and Updater
 * Automatically generates and updates documentation based on code analysis
 */

export interface DocumentationSection {
  title: string;
  content: string;
  type: 'overview' | 'api' | 'guide' | 'architecture' | 'changelog';
  priority: 'high' | 'medium' | 'low';
}

export interface APIDocumentation {
  name: string;
  description: string;
  parameters?: Parameter[];
  returns?: string;
  examples?: string[];
  usage?: string;
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  defaultValue?: string;
}

/**
 * Generates comprehensive documentation for the project
 */
export function generateProjectDocumentation(codeFiles: string[]): DocumentationSection[] {
  const sections: DocumentationSection[] = [];

  // Project overview
  sections.push(generateOverviewSection());
  
  // Architecture documentation
  sections.push(generateArchitectureSection());
  
  // API documentation
  sections.push(generateAPISection(codeFiles));
  
  // Development guide
  sections.push(generateDevelopmentGuide());
  
  // Game mechanics documentation
  sections.push(generateGameMechanicsDocumentation());
  
  // Best practices
  sections.push(generateBestPracticesSection());

  return sections;
}

/**
 * Generates project overview documentation
 */
function generateOverviewSection(): DocumentationSection {
  return {
    title: 'Project Overview',
    type: 'overview',
    priority: 'high',
    content: `
# Smartyou App - Educational Game Platform

## What is Smartyou App?

Smartyou App is an innovative educational gaming platform that combines learning with interactive gameplay. Players solve programming challenges to progress through levels while controlling a character that must navigate obstacles.

## Key Features

### 🎮 Interactive Gameplay
- Character animation and physics
- Real-time obstacle avoidance (cactus jumping)
- Smooth animations using Framer Motion

### 📚 Educational Content
- Progressive difficulty levels (Easy → Medium → Hard)
- Solidity programming challenges
- Real-time code validation and feedback

### 🎯 Progress Tracking
- Level completion tracking
- Achievement system with certificates
- Performance analytics and logs

### 🏗️ Modern Architecture
- Built with Next.js 15 and React 19
- Feature Sliced Design architecture
- TypeScript for type safety
- Zustand for state management

## Game Flow

1. **Level Selection**: Choose from available levels based on progress
2. **Challenge Presentation**: Read the programming problem and requirements
3. **Code Submission**: Write and submit solution code
4. **Game Execution**: Watch your character run and face obstacles
5. **Result**: Success leads to level progression, failure requires retry
6. **Certification**: Complete all levels to earn certificates

## Target Audience

- **Beginner Programmers**: Learning Solidity and blockchain concepts
- **Students**: Interactive way to practice coding skills
- **Educators**: Tool for gamified programming education
- **Developers**: Reference implementation of educational game mechanics
    `
  };
}

/**
 * Generates architecture documentation
 */
function generateArchitectureSection(): DocumentationSection {
  return {
    title: 'Architecture & Design',
    type: 'architecture',
    priority: 'high',
    content: `
# Architecture Documentation

## Feature Sliced Design (FSD)

The project follows Feature Sliced Design methodology with clear separation of concerns:

\`\`\`
src/
├── app/                 # Application layer - routing and pages
├── entities/            # Business entities - core data models
│   ├── level/          # Level entity with types and models
│   └── log/            # Logging entity for console output
├── features/           # Feature layer - business logic
│   ├── model/          # State management and business logic
│   └── ui/             # Feature-specific UI components
├── widgets/            # Widget layer - composite UI blocks
└── shared/             # Shared utilities and components
    ├── ui/             # Reusable UI components
    ├── lib/            # Utility functions and helpers
    └── model/          # Common data models
\`\`\`

## State Management Architecture

### Zustand Stores
- **useGameStore**: Core game state (running, jumping, dead, completed)
- **useConsole**: Game logs and console messages
- **useGameProfile**: Player profile and name management
- **useLevels**: Level progression and completion tracking

### State Flow
\`\`\`
User Action → Game Mechanics → State Update → UI Re-render
     ↓              ↓              ↓            ↓
[Click Run] → [run()] → [setPlayerRunning] → [Animation]
\`\`\`

## Component Architecture

### Core Components
- **LevelView**: Main level display container
- **Game**: Animated game panel with character and obstacles
- **Console**: Real-time logging and feedback system
- **LevelsList**: Navigation and progress overview

### Animation System
- **Framer Motion**: Smooth character animations and transitions
- **State-driven animations**: Animations respond to game state changes
- **Physics simulation**: Realistic jumping and collision detection

## Game Mechanics Flow

\`\`\`mermaid
graph TD
    A[Level Start] --> B[run()]
    B --> C[Player Running]
    C --> D[spawnCactus()]
    D --> E[Show Obstacle]
    E --> F{Code Correct?}
    F -->|Yes| G[complete()]
    F -->|No| H[die()]
    G --> I[Player Jumps]
    H --> J[Player Dies]
    I --> K[Level Complete]
    J --> L[Show Retry]
\`\`\`

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features and optimizations
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling

### State Management
- **Zustand**: Lightweight state management
- **Persist middleware**: Local storage integration

### Animation
- **Framer Motion**: Declarative animations
- **CSS transforms**: Hardware-accelerated animations

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript compiler**: Type checking and compilation
- **Tailwind**: Rapid UI development
    `
  };
}

/**
 * Generates API documentation by analyzing code files
 */
function generateAPISection(codeFiles: string[]): DocumentationSection {
  const apis = extractAPIDocumentation(codeFiles);
  
  let content = `# API Documentation\n\n`;
  
  content += `## Game Mechanics API\n\n`;
  content += generateGameMechanicsAPI();
  
  content += `\n## State Management Hooks\n\n`;
  content += generateHooksAPI();
  
  content += `\n## Utility Functions\n\n`;
  content += generateUtilityAPI();

  return {
    title: 'API Reference',
    type: 'api',
    priority: 'high',
    content
  };
}

/**
 * Generates game mechanics API documentation
 */
function generateGameMechanicsAPI(): string {
  return `
### \`run()\`
Initiates the game sequence by setting the player to running state.

**Usage:**
\`\`\`typescript
import { run } from '@/features/model/gameMechanics';

// Start the game
run();
\`\`\`

**Side Effects:**
- Sets \`playerRunning\` to \`true\`
- Sets \`playerDead\` to \`false\`

---

### \`spawnCactus()\`
Spawns a cactus obstacle that the player must avoid.

**Usage:**
\`\`\`typescript
import { spawnCactus } from '@/features/model/gameMechanics';

// Spawn obstacle after 1 second delay
setTimeout(spawnCactus, 1000);
\`\`\`

**Side Effects:**
- Sets \`completed\` to \`false\`
- Sets \`isCactusSpawned\` to \`true\`

---

### \`complete()\`
Handles successful level completion with jumping animation.

**Usage:**
\`\`\`typescript
import { complete } from '@/features/model/gameMechanics';

// Call when player provides correct answer
if (isAnswerCorrect) {
  complete();
}
\`\`\`

**Side Effects:**
- Triggers jumping animation (\`playerJumping: true\`)
- Sets level as completed
- Removes cactus after 1.2s delay

---

### \`die()\`
Handles player failure with death animation and logging.

**Usage:**
\`\`\`typescript
import { die } from '@/features/model/gameMechanics';

// Call when player provides incorrect answer
if (!isAnswerCorrect) {
  die();
}
\`\`\`

**Side Effects:**
- Sets \`playerDead\` to \`true\`
- Adds death message to console logs
- Stops player movement after 1s delay
  `;
}

/**
 * Generates hooks API documentation
 */
function generateHooksAPI(): string {
  return `
### \`useGameStore()\`
Main game state management hook.

**Returns:**
\`\`\`typescript
{
  playerRunning: boolean;      // Is player currently running
  playerJumping: boolean;      // Is player currently jumping
  playerDead: boolean;         // Is player in dead state
  isCactusSpawned: boolean;    // Is cactus obstacle visible
  completed: boolean;          // Is current level completed
  
  // Actions
  setPlayerRunning: (running: boolean) => void;
  setPlayerJumping: (jumping: boolean) => void;
  setPlayerDead: (dead: boolean) => void;
  setIsCactusSpawned: (spawned: boolean) => void;
  setCompleted: (completed: boolean) => void;
}
\`\`\`

**Usage:**
\`\`\`typescript
const { playerRunning, setPlayerRunning } = useGameStore();
\`\`\`

---

### \`useConsole()\`
Console logging and message management.

**Returns:**
\`\`\`typescript
{
  logs: Log[];                    // Array of log entries
  addLog: (message: string) => void;    // Add new log entry
  clearLogs: () => void;               // Clear all logs
}
\`\`\`

**Log Entry Structure:**
\`\`\`typescript
interface Log {
  message: string;
  timestamp: Date;
}
\`\`\`

---

### \`useGameProfile()\`
Player profile management with persistence.

**Returns:**
\`\`\`typescript
{
  name: string;                    // Player name
  setName: (name: string) => void; // Update player name
}
\`\`\`

**Features:**
- Automatically persists to localStorage
- Defaults to "Smart You Student"

---

### \`useLevels()\`
Level progression tracking and management.

**Returns:**
\`\`\`typescript
{
  completedLevels: number;                    // Number of completed levels
  setCompletedLevels: (count: number) => void; // Update completion count
  isLevelCompleted: (level: number) => boolean; // Check if level is done
  completeLevel: (level: number) => void;      // Mark level as completed
}
\`\`\`
  `;
}

/**
 * Generates utility API documentation
 */
function generateUtilityAPI(): string {
  return `
### Color Utilities (\`src/features/lib/color.ts\`)

Utility functions for color manipulation and theme management.

**Available Functions:**
- Color conversion utilities
- Theme color calculations
- Accessibility color helpers

### Level Transition (\`src/features/model/levelTransition.ts\`)

Handles smooth transitions between game levels.

**Features:**
- Animated level transitions
- State cleanup between levels
- Progress saving
  `;
}

/**
 * Generates development guide
 */
function generateDevelopmentGuide(): DocumentationSection {
  return {
    title: 'Development Guide',
    type: 'guide',
    priority: 'medium',
    content: `
# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm package manager
- Git for version control

### Installation
\`\`\`bash
# Clone the repository
git clone https://github.com/m3rshALL/smartyou-app.git
cd smartyou-app

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
\`\`\`

### Development Commands
\`\`\`bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
\`\`\`

## Project Structure Guidelines

### File Naming Conventions
- **Components**: PascalCase (\`GamePanel.tsx\`)
- **Hooks**: camelCase with "use" prefix (\`useGameStore.ts\`)
- **Types**: PascalCase (\`GameState.ts\`)
- **Utilities**: camelCase (\`formatTime.ts\`)

### Import Organization
\`\`\`typescript
// 1. External libraries
import React from 'react';
import { motion } from 'framer-motion';

// 2. Internal utilities and types
import { GameState } from '@/types';
import { formatTime } from '@/shared/lib/utils';

// 3. Components (from generic to specific)
import Widget from '@/shared/ui/Widget';
import GamePanel from './GamePanel';
\`\`\`

## Adding New Levels

### 1. Create Level Page
\`\`\`typescript
// src/app/levels/[number]/page.tsx
'use client';

import LevelView from '@/shared/ui/LevelView';
import { levelData } from './levelData';

export default function Level6() {
  return (
    <LevelView
      level={6}
      title={levelData.title}
      description={levelData.description}
      difficulty={levelData.difficulty}
      initialCode={levelData.initialCode}
      solution={levelData.solution}
    />
  );
}
\`\`\`

### 2. Define Level Data
\`\`\`typescript
// src/app/levels/6/levelData.ts
export const levelData = {
  title: "Advanced Smart Contracts",
  description: "Implement complex contract interactions...",
  difficulty: "hard" as const,
  initialCode: \`// Your code here\`,
  solution: \`// Expected solution\`,
  hints: [
    "Consider using events for logging",
    "Remember to handle edge cases"
  ]
};
\`\`\`

### 3. Update Level Registry
Add the new level to the levels configuration and navigation.

## State Management Best Practices

### Using Zustand Stores
\`\`\`typescript
// ✅ Good: Use selectors for specific state
const playerRunning = useGameStore(state => state.playerRunning);

// ❌ Avoid: Taking entire store
const gameStore = useGameStore();
\`\`\`

### State Updates
\`\`\`typescript
// ✅ Good: Batch related updates
const handleLevelComplete = () => {
  const { setCompleted, setPlayerJumping } = useGameStore.getState();
  setCompleted(true);
  setPlayerJumping(true);
};

// ❌ Avoid: Multiple separate calls
setCompleted(true);
setTimeout(() => setPlayerJumping(true), 0);
\`\`\`

## Animation Guidelines

### Performance Optimization
\`\`\`typescript
// ✅ Good: Use transform properties
animate={{ x: 250, y: -50 }}

// ❌ Avoid: Animating layout properties
animate={{ left: 250, top: -50 }}
\`\`\`

### Animation States
\`\`\`typescript
// Define clear animation states
const variants = {
  idle: { x: 0, y: 0 },
  running: { x: 250, y: 0 },
  jumping: { x: 400, y: -100 },
  dead: { x: 300, y: 50, rotate: 45 }
};
\`\`\`

## Testing Strategy

### Component Testing
Focus on testing behavior, not implementation:
- Level progression logic
- Game state transitions
- User interaction flows

### Integration Testing
- Complete game flow from start to finish
- Level transition mechanisms
- State persistence

## Code Style Guidelines

### TypeScript Usage
- Always define proper interfaces
- Use union types for state enums
- Avoid \`any\` type

### Component Design
- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper error boundaries

### Performance Considerations
- Use React.memo for expensive components
- Implement proper useCallback/useMemo usage
- Optimize re-render cycles
    `
  };
}

/**
 * Generates game mechanics documentation
 */
function generateGameMechanicsDocumentation(): DocumentationSection {
  return {
    title: 'Game Mechanics',
    type: 'guide',
    priority: 'high',
    content: `
# Game Mechanics Documentation

## Core Game Loop

The Smartyou App follows a structured game loop that combines educational content with interactive gameplay:

### 1. Level Initialization
\`\`\`typescript
// When a level starts:
1. Display challenge description
2. Load initial code template
3. Reset game state to idle
4. Clear previous logs
\`\`\`

### 2. Code Execution Phase
\`\`\`typescript
// When user submits code:
1. Validate code syntax
2. Run code against test cases
3. Determine success/failure
4. Trigger appropriate game response
\`\`\`

### 3. Game Animation Phase
\`\`\`typescript
// Based on code validation result:
Success → run() → spawnCactus() → complete() → levelComplete
Failure → run() → spawnCactus() → die() → retry
\`\`\`

## Animation System

### Character States
\`\`\`typescript
enum CharacterState {
  IDLE = 'idle',           // Standing still
  RUNNING = 'running',     // Moving forward
  JUMPING = 'jumping',     // Jumping over obstacle
  DEAD = 'dead'           // Failed attempt
}
\`\`\`

### Animation Timing
- **Running Start**: Immediate (0ms)
- **Cactus Spawn**: 1000ms delay
- **Jump Duration**: 1200ms
- **Death Animation**: 1000ms
- **State Reset**: After animation completion

### Physics Parameters
\`\`\`typescript
const ANIMATION_CONFIG = {
  // Character movement
  runningSpeed: 0.8,      // seconds to reach position
  jumpHeight: -165,       // pixels (negative = up)
  jumpDistance: 350,      // horizontal jump distance
  
  // Obstacle movement
  cactusSpeed: 1.5,       // seconds to cross screen
  cactusSpawnDelay: 1000, // ms after running starts
  
  // Timing
  animationEasing: 'easeInOut',
  stateTransitionDelay: 200
};
\`\`\`

## Level Progression System

### Difficulty Scaling
\`\`\`typescript
interface LevelConfig {
  number: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];          // Programming concepts taught
  prerequisites: number[];      // Required previous levels
  hints: string[];             // Available hints
  timeLimit?: number;          // Optional time constraint
}
\`\`\`

### Completion Criteria
1. **Code Correctness**: Solution must pass all test cases
2. **Syntax Validation**: Code must be syntactically valid
3. **Best Practices**: Optional style checks for advanced levels

### Progress Tracking
\`\`\`typescript
// Progress is automatically saved to localStorage
const progressData = {
  completedLevels: number,     // Count of completed levels
  currentLevel: number,        // Currently selected level
  playerName: string,          // Player's chosen name
  totalAttempts: number,       // Total coding attempts
  completionTime: number[]     // Time taken per level
};
\`\`\`

## Console System

### Log Categories
\`\`\`typescript
enum LogType {
  INFO = 'info',        // General information
  SUCCESS = 'success',  // Successful operations
  ERROR = 'error',      // Error messages
  DEATH = 'death',      // Character death events
  HINT = 'hint'         // Educational hints
}
\`\`\`

### Automatic Logging
The system automatically logs:
- Level start/completion events
- Code execution results
- Game state changes
- Error messages and hints
- Performance metrics

## Educational Integration

### Code Validation Flow
\`\`\`typescript
1. Syntax Check → Parse user code for syntax errors
2. Test Execution → Run against predefined test cases
3. Output Validation → Compare results with expected output
4. Best Practices → Check for code quality (optional)
5. Game Response → Trigger success/failure animations
\`\`\`

### Learning Progression
- **Levels 1-2**: Basic Solidity syntax and variables
- **Levels 3-4**: Functions and control structures
- **Level 5**: Advanced concepts and contract interaction

### Hint System
\`\`\`typescript
// Hints are provided contextually based on:
- Number of failed attempts
- Time spent on level
- Common error patterns
- Previous completion data
\`\`\`

## Performance Optimization

### Animation Performance
- Use CSS transforms for hardware acceleration
- Batch state updates to minimize re-renders
- Implement proper cleanup for animation timers

### Memory Management
- Clear logs periodically to prevent memory buildup
- Dispose of unused resources between levels
- Optimize image assets for faster loading

### State Management
- Use selectors to prevent unnecessary re-renders
- Implement proper dependency arrays in useEffect
- Batch related state updates together
    `
  };
}

/**
 * Generates best practices documentation
 */
function generateBestPracticesSection(): DocumentationSection {
  return {
    title: 'Best Practices',
    type: 'guide',
    priority: 'medium',
    content: `
# Best Practices Guide

## Code Quality Standards

### TypeScript Best Practices
\`\`\`typescript
// ✅ Good: Proper interface definitions
interface GameState {
  playerRunning: boolean;
  playerJumping: boolean;
  playerDead: boolean;
}

// ❌ Avoid: Using any type
const gameState: any = { ... };

// ✅ Good: Union types for constrained values
type Difficulty = 'easy' | 'medium' | 'hard';

// ❌ Avoid: Generic strings for constrained values
const difficulty: string = 'easy';
\`\`\`

### React Component Best Practices
\`\`\`typescript
// ✅ Good: Proper component structure
interface GamePanelProps {
  level: number;
  onComplete: () => void;
}

const GamePanel: React.FC<GamePanelProps> = ({ level, onComplete }) => {
  // Component logic here
};

// ✅ Good: Use React.memo for expensive components
export default React.memo(GamePanel);
\`\`\`

### State Management Best Practices
\`\`\`typescript
// ✅ Good: Specific state selectors
const playerRunning = useGameStore(state => state.playerRunning);

// ✅ Good: Batch related updates
const handleLevelStart = () => {
  const { setPlayerRunning, setCompleted } = useGameStore.getState();
  setPlayerRunning(true);
  setCompleted(false);
};
\`\`\`

## Performance Guidelines

### Animation Optimization
\`\`\`typescript
// ✅ Good: Use transform properties
const variants = {
  running: { x: 250, y: 0 },
  jumping: { x: 400, y: -100 }
};

// ✅ Good: Hardware acceleration
.game-character {
  will-change: transform;
  transform: translateZ(0);
}
\`\`\`

### Memory Management
\`\`\`typescript
// ✅ Good: Cleanup effects
useEffect(() => {
  const timer = setTimeout(spawnCactus, 1000);
  return () => clearTimeout(timer);
}, []);

// ✅ Good: Limit log history
const MAX_LOGS = 100;
if (logs.length > MAX_LOGS) {
  logs.splice(0, logs.length - MAX_LOGS);
}
\`\`\`

## Accessibility Guidelines

### Semantic HTML
\`\`\`typescript
// ✅ Good: Proper semantic structure
<main role="main">
  <h1>Level 1: Variables</h1>
  <section aria-label="Game area">
    <canvas aria-label="Game visualization" />
  </section>
  <aside aria-label="Console output">
    <div role="log" aria-live="polite">
      {logs.map(log => <div key={log.id}>{log.message}</div>)}
    </div>
  </aside>
</main>
\`\`\`

### Keyboard Navigation
\`\`\`typescript
// ✅ Good: Keyboard support
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    runCode();
  }
  if (event.key === 'Escape') {
    resetGame();
  }
};
\`\`\`

## Security Considerations

### Code Execution Safety
- Never execute user code directly in the browser
- Use sandboxed environments for code validation
- Implement proper input sanitization
- Validate all user inputs before processing

### Data Persistence
\`\`\`typescript
// ✅ Good: Safe localStorage usage
const saveProgress = (data: ProgressData) => {
  try {
    const sanitized = sanitizeProgressData(data);
    localStorage.setItem('gameProgress', JSON.stringify(sanitized));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
};
\`\`\`

## Testing Strategy

### Unit Testing
\`\`\`typescript
// Test game mechanics functions
describe('gameMechanics', () => {
  test('run() should set player to running state', () => {
    run();
    expect(useGameStore.getState().playerRunning).toBe(true);
  });
});
\`\`\`

### Integration Testing
\`\`\`typescript
// Test complete game flow
describe('Level completion flow', () => {
  test('should complete level when correct code is submitted', async () => {
    // Arrange
    const correctCode = 'return 42;';
    
    // Act
    await submitCode(correctCode);
    
    // Assert
    expect(useGameStore.getState().completed).toBe(true);
  });
});
\`\`\`

## Documentation Standards

### Code Comments
\`\`\`typescript
/**
 * Handles the game completion sequence
 * Triggers jumping animation and updates level progress
 * 
 * @side-effects Updates game state and adds console log
 * @timing Animation completes after 1200ms
 */
export function complete() {
  // Implementation...
}
\`\`\`

### README Structure
- Clear project description
- Installation instructions
- Usage examples
- API documentation
- Contributing guidelines
- License information

## Error Handling

### Graceful Degradation
\`\`\`typescript
// ✅ Good: Fallback for failed operations
const runGame = async () => {
  try {
    await initializeGame();
    await startLevel();
  } catch (error) {
    console.error('Game initialization failed:', error);
    showErrorMessage('Unable to start game. Please refresh and try again.');
  }
};
\`\`\`

### User-Friendly Messages
\`\`\`typescript
// ✅ Good: Clear error messages
const ERROR_MESSAGES = {
  SYNTAX_ERROR: 'Your code has a syntax error. Check for missing semicolons or brackets.',
  TIMEOUT: 'Code execution timed out. Consider optimizing your solution.',
  RUNTIME_ERROR: 'Your code encountered an error during execution.',
};
\`\`\`
    `
  };
}

/**
 * Extracts API documentation from code files (placeholder implementation)
 */
function extractAPIDocumentation(codeFiles: string[]): APIDocumentation[] {
  // This would analyze actual code files to extract function signatures,
  // comments, and usage patterns. For now, returning empty array.
  return [];
}

/**
 * Updates existing documentation with new content
 */
export function updateDocumentation(
  existingContent: string,
  newSections: DocumentationSection[]
): string {
  let updatedContent = existingContent;
  
  newSections.forEach(section => {
    const sectionHeader = `# ${section.title}`;
    const sectionEnd = '\n\n---\n\n';
    
    if (updatedContent.includes(sectionHeader)) {
      // Update existing section
      const startIndex = updatedContent.indexOf(sectionHeader);
      const endIndex = updatedContent.indexOf(sectionEnd, startIndex);
      
      if (endIndex !== -1) {
        updatedContent = 
          updatedContent.substring(0, startIndex) +
          section.content +
          sectionEnd +
          updatedContent.substring(endIndex + sectionEnd.length);
      }
    } else {
      // Add new section
      updatedContent += `\n\n${section.content}${sectionEnd}`;
    }
  });
  
  return updatedContent;
}

/**
 * Generates a comprehensive documentation update for the README
 */
export function generateReadmeUpdate(): string {
  const sections = generateProjectDocumentation([]);
  
  let readme = `# Smartyou App\n\n`;
  readme += `**Smartyou App** — это обучающая игра, которая сочетает изучение программирования с интерактивным геймплеем.\n\n`;
  
  // Add table of contents
  readme += `## Содержание\n\n`;
  sections.forEach((section, index) => {
    readme += `${index + 1}. [${section.title}](#${section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')})\n`;
  });
  readme += `\n`;
  
  // Add all sections
  sections.forEach(section => {
    readme += `${section.content}\n\n---\n\n`;
  });
  
  return readme;
}