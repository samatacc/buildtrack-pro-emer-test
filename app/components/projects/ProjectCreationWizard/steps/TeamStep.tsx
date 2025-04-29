'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Info, User } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, TeamMember, TeamRole } from '@/lib/types/project';

/**
 * TeamStep Component
 * 
 * Allows for selecting and adding team members to a project,
 * assigning roles, and setting permissions.
 */

interface TeamStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

// Mock team members for development purposes
// In production, this would come from an API call to fetch users
const MOCK_AVAILABLE_USERS = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Project Manager', avatarUrl: '/avatars/john.jpg' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Civil Engineer', avatarUrl: '/avatars/jane.jpg' },
  { id: '3', name: 'Michael Johnson', email: 'michael.j@example.com', role: 'Architect', avatarUrl: '/avatars/michael.jpg' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com', role: 'Construction Manager', avatarUrl: '/avatars/emily.jpg' },
  { id: '5', name: 'Robert Wilson', email: 'robert.w@example.com', role: 'Electrical Engineer', avatarUrl: '/avatars/robert.jpg' },
  { id: '6', name: 'Sarah Brown', email: 'sarah.b@example.com', role: 'Surveyor', avatarUrl: '/avatars/sarah.jpg' },
  { id: '7', name: 'David Martinez', email: 'david.m@example.com', role: 'Contractor', avatarUrl: '/avatars/david.jpg' },
  { id: '8', name: 'Lisa Taylor', email: 'lisa.t@example.com', role: 'Interior Designer', avatarUrl: '/avatars/lisa.jpg' }
];

