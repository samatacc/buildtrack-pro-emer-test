import React, { useState, useEffect, Suspense } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { 
  MagnifyingGlassIcon, 
  QuestionMarkCircleIcon,
  TicketIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Import components directly
import HelpArticle from '@/app/components/help/HelpArticle';
import SupportTicketForm from '@/app/components/help/SupportTicketForm';

// Help category types
export type HelpCategory = 'getting-started' | 'projects' | 'materials' | 'tasks' | 'billing' | 'permissions' | 'integrations' | 'account';

// Help article interface
export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: HelpCategory;
  tags: string[];
  lastUpdated: string;
  views: number;
  helpfulness: {
    helpful: number;
    notHelpful: number;
  };
}

// Support ticket interface
export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  category: string;
  assignee?: string;
  attachments?: number;
}

// Mock help article data
const mockArticles: HelpArticle[] = [
  {
    id: 'art-001',
    title: 'Getting Started with BuildTrack Pro',
    content: `<h2>Welcome to BuildTrack Pro!</h2>
      <p>BuildTrack Pro is a comprehensive construction management solution designed to streamline your project workflows. This guide will help you get started with the platform.</p>
      <h3>1. Setting Up Your Account</h3>
      <p>After signing up, complete your profile by adding your company information, team members, and preferred settings.</p>
      <h3>2. Creating Your First Project</h3>
      <p>Navigate to the Projects tab and click "New Project" to start creating your first construction project. Follow the project wizard to set up timeline, budget, and team members.</p>
      <h3>3. Customizing Your Dashboard</h3>
      <p>Your dashboard is fully customizable. Add widgets that matter most to your workflow by clicking the "Add Widget" button.</p>
      <h3>4. Inviting Team Members</h3>
      <p>Invite your team members by going to Settings > Team and clicking "Invite Members". They'll receive an email invitation to join your organization.</p>`,
    category: 'getting-started',
    tags: ['onboarding', 'setup', 'welcome'],
    lastUpdated: '2025-04-15T14:30:00Z',
    views: 1245,
    helpfulness: {
      helpful: 87,
      notHelpful: 3
    }
  },
  {
    id: 'art-002',
    title: 'Managing Projects and Tasks',
    content: `<h2>Project and Task Management</h2>
      <p>Efficient project and task management is at the heart of BuildTrack Pro. Here's how to manage your projects effectively.</p>
      <h3>Project Dashboard</h3>
      <p>Each project has its own dashboard with customizable widgets. View critical metrics, timelines, and task status at a glance.</p>
      <h3>Task Assignment</h3>
      <p>Assign tasks to team members by clicking on a task and selecting "Assign". You can set due dates, priorities, and dependencies.</p>
      <h3>Kanban Board View</h3>
      <p>Switch to Kanban view to visualize your workflow stages. Drag and drop tasks between columns to update their status.</p>
      <h3>Milestone Tracking</h3>
      <p>Create milestones to mark significant project events or deliverables. Track progress against these milestones in the Timeline view.</p>`,
    category: 'projects',
    tags: ['projects', 'tasks', 'kanban', 'milestones'],
    lastUpdated: '2025-04-18T09:15:00Z',
    views: 875,
    helpfulness: {
      helpful: 62,
      notHelpful: 5
    }
  },
  {
    id: 'art-003',
    title: 'Using Multi-Factor Authentication',
    content: `<h2>Securing Your Account with MFA</h2>
      <p>Multi-Factor Authentication (MFA) adds an extra layer of security to your BuildTrack Pro account.</p>
      <h3>What is MFA?</h3>
      <p>MFA requires you to verify your identity using two or more verification methods, making it harder for unauthorized users to access your account even if they have your password.</p>
      <h3>Setting Up Authenticator App</h3>
      <p>Go to Settings > Security > Multi-Factor Authentication and select "Set Up Authenticator App". Follow the instructions to scan the QR code with your authenticator app and enter the verification code.</p>
      <h3>SMS Verification</h3>
      <p>Alternatively, you can set up SMS verification to receive security codes via text message. Select "SMS Verification" and enter your phone number.</p>
      <h3>Backup Codes</h3>
      <p>Generate backup codes as a failsafe in case you lose access to your authenticator app or phone. Store these codes in a secure location.</p>`,
    category: 'account',
    tags: ['security', 'mfa', 'authentication'],
    lastUpdated: '2025-04-28T11:20:00Z',
    views: 432,
    helpfulness: {
      helpful: 45,
      notHelpful: 1
    }
  },
  {
    id: 'art-004',
    title: 'Customizing Dashboard Widgets',
    content: `<h2>Personalizing Your Dashboard</h2>
      <p>Make BuildTrack Pro work for you by customizing your dashboard with the widgets that matter most to your role.</p>
      <h3>Adding Widgets</h3>
      <p>Click the "Add Widget" button in the top right corner of your dashboard. Select from the available widgets in the menu that appears.</p>
      <h3>Rearranging Widgets</h3>
      <p>Enter "Edit Mode" by clicking the pencil icon. Then drag and drop widgets to your preferred positions.</p>
      <h3>Resizing Widgets</h3>
      <p>While in Edit Mode, grab the resize handle at the bottom-right corner of any widget and drag to resize.</p>
      <h3>Widget Settings</h3>
      <p>Click the gear icon on any widget to access its settings. Customize data ranges, display options, and other parameters.</p>`,
    category: 'getting-started',
    tags: ['dashboard', 'widgets', 'customization'],
    lastUpdated: '2025-04-25T16:45:00Z',
    views: 654,
    helpfulness: {
      helpful: 59,
      notHelpful: 2
    }
  }
];

