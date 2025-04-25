'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock data for projects
const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'Riverfront Residences',
    status: 'In Progress',
    progress: 65,
    dueDate: '2023-12-15',
    budget: 3500000,
    spent: 2275000,
    tasks: { total: 48, completed: 31 },
    team: [
      { id: 'u1', name: 'Alex Wong', avatar: '/avatars/user1.jpg' },
      { id: 'u2', name: 'Sarah Johnson', avatar: '/avatars/user2.jpg' },
      { id: 'u3', name: 'David Miller', avatar: '/avatars/user3.jpg' },
    ]
  },
  {
    id: 'p2',
    name: 'Silver Creek Office Complex',
    status: 'Planning',
    progress: 20,
    dueDate: '2024-03-30',
    budget: 5800000,
    spent: 1160000,
    tasks: { total: 52, completed: 12 },
    team: [
      { id: 'u2', name: 'Sarah Johnson', avatar: '/avatars/user2.jpg' },
      { id: 'u4', name: 'James Wilson', avatar: '/avatars/user4.jpg' },
    ]
  },
  {
    id: 'p3',
    name: 'Oakridge Mall Renovation',
    status: 'On Hold',
    progress: 30,
    dueDate: '2024-02-15',
    budget: 1800000, 
    spent: 540000,
    tasks: { total: 36, completed: 10 },
    team: [
      { id: 'u1', name: 'Alex Wong', avatar: '/avatars/user1.jpg' },
      { id: 'u3', name: 'David Miller', avatar: '/avatars/user3.jpg' },
      { id: 'u5', name: 'Emily Chen', avatar: '/avatars/user5.jpg' },
    ]
  },
  {
    id: 'p4',
    name: 'Hillside Residential Tower',
    status: 'Completed',
    progress: 100,
    dueDate: '2023-09-20',
    budget: 4200000,
    spent: 4050000,
    tasks: { total: 64, completed: 64 },
    team: [
      { id: 'u2', name: 'Sarah Johnson', avatar: '/avatars/user2.jpg' },
      { id: 'u4', name: 'James Wilson', avatar: '/avatars/user4.jpg' },
      { id: 'u5', name: 'Emily Chen', avatar: '/avatars/user5.jpg' },
    ]
  },
  {
    id: 'p5',
    name: 'Parkview Community Center',
    status: 'In Progress',
    progress: 45,
    dueDate: '2024-01-10',
    budget: 2300000,
    spent: 1035000,
    tasks: { total: 42, completed: 19 },
    team: [
      { id: 'u1', name: 'Alex Wong', avatar: '/avatars/user1.jpg' },
      { id: 'u3', name: 'David Miller', avatar: '/avatars/user3.jpg' },
    ]
  },
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name') // Default sort by name
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'
  
  // Filter and sort projects
  const filteredProjects = MOCK_PROJECTS.filter(project => {
    return (
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'All' || project.status === statusFilter)
    )
  }).sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'progress':
        comparison = a.progress - b.progress
        break
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case 'budget':
        comparison = a.budget - b.budget
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null
    
    return sortOrder === 'asc' 
      ? <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
  }
  
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(24,62,105)]">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your construction projects
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)]"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1 flex space-x-4">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Search projects</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                placeholder="Search projects"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="sr-only">Status Filter</label>
            <select
              id="status-filter"
              name="status-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">View:</span>
          <div className="flex space-x-2">
            <button
              className="p-2 rounded-md bg-[rgb(24,62,105)] text-white"
              title="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              title="Kanban view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              title="Gantt view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Projects List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Project Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center">
                  Progress
                  {getSortIcon('progress')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center">
                  Due Date
                  {getSortIcon('dueDate')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Team
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('budget')}
              >
                <div className="flex items-center">
                  Budget
                  {getSortIcon('budget')}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => {
              // Calculate budget status
              const budgetUsedPercent = Math.round((project.spent / project.budget) * 100)
              const budgetStatus = 
                budgetUsedPercent > 100 ? 'over-budget' : 
                budgetUsedPercent > 90 ? 'at-risk' : 'on-budget'

              // Format dates
              const formattedDueDate = new Date(project.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
              
              // Calculate days remaining
              const today = new Date()
              const dueDate = new Date(project.dueDate)
              const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              // Status styling
              const statusClasses = {
                'Planning': 'bg-blue-100 text-blue-800',
                'In Progress': 'bg-yellow-100 text-yellow-800',
                'On Hold': 'bg-gray-100 text-gray-800',
                'Completed': 'bg-green-100 text-green-800'
              }[project.status] || 'bg-gray-100 text-gray-800'
              
              return (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-[rgb(24,62,105)]">
                          <Link href={`/projects/${project.id}`} className="hover:underline">
                            {project.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.tasks.completed} of {project.tasks.total} tasks completed
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-[rgb(24,62,105)] h-2.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formattedDueDate}</div>
                    <div className={`text-sm ${
                      project.status === 'Completed' 
                        ? 'text-green-600' 
                        : daysRemaining < 0 
                          ? 'text-red-600' 
                          : daysRemaining < 7 
                            ? 'text-yellow-600' 
                            : 'text-gray-500'
                    }`}>
                      {project.status === 'Completed' 
                        ? 'Completed' 
                        : daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)} days overdue` 
                          : daysRemaining === 0 
                            ? 'Due today' 
                            : `${daysRemaining} days left`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2">
                      {project.team.map((member) => (
                        <div key={member.id} className="z-10 relative inline-block">
                          <div 
                            className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-white capitalize"
                            title={member.name}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="z-10 relative inline-block">
                          <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                            +{project.team.length - 3}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${project.budget.toLocaleString()}
                    </div>
                    <div className={`text-sm ${
                      budgetStatus === 'over-budget' 
                        ? 'text-red-600' 
                        : budgetStatus === 'at-risk' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {budgetUsedPercent}% used
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-[rgb(24,62,105)] hover:text-[rgb(236,107,44)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="text-[rgb(24,62,105)] hover:text-[rgb(236,107,44)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No projects found matching your criteria. Try adjusting your filters or search terms.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProjects.length}</span> of{' '}
              <span className="font-medium">{filteredProjects.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button aria-current="page" className="z-10 bg-[rgb(24,62,105)] border-[rgb(24,62,105)] text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
