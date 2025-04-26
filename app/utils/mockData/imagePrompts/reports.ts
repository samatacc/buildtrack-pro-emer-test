/**
 * Report-related image prompts for GPT-Image-1
 */
import { PromptMap } from './types';

export const reportPrompts: PromptMap = {
  progress: 'A construction progress report visualization showing timeline, completion percentage, and milestone tracking. The visualization should use professional charting with clear data representation. Include elements like Gantt charts, progress bars, and completion metrics. Use the BuildTrack Pro blue and orange color scheme with clean, modern design elements.',
  
  financial: 'A financial report visualization for construction projects with budget vs. actual graphs and cost breakdown. The visualization should include professional charts showing expense categories, budget allocation, and variance tracking. Use clean data visualization with the BuildTrack Pro color scheme. Include elements like pie charts for expense breakdown and line charts for budget tracking over time.',
  
  safety: 'A safety inspection report visualization with compliance metrics and hazard identification. The report should include professional safety icons, compliance checklists, and incident tracking metrics. Use a clean, formal design with the BuildTrack Pro color scheme. Include visual elements like safety compliance gauges, hazard heat maps, and trend analysis charts.',
  
  quality: 'A quality control report visualization showing inspection results and material standards compliance. The report should include detailed quality metrics, checklist completion status, and quality trend analysis. Use professional data visualization with the BuildTrack Pro color scheme. Include elements like pass/fail rates, quality scores by category, and quality trend charts.',
  
  timeline: 'A project timeline visualization showing phases, milestones, and critical path elements. The timeline should use professional project management visualization techniques with clear phase delineation and progress tracking. Use the BuildTrack Pro color scheme with clean, modern design elements. Include milestone markers, dependency arrows, and completion indicators.'
}
