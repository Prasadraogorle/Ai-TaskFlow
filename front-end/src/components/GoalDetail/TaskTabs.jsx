import React from 'react'
import { useDispatch } from 'react-redux'
import { Timer, CalendarDays, Calendar, Target, CheckCircle2, Circle, BookOpen } from 'lucide-react'
import { updateDailyTaskStatus, updateWeeklyTaskStatus, updateMonthlyTaskStatus, getGoalById } from '@/store/task'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Video, FileText, Link, ExternalLink } from 'lucide-react'

const TaskTabs = ({ 
    selectedGoal, 
    activeTab, 
    setActiveTab, 
    taskStates, 
    setTaskStates,
    dailyStats,
    weeklyStats,
    monthlyStats,
    goalId,
    user,
    setResourcesDialog,
    setSelectedResources
}) => {
    const dispatch = useDispatch()

    const handleIndividualTaskToggle = (taskType, groupIndex, taskIndex) => {
        setTaskStates(prevStates => {
            const newStates = { ...prevStates }
            const currentTaskState = newStates[taskType][groupIndex][taskIndex]
            newStates[taskType][groupIndex][taskIndex] = !currentTaskState

            const groupTasks = newStates[taskType][groupIndex]
            const allTasksCompleted = Object.values(groupTasks).every(status => status === true)
            const anyTaskCompleted = Object.values(groupTasks).some(status => status === true)

            if (allTasksCompleted && !currentTaskState) {
                handleGroupStatusUpdate(taskType, groupIndex, true)
            } else if (!anyTaskCompleted && currentTaskState) {
                handleGroupStatusUpdate(taskType, groupIndex, false)
            }

            return newStates
        })
    }

    const handleGroupStatusUpdate = async (taskType, groupIndex, status) => {
        try {
            if (taskType === 'daily') {
                await dispatch(updateDailyTaskStatus({ 
                    goalId, 
                    taskIndex: groupIndex,
                    status, 
                    user 
                })).unwrap()
            } else if (taskType === 'weekly') {
                await dispatch(updateWeeklyTaskStatus({ 
                    goalId, 
                    taskIndex: groupIndex,
                    status, 
                    user 
                })).unwrap()
            } else if (taskType === 'monthly') {
                await dispatch(updateMonthlyTaskStatus({ 
                    goalId, 
                    taskIndex: groupIndex,
                    status, 
                    user 
                })).unwrap()
            }
            
            await dispatch(getGoalById({ goalId, user }))
            toast.success(`Task group ${status ? 'completed' : 'marked as incomplete'}!`)
        } catch (error) {
            toast.error('Failed to update task status')
        }
    }

    const getTaskCompletionCount = (taskType, groupIndex) => {
        if (!taskStates[taskType][groupIndex]) return { completed: 0, total: 0 }
        
        const groupTasks = taskStates[taskType][groupIndex]
        const completed = Object.values(groupTasks).filter(status => status === true).length
        const total = Object.keys(groupTasks).length
        
        return { completed, total }
    }

    const isTaskCompleted = (taskType, groupIndex, taskIndex) => {
        return taskStates[taskType][groupIndex]?.[taskIndex] || false
    }

    const handleResourcesClick = (resources, groupLabel) => {
        setSelectedResources({ resources, groupLabel })
        setResourcesDialog(true)
    }

    const renderTaskList = (taskGroups, taskType) => {
        if (!taskGroups || taskGroups.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-gray-600">No {taskType} tasks available</p>
                </div>
            )
        }

        return (
            <div className="space-y-4 sm:space-y-6">
                {taskGroups.map((group, groupIndex) => {
                    const { completed, total } = getTaskCompletionCount(taskType, groupIndex)
                    const isGroupCompleted = completed === total && total > 0
                    const hasResources = group.resources && group.resources.length > 0
                    
                    return (
                        <div key={groupIndex} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex flex-col sm:flex-row sm:items-center">
                                    <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-0 sm:mr-3 inline-block w-fit">
                                        {group.label}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600">
                                        ({completed}/{total} completed)
                                    </span>
                                    {isGroupCompleted && (
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-0 sm:ml-2 mt-1 sm:mt-0" />
                                    )}
                                </h3>
                                
                                {hasResources && (
                                    <button
                                        onClick={() => handleResourcesClick(group.resources, group.label)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 w-fit mt-2 sm:mt-0"
                                    >
                                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>Resources ({group.resources.length})</span>
                                    </button>
                                )}
                            </div>
                            
                            {group.tasks && group.tasks.length > 0 ? (
                                <div className="space-y-2 sm:space-y-3">
                                    {group.tasks.map((taskContent, taskIndex) => {
                                        const isCompleted = isTaskCompleted(taskType, groupIndex, taskIndex)
                                        
                                        return (
                                            <div 
                                                key={taskIndex}
                                                className={`bg-white border rounded-lg p-3 sm:p-4 transition-all duration-200 ${
                                                    isCompleted 
                                                        ? 'border-green-300 bg-green-50' 
                                                        : 'border-gray-200 hover:border-green-300'
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <button
                                                        onClick={() => handleIndividualTaskToggle(taskType, groupIndex, taskIndex)}
                                                        className="mt-0.5 sm:mt-1 flex-shrink-0 p-1"
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" />
                                                        )}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm sm:text-base leading-relaxed ${
                                                            isCompleted 
                                                                ? 'line-through text-gray-500' 
                                                                : 'text-gray-800'
                                                        }`}>
                                                            {taskContent}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm">No tasks in this group</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="sticky top-[89px] sm:top-[73px] bg-white border-b border-gray-200 z-10">
                <nav className="flex px-4 sm:px-6 overflow-x-auto">
                    {[
                        { id: 'daily', label: 'Daily Tasks', icon: Timer, count: dailyStats.total },
                        { id: 'weekly', label: 'Weekly Tasks', icon: CalendarDays, count: weeklyStats.total },
                        { id: 'monthly', label: 'Monthly Tasks', icon: Calendar, count: monthlyStats.total }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 sm:py-4 px-1 sm:px-1 mr-6 sm:mr-8 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                                activeTab === tab.id 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-4 sm:p-6">
                {activeTab === 'daily' && renderTaskList(selectedGoal.dailyTasks, 'daily')}
                {activeTab === 'weekly' && renderTaskList(selectedGoal.weeklyTasks, 'weekly')}
                {activeTab === 'monthly' && renderTaskList(selectedGoal.monthlyTasks, 'monthly')}
            </div>
        </div>
    )
}

export default TaskTabs