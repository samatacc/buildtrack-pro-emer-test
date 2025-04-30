/**
 * Milestone Generation Service
 * 
 * Provides functionality for auto-generating project milestones based on:
 * - Project type (residential, commercial, industrial, etc.)
 * - Project timeline (start date, end date)
 * - Project scope (size, budget)
 * 
 * This implementation provides templated milestones for different project types
 * and intelligently adjusts timelines based on project duration.
 */

import { Milestone, MilestoneStatus, ProjectType, Deliverable } from '@/lib/types/project';

export interface MilestoneTemplate {
  name: string;
  description: string;
  relativePosition: number; // 0-1 representing position in the project timeline
  deliverables: string[];
}

// Project type specific milestone templates
const milestoneTemplates: Record<ProjectType, MilestoneTemplate[]> = {
  [ProjectType.RESIDENTIAL]: [
    {
      name: 'Project Initiation & Planning',
      description: 'Initial project setup, planning, and design documents finalization',
      relativePosition: 0.05,
      deliverables: [
        'Approved architectural drawings',
        'Project schedule finalized',
        'Building permit applications submitted',
        'Contractor selection completed'
      ]
    },
    {
      name: 'Foundation & Structural Framework',
      description: 'Completion of the building foundation and structural framing',
      relativePosition: 0.2,
      deliverables: [
        'Excavation completed',
        'Foundation poured and cured',
        'Structural framing erected',
        'Building wrap installed',
        'Roof structure completed'
      ]
    },
    {
      name: 'Rough-ins & Exterior Completion',
      description: 'Completion of mechanical, electrical, and plumbing rough-ins with exterior finishes',
      relativePosition: 0.4,
      deliverables: [
        'Electrical rough-in completed',
        'Plumbing rough-in completed',
        'HVAC system installed',
        'Windows and doors installed',
        'Roofing completed',
        'Exterior siding/finishes completed'
      ]
    },
    {
      name: 'Interior Finishing',
      description: 'Completion of all interior finishes and fixtures',
      relativePosition: 0.7,
      deliverables: [
        'Drywall installation and finishing',
        'Interior painting completed',
        'Flooring installed',
        'Cabinetry and countertops installed',
        'Plumbing fixtures installed',
        'Electrical fixtures installed'
      ]
    },
    {
      name: 'Final Inspections & Handover',
      description: 'Final inspections, punch list completion, and project handover',
      relativePosition: 0.95,
      deliverables: [
        'All building inspections passed',
        'Final cleaning completed',
        'Punch list items addressed',
        'Certificate of occupancy obtained',
        'Homeowner walkthrough completed',
        'Project documentation delivered'
      ]
    }
  ],
  
  [ProjectType.COMMERCIAL]: [
    {
      name: 'Pre-Construction Phase',
      description: 'Site analysis, design development, and permitting',
      relativePosition: 0.05,
      deliverables: [
        'Site analysis report completed',
        'Design development drawings approved',
        'Construction documents finalized',
        'Building permits obtained',
        'Contractor bidding completed',
        'Construction contracts signed'
      ]
    },
    {
      name: 'Site Preparation & Foundation',
      description: 'Site clearing, excavation, and foundation work',
      relativePosition: 0.15,
      deliverables: [
        'Site demolition completed',
        'Utilities located and marked',
        'Excavation completed',
        'Foundation formwork and reinforcement installed',
        'Foundation concrete poured and cured',
        'Waterproofing completed'
      ]
    },
    {
      name: 'Structural Framework',
      description: 'Steel/concrete structure erection and exterior enclosure',
      relativePosition: 0.3,
      deliverables: [
        'Structural steel/concrete frame erected',
        'Floor decks installed',
        'Exterior wall framing completed',
        'Roof structure completed',
        'Building envelope weather-tight'
      ]
    },
    {
      name: 'MEP Rough-ins & Core Systems',
      description: 'Mechanical, electrical, plumbing, and fire protection systems installation',
      relativePosition: 0.5,
      deliverables: [
        'HVAC ductwork and equipment installed',
        'Electrical conduits and wiring installed',
        'Plumbing piping installed',
        'Fire protection system installed',
        'Elevator installation started',
        'Low voltage systems roughed-in'
      ]
    },
    {
      name: 'Interior Construction',
      description: 'Interior partitions, finishes, and fixtures installation',
      relativePosition: 0.7,
      deliverables: [
        'Interior framing completed',
        'Drywall installation and finishing',
        'Ceiling systems installed',
        'Interior painting completed',
        'Flooring installed',
        'Millwork and cabinetry installed'
      ]
    },
    {
      name: 'Building Systems Completion',
      description: 'Completion and testing of all building systems',
      relativePosition: 0.85,
      deliverables: [
        'HVAC system tested and balanced',
        'Electrical systems tested',
        'Plumbing fixtures installed and tested',
        'Fire alarm and sprinkler systems tested',
        'Building automation system programmed',
        'Commissioning procedures initiated'
      ]
    },
    {
      name: 'Project Completion & Closeout',
      description: 'Final inspections, commissioning, and project closeout',
      relativePosition: 0.95,
      deliverables: [
        'Final building inspections passed',
        'Certificate of occupancy obtained',
        'Systems commissioning completed',
        'Punch list items addressed',
        'Final cleaning completed',
        'Owner training conducted',
        'Project documentation delivered'
      ]
    }
  ],
  
  [ProjectType.INDUSTRIAL]: [
    {
      name: 'Project Definition & Engineering',
      description: 'Project scope definition, engineering design, and regulatory approvals',
      relativePosition: 0.05,
      deliverables: [
        'Project charter approved',
        'Process flow diagrams finalized',
        'Equipment specifications completed',
        'Engineering drawings approved',
        'Environmental permits obtained',
        'Construction permits secured'
      ]
    },
    {
      name: 'Site Development & Foundation',
      description: 'Site preparation and foundation construction',
      relativePosition: 0.15,
      deliverables: [
        'Site clearing and grading completed',
        'Soil stabilization completed',
        'Utilities infrastructure installed',
        'Foundation design verified',
        'Foundation concrete poured and cured',
        'Equipment pads constructed'
      ]
    },
    {
      name: 'Structural Construction',
      description: 'Building structure and envelope construction',
      relativePosition: 0.3,
      deliverables: [
        'Steel structure erected',
        'Roof system installed',
        'Exterior cladding completed',
        'Floor slabs poured',
        'Overhead crane systems installed',
        'Loading docks constructed'
      ]
    },
    {
      name: 'Utility & Process Systems',
      description: 'Installation of utility services and process systems',
      relativePosition: 0.5,
      deliverables: [
        'Electrical distribution system installed',
        'Compressed air system installed',
        'Process piping installed',
        'HVAC systems installed',
        'Water treatment systems installed',
        'Waste management systems installed'
      ]
    },
    {
      name: 'Process Equipment Installation',
      description: 'Installation of manufacturing equipment and production lines',
      relativePosition: 0.65,
      deliverables: [
        'Production equipment delivered',
        'Equipment foundations and anchoring completed',
        'Equipment installation and alignment',
        'Conveyor systems installed',
        'Control systems installed',
        'Equipment connections completed'
      ]
    },
    {
      name: 'Systems Integration & Testing',
      description: 'Integration and testing of all production and utility systems',
      relativePosition: 0.8,
      deliverables: [
        'Electrical systems tested',
        'Process systems tested',
        'Control systems programmed and tested',
        'Safety systems verified',
        'Production line dry run completed',
        'System integration verified'
      ]
    },
    {
      name: 'Commissioning & Validation',
      description: 'Final commissioning, validation, and handover of the facility',
      relativePosition: 0.95,
      deliverables: [
        'Pre-commissioning checklist completed',
        'Systems commissioning completed',
        'Performance qualification conducted',
        'Facility validation documentation completed',
        'Staff training completed',
        'Final handover and acceptance'
      ]
    }
  ],
  
  [ProjectType.INFRASTRUCTURE]: [
    {
      name: 'Feasibility & Preliminary Design',
      description: 'Project feasibility studies, environmental assessments, and preliminary design',
      relativePosition: 0.05,
      deliverables: [
        'Feasibility study completed',
        'Environmental impact assessment',
        'Preliminary design drawings',
        'Geotechnical investigations completed',
        'Stakeholder consultations conducted',
        'Regulatory approvals initiated'
      ]
    },
    {
      name: 'Detailed Design & Permitting',
      description: 'Completion of detailed engineering design and obtaining necessary permits',
      relativePosition: 0.15,
      deliverables: [
        'Detailed design drawings completed',
        'Design specifications finalized',
        'Construction methodology established',
        'Traffic management plan developed',
        'Construction permits obtained',
        'Utility relocation plans approved'
      ]
    },
    {
      name: 'Site Preparation & Mobilization',
      description: 'Site preparation, contractor mobilization, and preliminary works',
      relativePosition: 0.25,
      deliverables: [
        'Site cleared and prepared',
        'Access roads constructed',
        'Construction facilities established',
        'Erosion control measures implemented',
        'Existing utilities located and protected',
        'Survey control points established'
      ]
    },
    {
      name: 'Foundation & Substructure',
      description: 'Construction of foundations and substructure elements',
      relativePosition: 0.4,
      deliverables: [
        'Excavation and earthworks completed',
        'Piling/foundation systems installed',
        'Substructure concrete works completed',
        'Drainage systems installed',
        'Underground utilities installed',
        'Waterproofing completed'
      ]
    },
    {
      name: 'Superstructure Construction',
      description: 'Construction of main structural elements',
      relativePosition: 0.6,
      deliverables: [
        'Main structural elements constructed',
        'Bridge deck/roadway constructed',
        'Retaining walls completed',
        'Structural connections finalized',
        'Expansion joints installed',
        'Quality control tests completed'
      ]
    },
    {
      name: 'Systems Installation & Finishing',
      description: 'Installation of infrastructure systems and finishing works',
      relativePosition: 0.8,
      deliverables: [
        'Road surfacing/pavement completed',
        'Lighting systems installed',
        'Signage and safety features installed',
        'Landscaping and environmental measures implemented',
        'Barriers and guardrails installed',
        'Finishing works completed'
      ]
    },
    {
      name: 'Testing & Commissioning',
      description: 'Final testing, commissioning, and project handover',
      relativePosition: 0.95,
      deliverables: [
        'Load testing completed',
        'Systems testing conducted',
        'Safety inspections passed',
        'As-built documentation completed',
        'Maintenance manuals provided',
        'Final inspections and project handover'
      ]
    }
  ],
  
  [ProjectType.RENOVATION]: [
    {
      name: 'Pre-Construction Assessment',
      description: 'Detailed assessment of existing conditions and finalization of renovation plans',
      relativePosition: 0.05,
      deliverables: [
        'Existing conditions documented',
        'Hazardous materials assessment completed',
        'Structural assessment conducted',
        'Renovation plans finalized',
        'Building permits obtained',
        'Contractor selection completed'
      ]
    },
    {
      name: 'Demolition & Structural Modifications',
      description: 'Selective demolition and structural modifications as required',
      relativePosition: 0.2,
      deliverables: [
        'Site protection measures implemented',
        'Selective demolition completed',
        'Structural modifications executed',
        'Hidden conditions addressed',
        'Waste removal completed',
        'Structural inspections passed'
      ]
    },
    {
      name: 'MEP Rough-ins & Infrastructure Updates',
      description: 'Updating of mechanical, electrical, and plumbing systems',
      relativePosition: 0.4,
      deliverables: [
        'Electrical system updates roughed-in',
        'Plumbing system updates roughed-in',
        'HVAC system updates roughed-in',
        'Technology infrastructure installed',
        'Rough inspections passed',
        'Building envelope updates completed'
      ]
    },
    {
      name: 'Interior Reconstruction',
      description: 'Interior reconstruction including walls, ceilings, and core elements',
      relativePosition: 0.6,
      deliverables: [
        'New wall framing completed',
        'Drywall installation and finishing',
        'Ceiling systems installed',
        'Door and window installation',
        'Millwork and cabinetry installed',
        'Mechanical/electrical trim installed'
      ]
    },
    {
      name: 'Finishes & Fixtures',
      description: 'Application of finishes and installation of fixtures',
      relativePosition: 0.8,
      deliverables: [
        'Flooring installed',
        'Painting and wall finishes completed',
        'Plumbing fixtures installed',
        'Lighting fixtures installed',
        'Appliances installed',
        'Interior trim work completed'
      ]
    },
    {
      name: 'Final Inspections & Closeout',
      description: 'Final inspections, cleaning, and project closeout',
      relativePosition: 0.95,
      deliverables: [
        'Final building inspections passed',
        'Systems testing completed',
        'Punch list items addressed',
        'Final cleaning completed',
        'Owner training conducted',
        'Project documentation delivered'
      ]
    }
  ],
  
  [ProjectType.OTHER]: [
    {
      name: 'Project Initiation',
      description: 'Project kickoff, planning, and initial documentation',
      relativePosition: 0.05,
      deliverables: [
        'Project charter approved',
        'Initial requirements documented',
        'Project team assembled',
        'Preliminary schedule developed',
        'Risk assessment completed'
      ]
    },
    {
      name: 'Design & Planning',
      description: 'Detailed design and comprehensive project planning',
      relativePosition: 0.25,
      deliverables: [
        'Detailed designs completed',
        'Specifications finalized',
        'Permits and approvals obtained',
        'Procurement plan established',
        'Detailed project schedule created'
      ]
    },
    {
      name: 'Implementation - Phase 1',
      description: 'Initial implementation phase',
      relativePosition: 0.45,
      deliverables: [
        'Phase 1 work executed',
        'Quality control checks completed',
        'Progress reporting established',
        'Initial systems tested',
        'Phase 1 review conducted'
      ]
    },
    {
      name: 'Implementation - Phase 2',
      description: 'Secondary implementation phase',
      relativePosition: 0.7,
      deliverables: [
        'Phase 2 work executed',
        'Integration with phase 1 completed',
        'Systems testing conducted',
        'User acceptance testing initiated',
        'Training materials developed'
      ]
    },
    {
      name: 'Project Completion',
      description: 'Project finalization, handover, and closeout',
      relativePosition: 0.95,
      deliverables: [
        'Final testing completed',
        'User training conducted',
        'Documentation finalized',
        'Project handover completed',
        'Lessons learned documented'
      ]
    }
  ]
};