export default function TeamStep({
  formData,
  updateFormData,
  updateStepValidation
}: TeamStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // State for team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(formData.team || []);
  
  // State for search and modals
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole>(TeamRole.TEAM_MEMBER);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Filtered available users based on search term
  const filteredUsers = MOCK_AVAILABLE_USERS.filter(user => {
    // Filter out users who are already team members
    const isAlreadyAdded = teamMembers.some(member => member.userId === user.id);
    if (isAlreadyAdded) return false;
    
    // Filter by search term
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.role.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Update parent form data
  useEffect(() => {
    updateFormData({ team: teamMembers });
    
    // Project requires at least a project manager
    const isValid = teamMembers.some(member => member.role === TeamRole.PROJECT_MANAGER);
    updateStepValidation(isValid);
  }, [teamMembers, updateFormData, updateStepValidation]);
  
  // Add a team member
  const addTeamMember = () => {
    if (!selectedUser) return;
    
    const newMember: TeamMember = {
      userId: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedRole,
      permissions: {
        canEdit: selectedRole === TeamRole.PROJECT_MANAGER,
        canInvite: selectedRole === TeamRole.PROJECT_MANAGER,
        canApprove: [TeamRole.PROJECT_MANAGER, TeamRole.SUPERVISOR].includes(selectedRole),
        canViewBudget: [TeamRole.PROJECT_MANAGER, TeamRole.SUPERVISOR, TeamRole.TEAM_MEMBER].includes(selectedRole),
        canManageTasks: [TeamRole.PROJECT_MANAGER, TeamRole.SUPERVISOR].includes(selectedRole)
      },
      dateAdded: new Date(),
      avatarUrl: selectedUser.avatarUrl
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    setSelectedUser(null);
    setSelectedRole(TeamRole.TEAM_MEMBER);
    setShowAddMemberModal(false);
    setSearchTerm('');
  };
  
  // Remove a team member
  const removeTeamMember = (userId: string) => {
    setTeamMembers(prev => prev.filter(member => member.userId !== userId));
  };
  
  // Update team member role
  const updateMemberRole = (userId: string, role: TeamRole) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.userId === userId) {
        return {
          ...member,
          role,
          permissions: {
            ...member.permissions,
            canEdit: role === TeamRole.PROJECT_MANAGER,
            canInvite: role === TeamRole.PROJECT_MANAGER,
            canApprove: [TeamRole.PROJECT_MANAGER, TeamRole.SUPERVISOR].includes(role),
            canManageTasks: [TeamRole.PROJECT_MANAGER, TeamRole.SUPERVISOR].includes(role)
          }
        };
      }
      return member;
    }));
  };
  
  // Update team member permission
  const updateMemberPermission = (userId: string, permission: keyof TeamMember['permissions'], value: boolean) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.userId === userId) {
        return {
          ...member,
          permissions: {
            ...member.permissions,
            [permission]: value
          }
        };
      }
      return member;
    }));
  };
  
  // Render user search result
  const renderUserSearchResult = (user: any) => (
    <div 
      key={user.id}
      onClick={() => {
        setSelectedUser(user);
        setIsFiltering(false);
      }}
      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md ${
        selectedUser?.id === user.id ? 'bg-blue-50 border border-blue-200' : ''
      }`}
    >
      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <User className="h-5 w-5 text-gray-500" />
        )}
      </div>
      <div className="ml-3 flex-grow">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      <div className="text-xs text-gray-500">{user.role}</div>
    </div>
  );
  
  // Render team member card
  const renderTeamMemberCard = (member: TeamMember) => (
    <div key={member.userId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with name and remove button */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <div className="ml-2">
            <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
            <p className="text-xs text-gray-500">{member.email}</p>
          </div>
        </div>
        <button
          onClick={() => removeTeamMember(member.userId)}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Remove team member"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      {/* Role selection */}
      <div className="px-4 py-3 border-b border-gray-200">
        <label className="block text-xs font-medium text-gray-700 mb-1">{t('teamMemberRole')}</label>
        <select
          value={member.role}
          onChange={(e) => updateMemberRole(member.userId, e.target.value as TeamRole)}
          className="block w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
        >
          {Object.values(TeamRole).map((role) => (
            <option key={role} value={role}>
              {t(`teamRoles.${role.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Permissions */}
      <div className="px-4 py-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">{t('permissions')}</label>
        <div className="space-y-2">
          {/* Only show certain permissions based on the role */}
          {(member.role === TeamRole.PROJECT_MANAGER || member.role === TeamRole.SUPERVISOR) && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`manage-tasks-${member.userId}`}
                checked={member.permissions.canManageTasks}
                onChange={(e) => updateMemberPermission(member.userId, 'canManageTasks', e.target.checked)}
                className="h-4 w-4 text-[rgb(24,62,105)] focus:ring-[rgb(24,62,105)] border-gray-300 rounded"
              />
              <label htmlFor={`manage-tasks-${member.userId}`} className="ml-2 block text-xs text-gray-700">
                {t('canManageTasks')}
              </label>
            </div>
          )}
          
          {/* View budget permission */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`view-budget-${member.userId}`}
              checked={member.permissions.canViewBudget}
              onChange={(e) => updateMemberPermission(member.userId, 'canViewBudget', e.target.checked)}
              className="h-4 w-4 text-[rgb(24,62,105)] focus:ring-[rgb(24,62,105)] border-gray-300 rounded"
            />
            <label htmlFor={`view-budget-${member.userId}`} className="ml-2 block text-xs text-gray-700">
              {t('canViewBudget')}
            </label>
          </div>
          
          {/* Approve changes permission */}
          {(member.role === TeamRole.PROJECT_MANAGER || member.role === TeamRole.SUPERVISOR) && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`approve-${member.userId}`}
                checked={member.permissions.canApprove}
                onChange={(e) => updateMemberPermission(member.userId, 'canApprove', e.target.checked)}
                className="h-4 w-4 text-[rgb(24,62,105)] focus:ring-[rgb(24,62,105)] border-gray-300 rounded"
              />
              <label htmlFor={`approve-${member.userId}`} className="ml-2 block text-xs text-gray-700">
                {t('canApprove')}
              </label>
            </div>
          )}
          
          {/* Project manager-specific permissions */}
          {member.role === TeamRole.PROJECT_MANAGER && (
            <>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`edit-${member.userId}`}
                  checked={member.permissions.canEdit}
                  onChange={(e) => updateMemberPermission(member.userId, 'canEdit', e.target.checked)}
                  className="h-4 w-4 text-[rgb(24,62,105)] focus:ring-[rgb(24,62,105)] border-gray-300 rounded"
                />
                <label htmlFor={`edit-${member.userId}`} className="ml-2 block text-xs text-gray-700">
                  {t('canEdit')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`invite-${member.userId}`}
                  checked={member.permissions.canInvite}
                  onChange={(e) => updateMemberPermission(member.userId, 'canInvite', e.target.checked)}
                  className="h-4 w-4 text-[rgb(24,62,105)] focus:ring-[rgb(24,62,105)] border-gray-300 rounded"
                />
                <label htmlFor={`invite-${member.userId}`} className="ml-2 block text-xs text-gray-700">
                  {t('canInvite')}
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.team')}</h2>
        <p className="text-gray-600">{t('teamDescription')}</p>
      </div>
      
      {/* Team Members List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('teamMembers')}</h3>
          
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-3 py-1.5 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t('addTeamMember')}
          </button>
        </div>
        
        {teamMembers.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">{t('noTeamMembers')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('addTeamMembersDescription')}</p>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t('addFirstTeamMember')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(renderTeamMemberCard)}
          </div>
        )}
      </div>
      
      {/* Team validation error */}
      {teamMembers.length > 0 && !teamMembers.some(member => member.role === TeamRole.PROJECT_MANAGER) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          {t('projectManagerRequired')}
        </div>
      )}
      
      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{t('addTeamMember')}</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedUser(null);
                  setSearchTerm('');
                  setIsFiltering(false);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 flex-grow overflow-y-auto">
              {/* Search Input */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsFiltering(true);
                  }}
                  onFocus={() => setIsFiltering(true)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                  placeholder={t('searchTeamMembers')}
                />
              </div>
              
              {/* User Selection */}
              {isFiltering ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('selectTeamMember')}</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(renderUserSearchResult)
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {t('noUsersFound')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                selectedUser && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('selectedUser')}</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {selectedUser.avatarUrl ? (
                          <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-1 rounded-full hover:bg-blue-100"
                      >
                        <X className="h-4 w-4 text-blue-500" />
                      </button>
                    </div>
                  </div>
                )
              )}
              
              {/* Role Selection - only show if user is selected */}
              {selectedUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('assignRole')}</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                  >
                    {Object.values(TeamRole).map((role) => (
                      <option key={role} value={role}>
                        {t(`teamRoles.${role.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    {t(`teamRoleDescriptions.${selectedRole.toLowerCase()}`)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedUser(null);
                  setSearchTerm('');
                  setIsFiltering(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={addTeamMember}
                disabled={!selectedUser}
                className={`px-4 py-2 rounded-md ${
                  selectedUser
                    ? 'bg-[rgb(24,62,105)] text-white hover:bg-[rgb(19,50,86)]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t('addMember')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('teamTip')}</p>
        </div>
      </div>
    </div>
  );
}