// Mock support tickets
const mockTickets: SupportTicket[] = [
  {
    id: 'ticket-001',
    subject: 'Cannot access project timeline',
    description: 'When I try to view the project timeline for the Riverfront Residences project, I get an error message saying "Unable to load timeline data".',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2025-04-28T10:15:00Z',
    updatedAt: '2025-04-29T14:30:00Z',
    category: 'Technical Issue',
    assignee: 'Support Agent',
    attachments: 1
  },
  {
    id: 'ticket-002',
    subject: 'How do I change my notification settings?',
    description: 'I\'m receiving too many email notifications. I want to change my settings to only receive notifications for high priority items.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2025-04-25T09:20:00Z',
    updatedAt: '2025-04-26T11:45:00Z',
    category: 'Account Management'
  }
];

// Tab type for the help center
type HelpTab = 'articles' | 'tickets' | 'chat';

interface HelpCenterProps {
  initialTab?: HelpTab;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ 
  initialTab = 'articles' 
}) => {
  const { t } = useTranslations('help');
  const [activeTab, setActiveTab] = useState<HelpTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(mockArticles);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter articles when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(mockArticles);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = mockArticles.filter(article => {
      // Search in title, content, and tags
      return (
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
    
    setFilteredArticles(filtered);
  }, [searchQuery]);
  
  // Handle article selection
  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article);
  };
  
  // Handle article helpfulness voting
  const handleArticleHelpful = (articleId: string, isHelpful: boolean) => {
    // Update article helpfulness in a real app, this would be an API call
    setFilteredArticles(prev => 
      prev.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            helpfulness: {
              helpful: isHelpful ? article.helpfulness.helpful + 1 : article.helpfulness.helpful,
              notHelpful: !isHelpful ? article.helpfulness.notHelpful + 1 : article.helpfulness.notHelpful
            }
          };
        }
        return article;
      })
    );
    
    toast.success(isHelpful ? 'Thank you for your feedback!' : 'We appreciate your feedback');
  };
  
  // Handle creating a new support ticket
  const handleCreateTicket = (subject: string, description: string, category: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        subject,
        description,
        status: 'open',
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setIsCreateTicketOpen(false);
      setIsLoading(false);
      toast.success('Support ticket submitted successfully');
    }, 1000);
  };
  
  // Format date to human-readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[rgb(24,62,105)] dark:text-white flex items-center">
            <QuestionMarkCircleIcon className="h-7 w-7 mr-2" />
            {t('title') || 'Help & Support'}
          </h2>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder') || 'Search for help...'}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'articles'
                ? 'border-[rgb(236,107,44)] text-[rgb(236,107,44)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BookOpenIcon className="inline-block h-5 w-5 mr-1" />
            {t('tabs.knowledgeBase') || 'Knowledge Base'}
          </button>
          
          <button
            onClick={() => setActiveTab('tickets')}
            className={`ml-8 px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'tickets'
                ? 'border-[rgb(236,107,44)] text-[rgb(236,107,44)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <TicketIcon className="inline-block h-5 w-5 mr-1" />
            {t('tabs.supportTickets') || 'Support Tickets'}
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`ml-8 px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-[rgb(236,107,44)] text-[rgb(236,107,44)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ChatBubbleBottomCenterTextIcon className="inline-block h-5 w-5 mr-1" />
            {t('tabs.liveChat') || 'Live Chat'}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Knowledge Base */}
        {activeTab === 'articles' && (
          <div className="flex h-full">
            {/* Article List */}
            {!selectedArticle ? (
              <div className="w-full">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {searchQuery 
                    ? `${filteredArticles.length} results for "${searchQuery}"`
                    : t('popularArticles') || 'Popular Articles'
                  }
                </h3>
                
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('noResults') || 'No articles found matching your search.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <div 
                        key={article.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[rgb(24,62,105)] cursor-pointer transition-colors"
                        onClick={() => handleArticleSelect(article)}
                      >
                        <h4 className="text-lg font-medium text-[rgb(24,62,105)] dark:text-blue-400 mb-2">
                          {article.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            Last updated: {formatDate(article.lastUpdated)}
                          </span>
                          <span>
                            {article.views} views
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <HelpArticle 
                article={selectedArticle}
                onBack={() => setSelectedArticle(null)}
                onHelpfulVote={(isHelpful) => handleArticleHelpful(selectedArticle.id, isHelpful)}
              />
            )}
          </div>
        )}
        
        {/* Support Tickets */}
        {activeTab === 'tickets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('myTickets') || 'My Support Tickets'}
              </h3>
              
              <button
                onClick={() => setIsCreateTicketOpen(true)}
                className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors"
              >
                {t('createTicket') || 'Create Ticket'}
              </button>
            </div>
            
            {isCreateTicketOpen ? (
              <SupportTicketForm 
                onSubmit={handleCreateTicket}
                onCancel={() => setIsCreateTicketOpen(false)}
                isLoading={isLoading}
              />
            ) : (
              <div>
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('noTickets') || 'You have not created any support tickets yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('ticket') || 'Ticket'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('status') || 'Status'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('priority') || 'Priority'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('created') || 'Created'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('lastUpdated') || 'Last Updated'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {ticket.subject}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {ticket.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                ticket.status === 'open'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                  : ticket.status === 'in_progress' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  : ticket.status === 'resolved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                              }`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                ticket.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : ticket.priority === 'high' 
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                  : ticket.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              }`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(ticket.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(ticket.updatedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Live Chat */}
        {activeTab === 'chat' && (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-full mb-4">
              <ChatBubbleBottomCenterTextIcon className="h-12 w-12 text-[rgb(24,62,105)]" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {t('chatWithSupport') || 'Chat with Support'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {t('chatDescription') || 'Connect with our support team for real-time assistance with your BuildTrack Pro questions.'}
            </p>
            <button
              className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors"
              onClick={() => toast.success('Live chat feature coming soon!')}
            >
              {t('startChat') || 'Start Chat'}
            </button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t('availabilityNote') || 'Support agents are available Monday-Friday, 9AM-6PM EST'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