/**
 * Generate milestones based on project type and timeline
 * @param projectType The type of project
 * @param startDate Project start date
 * @param endDate Project end date
 * @returns Array of milestones with calculated target dates
 */
export const generateMilestones = (
  projectType: ProjectType,
  startDate: Date,
  endDate: Date
): Milestone[] => {
  // Get the appropriate templates based on project type
  const templates = milestoneTemplates[projectType] || milestoneTemplates[ProjectType.OTHER];
  
  // Calculate project duration in milliseconds
  const projectStart = new Date(startDate);
  const projectEnd = new Date(endDate);
  const projectDuration = projectEnd.getTime() - projectStart.getTime();
  
  // Generate milestones with calculated dates
  return templates.map(template => {
    // Calculate target date based on relative position
    const targetDateMs = projectStart.getTime() + (projectDuration * template.relativePosition);
    const targetDate = new Date(targetDateMs);
    
    // Create deliverables objects from template strings
    const deliverables: Deliverable[] = template.deliverables.map(name => ({
      id: `deliverable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      completed: false
    }));
    
    // Create the milestone
    return {
      id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      targetDate,
      status: MilestoneStatus.NOT_STARTED,
      deliverables,
      dateCreated: new Date()
    };
  });
};

/**
 * Calculate a progress-adjusted project end date
 * This is useful for suggesting a realistic end date based on project size and type
 * 
 * @param projectType Type of the project
 * @param startDate Project start date
 * @param size Size indicator (budget amount or square footage)
 * @returns Suggested end date
 */
export const calculateProjectEndDate = (
  projectType: ProjectType,
  startDate: Date,
  size: number = 1000
): Date => {
  // Base durations in days for different project types
  const baseDurations: Record<ProjectType, number> = {
    [ProjectType.RESIDENTIAL]: 180, // 6 months for standard residential
    [ProjectType.COMMERCIAL]: 365, // 12 months for standard commercial
    [ProjectType.INDUSTRIAL]: 450, // 15 months for standard industrial
    [ProjectType.INFRASTRUCTURE]: 540, // 18 months for standard infrastructure
    [ProjectType.RENOVATION]: 120, // 4 months for standard renovation
    [ProjectType.OTHER]: 270  // 9 months default
  };
  
  // Size factors (size 1000 = 1.0 factor)
  const sizeFactor = Math.sqrt(size / 1000); // Square root relationship to account for economies of scale
  
  // Calculate project duration in days
  const baseDuration = baseDurations[projectType] || baseDurations[ProjectType.OTHER];
  const adjustedDuration = Math.round(baseDuration * sizeFactor);
  
  // Calculate end date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + adjustedDuration);
  
  return endDate;
};

/**
 * Suggest an appropriate number of milestones based on project type and duration
 * 
 * @param projectType Type of the project
 * @param durationMonths Project duration in months
 * @returns Suggested number of milestones
 */
export const suggestMilestoneCount = (
  projectType: ProjectType,
  durationMonths: number
): number => {
  // Base milestone counts
  const baseCounts: Record<ProjectType, number> = {
    [ProjectType.RESIDENTIAL]: 5,
    [ProjectType.COMMERCIAL]: 7,
    [ProjectType.INDUSTRIAL]: 7,
    [ProjectType.INFRASTRUCTURE]: 7,
    [ProjectType.RENOVATION]: 6,
    [ProjectType.OTHER]: 5
  };
  
  // Adjust for duration (add 1 milestone per 6 additional months)
  const durationFactor = Math.max(1, Math.ceil((durationMonths - 6) / 6));
  const baseCount = baseCounts[projectType] || baseCounts[ProjectType.OTHER];
  
  return Math.min(12, baseCount + durationFactor - 1); // Cap at 12 milestones
};
