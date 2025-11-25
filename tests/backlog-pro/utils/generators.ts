import * as fc from 'fast-check';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  UserStory,
  AcceptanceCriteria,
  Sprint,
  TeamMember,
  TeamRole,
  Risk,
  ProfitShare,
  KPIMetrics,
} from '@/types';

/**
 * Generator for TaskStatus enum values
 */
export const taskStatusArb = (): fc.Arbitrary<TaskStatus> =>
  fc.constantFrom<TaskStatus>('todo', 'in-progress', 'review', 'done');

/**
 * Generator for TaskPriority enum values
 */
export const taskPriorityArb = (): fc.Arbitrary<TaskPriority> =>
  fc.constantFrom<TaskPriority>('low', 'medium', 'high', 'critical');

/**
 * Generator for TeamRole enum values
 */
export const teamRoleArb = (): fc.Arbitrary<TeamRole> =>
  fc.constantFrom<TeamRole>('Product Owner', 'Scrum Master', 'Developer', 'DevOps');

/**
 * Generator for ISO date strings
 * Constrains dates to valid range to avoid Invalid Date errors
 */
export const isoDateArb = (): fc.Arbitrary<string> =>
  fc.date({ 
    min: new Date('2000-01-01T00:00:00.000Z'), 
    max: new Date('2030-12-31T23:59:59.999Z') 
  }).map(date => {
    // Ensure the date is valid before converting to ISO string
    if (isNaN(date.getTime())) {
      return new Date('2000-01-01T00:00:00.000Z').toISOString();
    }
    return date.toISOString();
  });

/**
 * Generator for valid team member names
 * Uses the default team members: Pedro, David, Morena, Franco
 */
export const teamMemberNameArb = (): fc.Arbitrary<string> =>
  fc.constantFrom('Pedro', 'David', 'Morena', 'Franco');

/**
 * Generator for Task entities
 */
export const taskArb = (overrides?: Partial<Task>): fc.Arbitrary<Task> =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 0, maxLength: 500 }),
    status: taskStatusArb(),
    priority: taskPriorityArb(),
    storyPoints: fc.integer({ min: 0, max: 100 }),
    assignedTo: teamMemberNameArb(),
    estimatedDate: isoDateArb(),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
    sprintId: fc.option(fc.uuid(), { nil: undefined }),
    storyId: fc.option(fc.uuid(), { nil: undefined }),
    createdAt: isoDateArb(),
  }).map(task => ({ ...task, ...overrides }));

/**
 * Generator for AcceptanceCriteria
 */
export const acceptanceCriteriaArb = (): fc.Arbitrary<AcceptanceCriteria> =>
  fc.record({
    id: fc.uuid(),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    completed: fc.boolean(),
  });

/**
 * Generator for UserStory entities
 */
export const userStoryArb = (overrides?: Partial<UserStory>): fc.Arbitrary<UserStory> =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    role: fc.string({ minLength: 1, maxLength: 50 }),
    action: fc.string({ minLength: 1, maxLength: 100 }),
    benefit: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 0, maxLength: 500 }),
    storyPoints: fc.integer({ min: 0, max: 100 }),
    businessValue: fc.integer({ min: 0, max: 100 }),
    acceptanceCriteria: fc.array(acceptanceCriteriaArb(), { maxLength: 10 }),
    sprintId: fc.option(fc.uuid(), { nil: undefined }),
    createdAt: isoDateArb(),
  }).map(story => ({ ...story, ...overrides }));

/**
 * Generator for Sprint entities
 */
export const sprintArb = (overrides?: Partial<Sprint>): fc.Arbitrary<Sprint> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    goal: fc.string({ minLength: 1, maxLength: 200 }),
    startDate: isoDateArb(),
    endDate: isoDateArb(),
    velocity: fc.integer({ min: 0, max: 200 }),
    committedPoints: fc.integer({ min: 0, max: 200 }),
    completedPoints: fc.integer({ min: 0, max: 200 }),
    status: fc.constantFrom('planned', 'active', 'completed'),
  }).map(sprint => ({ ...sprint, ...overrides }));

