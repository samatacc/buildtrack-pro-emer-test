/**
 * Task Generation Service Tests
 * 
 * Tests for the task generation service functionality.
 */

import { 
  generateTasksForMilestone, 
  generateTasks, 
  calculateTotalEstimatedHours,
  calculateTasksCompletion,
  TaskStatus,
  TaskPriority,
  Task
} from '../taskGenerationService';
import { Milestone, MilestoneStatus, ProjectType, TeamRole } from '../../types/project';

describe('Task Generation Service', () => {
  // Sample milestone for testing
  const sampleMilestone: Milestone = {
    id: 'milestone-1',
    name: 'Foundation Phase',
    description: 'Complete all foundation work',
    targetDate: new Date('2025-06-01'),
    status: MilestoneStatus.NOT_STARTED,
    deliverables: [
      { id: 'deliverable-1', name: 'Foundation complete', completed: false }
    ],
    dateCreated: new Date('2025-04-01')
  };
  
  const sampleMilestones: Milestone[] = [
    sampleMilestone,
    {
      id: 'milestone-2',
      name: 'Framing',
      description: 'Complete framing of the structure',
      targetDate: new Date('2025-07-01'),
      status: MilestoneStatus.NOT_STARTED,
      deliverables: [
        { id: 'deliverable-2', name: 'Walls framed', completed: false },
        { id: 'deliverable-3', name: 'Roof framed', completed: false }
      ],
      dateCreated: new Date('2025-04-01')
    }
  ];

  describe('generateTasksForMilestone', () => {
    it('should generate tasks for a residential milestone', () => {
      const tasks = generateTasksForMilestone(sampleMilestone, ProjectType.RESIDENTIAL);
      
      // Verify tasks were generated
      expect(tasks.length).toBeGreaterThan(0);
      
      // Verify task properties
      const firstTask = tasks[0];
      expect(firstTask).toHaveProperty('id');
      expect(firstTask).toHaveProperty('name');
      expect(firstTask).toHaveProperty('description');
      expect(firstTask).toHaveProperty('estimatedHours');
      expect(firstTask).toHaveProperty('dueDate');
      expect(firstTask.milestoneId).toBe(sampleMilestone.id);
      expect(firstTask.status).toBe(TaskStatus.NOT_STARTED);
    });
    
    it('should generate different tasks for different project types', () => {
      const residentialTasks = generateTasksForMilestone(sampleMilestone, ProjectType.RESIDENTIAL);
      const commercialTasks = generateTasksForMilestone(sampleMilestone, ProjectType.COMMERCIAL);
      
      // Task names should be different for different project types
      expect(residentialTasks.map(t => t.name)).not.toEqual(commercialTasks.map(t => t.name));
    });
    
    it('should handle milestones with names that don\'t match any category', () => {
      const oddMilestone: Milestone = {
        ...sampleMilestone,
        name: 'A very unusual milestone name that doesn\'t match patterns'
      };
      
      const tasks = generateTasksForMilestone(oddMilestone, ProjectType.RESIDENTIAL);
      
      // Should still generate tasks even for weird milestone names
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('generateTasks', () => {
    it('should generate tasks for all milestones', () => {
      const tasksByMilestone = generateTasks(sampleMilestones, ProjectType.RESIDENTIAL);
      
      // Should have entries for both milestones
      expect(Object.keys(tasksByMilestone).length).toBe(2);
      expect(tasksByMilestone).toHaveProperty('milestone-1');
      expect(tasksByMilestone).toHaveProperty('milestone-2');
      
      // Each milestone should have tasks
      expect(tasksByMilestone['milestone-1'].length).toBeGreaterThan(0);
      expect(tasksByMilestone['milestone-2'].length).toBeGreaterThan(0);
    });
  });

  describe('calculateTotalEstimatedHours', () => {
    it('should correctly calculate total hours', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          description: 'Description 1',
          estimatedHours: 10,
          status: TaskStatus.NOT_STARTED,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        },
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          estimatedHours: 15,
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        }
      ];
      
      const totalHours = calculateTotalEstimatedHours(tasks);
      expect(totalHours).toBe(25);
    });
    
    it('should return 0 for empty tasks array', () => {
      expect(calculateTotalEstimatedHours([])).toBe(0);
    });
  });

  describe('calculateTasksCompletion', () => {
    it('should correctly calculate completion percentage', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          description: 'Description 1',
          estimatedHours: 10,
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        },
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          estimatedHours: 15,
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        },
        {
          id: 'task-3',
          name: 'Task 3',
          description: 'Description 3',
          estimatedHours: 5,
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.LOW,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        },
        {
          id: 'task-4',
          name: 'Task 4',
          description: 'Description 4',
          estimatedHours: 20,
          status: TaskStatus.NOT_STARTED,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        }
      ];
      
      // 2 completed tasks out of 4 = 50%
      const completion = calculateTasksCompletion(tasks);
      expect(completion).toBe(50);
    });
    
    it('should handle all completed tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          description: 'Description 1',
          estimatedHours: 10,
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        },
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          estimatedHours: 15,
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.HIGH,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        }
      ];
      
      expect(calculateTasksCompletion(tasks)).toBe(100);
    });
    
    it('should handle no completed tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          description: 'Description 1',
          estimatedHours: 10,
          status: TaskStatus.NOT_STARTED,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        },
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          estimatedHours: 15,
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          dueDate: new Date(),
          milestoneId: 'milestone-1',
          dateCreated: new Date()
        }
      ];
      
      expect(calculateTasksCompletion(tasks)).toBe(0);
    });
    
    it('should return 0 for empty tasks array', () => {
      expect(calculateTasksCompletion([])).toBe(0);
    });
  });
});
