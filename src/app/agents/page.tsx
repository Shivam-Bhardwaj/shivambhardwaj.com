"use client";

import { useState } from 'react';
import { Activity, Bot, CheckCircle, Clock, Code, Database, Globe, Zap } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'completed' | 'error';
  description: string;
  capabilities: string[];
  lastTask: string;
  tasksCompleted: number;
  uptime: string;
  performance: number;
  icon: React.ReactNode;
  color: string;
}

const agents: Agent[] = [
  {
    id: 'github-integration',
    name: 'GitHub Integration Agent',
    type: 'Data Extraction',
    status: 'completed',
    description: 'Fetches repository data, commit history, and statistics from GitHub API',
    capabilities: ['Repository fetching', 'Commit history visualization', 'Language analysis', 'Rate limit handling'],
    lastTask: 'Fetched 41 repositories with statistics and commit data',
    tasksCompleted: 15,
    uptime: '2h 45m',
    performance: 92,
    icon: <Database className="w-5 h-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'ui-optimization',
    name: 'UI/UX Optimization Agent',
    type: 'Frontend Development',
    status: 'completed',
    description: 'Optimizes layouts, fixes UI bugs, and enhances user experience',
    capabilities: ['Layout compaction', 'Theme system fixes', 'Responsive design', 'Accessibility improvements'],
    lastTask: 'Redesigned main page layout and fixed theme switcher',
    tasksCompleted: 8,
    uptime: '1h 32m',
    performance: 88,
    icon: <Globe className="w-5 h-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'linkedin-integration',
    name: 'LinkedIn Data Agent',
    type: 'Professional Data',
    status: 'completed',
    description: 'Extracts and structures professional experience data',
    capabilities: ['Experience timeline', 'Skills mapping', 'Professional formatting', 'Career progression'],
    lastTask: 'Created comprehensive work experience timeline',
    tasksCompleted: 12,
    uptime: '2h 15m',
    performance: 95,
    icon: <Bot className="w-5 h-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'tech-documentation',
    name: 'Technical Documentation Agent',
    type: 'Infrastructure',
    status: 'completed',
    description: 'Documents tech stack, infrastructure, and system specifications',
    capabilities: ['Version tracking', 'Infrastructure mapping', 'Performance metrics', 'Security documentation'],
    lastTask: 'Built comprehensive infrastructure documentation with live metrics',
    tasksCompleted: 20,
    uptime: '3h 8m',
    performance: 97,
    icon: <Code className="w-5 h-5" />,
    color: 'bg-orange-500'
  },
  {
    id: 'content-generation',
    name: 'Content Generation Agent',
    type: 'Content Management',
    status: 'completed',
    description: 'Creates blog posts, documentation, and content management systems',
    capabilities: ['Blog post generation', 'SEO optimization', 'Content structuring', 'Metadata generation'],
    lastTask: 'Enhanced blog system with card layout and agent portfolio post',
    tasksCompleted: 18,
    uptime: '2h 52m',
    performance: 91,
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-pink-500'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 bg-green-100 text-green-800',
  idle: 'bg-yellow-100 text-yellow-800 bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800 bg-blue-100 text-blue-800',
  error: 'bg-red-100 text-red-800 bg-red-100 text-red-800'
};

const statusIcons = {
  active: <Activity className="w-4 h-4" />,
  idle: <Clock className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  error: <Activity className="w-4 h-4" />
};

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const totalTasks = agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
  const averagePerformance = Math.round(agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length);
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const completedAgents = agents.filter(agent => agent.status === 'completed').length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900  mb-4">
              AI Agent Portfolio
            </h1>
            <p className="text-xl text-gray-600  max-w-3xl mx-auto">
              Meet the specialized AI agents that automated the development of this portfolio website. 
              Each agent has specific capabilities and responsibilities in the development workflow.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white bg-white rounded-lg shadow-sm border border-gray-200 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 ">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900 ">{activeAgents}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white bg-white rounded-lg shadow-sm border border-gray-200 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 ">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 ">{totalTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white bg-white rounded-lg shadow-sm border border-gray-200 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 ">Avg Performance</p>
                  <p className="text-2xl font-bold text-gray-900 ">{averagePerformance}%</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white bg-white rounded-lg shadow-sm border border-gray-200 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 ">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900 ">{agents.length}</p>
                </div>
                <Bot className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Agent Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="bg-white bg-white rounded-lg shadow-sm border border-gray-200 border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${agent.color} p-2 rounded-lg text-white`}>
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 ">{agent.name}</h3>
                      <p className="text-sm text-gray-500 ">{agent.type}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[agent.status]}`}>
                    {statusIcons[agent.status]}
                    <span className="capitalize">{agent.status}</span>
                  </div>
                </div>

                <p className="text-gray-600  text-sm mb-4">
                  {agent.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 ">Performance</span>
                    <span className="text-sm font-medium text-gray-900 ">{agent.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${agent.color.replace('bg-', 'bg-opacity-80 bg-')}`}
                      style={{ width: `${agent.performance}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 ">Tasks: {agent.tasksCompleted}</span>
                    <span className="text-gray-500 ">Uptime: {agent.uptime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agent Detail Modal */}
          {selectedAgent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`${selectedAgent.color} p-3 rounded-lg text-white`}>
                        {selectedAgent.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 ">
                          {selectedAgent.name}
                        </h2>
                        <p className="text-gray-500 ">{selectedAgent.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="text-gray-400 hover:text-gray-600 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900  mb-2">Description</h3>
                      <p className="text-gray-600 ">{selectedAgent.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900  mb-2">Capabilities</h3>
                      <ul className="space-y-2">
                        {selectedAgent.capabilities.map((capability, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600 ">{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900  mb-2">Last Task</h3>
                      <p className="text-gray-600 ">{selectedAgent.lastTask}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 bg-gray-100 rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 ">{selectedAgent.tasksCompleted}</p>
                          <p className="text-sm text-gray-500 ">Tasks Completed</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 bg-gray-100 rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 ">{selectedAgent.performance}%</p>
                          <p className="text-sm text-gray-500 ">Performance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}