/**
 * Generator for TeamMember entities
 */
export const teamMemberArb = (overrides?: Partial<TeamMember>): fc.Arbitrary<TeamMember> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    role: teamRoleArb(),
    skills: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
    availability: fc.integer({ min: 0, max: 100 }),
    image: fc.webUrl(),
    tasksCompleted: fc.integer({ min: 0, max: 1000 }),
    averageCycleTime: fc.integer({ min: 0, max: 100 }),
    velocity: fc.integer({ min: 0, max: 200 }),
  }).map(member => ({ ...member, ...overrides }));

/**
 * Generator for Risk entities
 */
export const riskArb = (overrides?: Partial<Risk>): fc.Arbitrary<Risk> =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 0, maxLength: 500 }),
    probability: fc.integer({ min: 1, max: 5 }),
    impact: fc.integer({ min: 1, max: 5 }),
    score: fc.integer({ min: 1, max: 25 }),
    mitigation: fc.string({ minLength: 0, maxLength: 500 }),
    owner: fc.string({ minLength: 1, maxLength: 50 }),
    status: fc.constantFrom('open', 'mitigated', 'closed'),
  }).map(risk => {
    // Ensure score is probability * impact
    const finalRisk = { ...risk, ...overrides };
    finalRisk.score = finalRisk.probability * finalRisk.impact;
    return finalRisk;
  });

/**
 * Generator for ProfitShare entities
 */
export const profitShareArb = (overrides?: Partial<ProfitShare>): fc.Arbitrary<ProfitShare> =>
  fc.record({
    memberId: fc.uuid(),
    memberName: fc.string({ minLength: 1, maxLength: 50 }),
    percentage: fc.integer({ min: 0, max: 100 }),
    amount: fc.float({ min: 0, max: 1000000, noNaN: true }),
  }).map(share => ({ ...share, ...overrides }));

/**
 * Generator for KPIMetrics
 */
export const kpiMetricsArb = (overrides?: Partial<KPIMetrics>): fc.Arbitrary<KPIMetrics> =>
  fc.record({
    velocity: fc.integer({ min: 0, max: 200 }),
    cycleTime: fc.integer({ min: 0, max: 100 }),
    sprintCompletionRate: fc.integer({ min: 0, max: 100 }),
    deploymentFrequency: fc.integer({ min: 0, max: 100 }),
    leadTime: fc.integer({ min: 0, max: 100 }),
    mttr: fc.integer({ min: 0, max: 100 }),
    changeFailureRate: fc.integer({ min: 0, max: 100 }),
    teamSatisfaction: fc.integer({ min: 0, max: 100 }),
  }).map(metrics => ({ ...metrics, ...overrides }));

/**
 * Generator for arrays of Tasks
 */
export const taskArrayArb = (minLength = 0, maxLength = 20): fc.Arbitrary<Task[]> =>
  fc.array(taskArb(), { minLength, maxLength });

/**
 * Generator for arrays of UserStories
 */
export const userStoryArrayArb = (minLength = 0, maxLength = 20): fc.Arbitrary<UserStory[]> =>
  fc.array(userStoryArb(), { minLength, maxLength });

/**
 * Generator for arrays of Sprints
 */
export const sprintArrayArb = (minLength = 0, maxLength = 10): fc.Arbitrary<Sprint[]> =>
  fc.array(sprintArb(), { minLength, maxLength });

/**
 * Generator for arrays of TeamMembers
 */
export const teamMemberArrayArb = (minLength = 0, maxLength = 20): fc.Arbitrary<TeamMember[]> =>
  fc.array(teamMemberArb(), { minLength, maxLength });

/**
 * Generator for arrays of Risks
 */
export const riskArrayArb = (minLength = 0, maxLength = 20): fc.Arbitrary<Risk[]> =>
  fc.array(riskArb(), { minLength, maxLength });

/**
 * Generator for arrays of ProfitShares
 */
export const profitShareArrayArb = (minLength = 0, maxLength = 20): fc.Arbitrary<ProfitShare[]> =>
  fc.array(profitShareArb(), { minLength, maxLength });
