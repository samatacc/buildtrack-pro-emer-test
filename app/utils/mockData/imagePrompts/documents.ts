/**
 * Document-related image prompts for GPT-Image-1
 */
import { PromptMap } from './types';

export const documentPrompts: PromptMap = {
  contract: 'A professional construction contract document with formal layout, signature blocks, and legal formatting. The document should have a clean, formal design with proper headers, section numbering, and signature lines. Show just enough text to suggest legal language without being readable. Include elements like company letterhead, dates, and professional formatting. Use a white background with the BuildTrack Pro blue for headers.',
  
  permit: 'A construction permit document with official formatting, approval stamps, and project information. The document should have a formal government/municipal layout with sections for project details, approval information, and inspection records. Include elements like official seals, signature blocks, and inspection checklists. The design should look official with a municipal header and formal layout.',
  
  invoice: 'A professional construction invoice with line items, costs, and payment information. The invoice should have a clean, organized layout with the BuildTrack Pro color scheme. Include elements like itemized services/materials, quantities, rates, and totals. Add details like invoice number, date, payment terms, and company information. The design should be professional and clearly organized.',
  
  specification: 'A construction specification document with technical details, requirements, and standards. The document should have a formal technical layout with section numbering, headers, and organized technical content. Include elements like material specifications, installation requirements, and quality standards. The design should be clean and professional with proper technical formatting and organization.',
  
  manual: 'An equipment or system manual for construction equipment with diagrams, instructions, and specifications. The document should have a technical layout with sections for operation, maintenance, and troubleshooting. Include diagrams, step-by-step instructions, and technical specifications. The design should be clean and organized with the BuildTrack Pro color scheme and professional technical illustrations.'
}
