import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getGoalById } from '@/store/task'
import { toast } from 'sonner'
import { clearGoogleStatus } from '@/store/google'
import GoalProgress from '@/components/GoalDetail/GoalProgress'
import GoalHeader from '@/components/GoalDetail/GoalHeader'
import TaskTabs from '@/components/GoalDetail/TaskTabs'
import ResourcesDialog from '@/components/GoalDetail/ResourcesDialog'
import LoadingSpinner from '@/components/GoalDetail/LoadingSpineer'
import { Target } from 'lucide-react'

const GoalDetail = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { goalId } = useParams()
    const { user } = useSelector((state) => state.auth)
    const { selectedGoal, loading, error } = useSelector((state) => state.task)
    const { successMessage, error: googleError } = useSelector((state) => state.google)
    
    const [activeTab, setActiveTab] = useState('daily')
    const [resourcesDialog, setResourcesDialog] = useState(false)
    const [selectedResources, setSelectedResources] = useState([])
    const [taskStates, setTaskStates] = useState({
        daily: {},
        weekly: {},
        monthly: {}
    })

    useEffect(() => {
        if (user && goalId) {
            dispatch(getGoalById({ goalId, user }))
        }
    }, [dispatch, user, goalId])

    useEffect(() => {
        if (selectedGoal) {
            const initializeTaskStates = (taskGroups) => {
                const states = {}
                taskGroups?.forEach((group, groupIndex) => {
                    states[groupIndex] = {}
                    group.tasks?.forEach((_, taskIndex) => {
                        states[groupIndex][taskIndex] = group.status || false
                    })
                })
                return states
            }

            setTaskStates({
                daily: initializeTaskStates(selectedGoal.dailyTasks),
                weekly: initializeTaskStates(selectedGoal.weeklyTasks),
                monthly: initializeTaskStates(selectedGoal.monthlyTasks)
            })
        }
    }, [selectedGoal])

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(clearGoogleStatus())
        }
        if (googleError) {
            toast.error(googleError)
            dispatch(clearGoogleStatus())
        }
    }, [successMessage, googleError, dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const getCompletionStats = (taskGroups) => {
        if (!taskGroups || taskGroups.length === 0) return { completed: 0, total: 0, percentage: 0 }
        
        const completed = taskGroups.filter(group => group.status).length
        const total = taskGroups.length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        
        return { completed, total, percentage }
    }

    if (loading.getGoalById) {
        return <LoadingSpinner />
    }

    if (!selectedGoal) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-20 sm:pt-0 px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Goal not found</h3>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const dailyStats = getCompletionStats(selectedGoal?.dailyTasks)
    const weeklyStats = getCompletionStats(selectedGoal?.weeklyTasks)
    const monthlyStats = getCompletionStats(selectedGoal?.monthlyTasks)

    const overallStats = {
        completed: dailyStats.completed + weeklyStats.completed + monthlyStats.completed,
        total: dailyStats.total + weeklyStats.total + monthlyStats.total
    }
    overallStats.percentage = overallStats.total > 0 
        ? Math.round((overallStats.completed / overallStats.total) * 100) 
        : 0

    return (
        <div className="min-h-screen bg-white pt-16 sm:pt-0">
            <GoalHeader 
                selectedGoal={selectedGoal}
                goalId={goalId}
                user={user}
                navigate={navigate}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                <GoalProgress 
                    selectedGoal={selectedGoal}
                    overallStats={overallStats}
                    dailyStats={dailyStats}
                    weeklyStats={weeklyStats}
                    monthlyStats={monthlyStats}
                />

                <TaskTabs
                    selectedGoal={selectedGoal}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    taskStates={taskStates}
                    setTaskStates={setTaskStates}
                    dailyStats={dailyStats}
                    weeklyStats={weeklyStats}
                    monthlyStats={monthlyStats}
                    goalId={goalId}
                    user={user}
                    setResourcesDialog={setResourcesDialog}
                    setSelectedResources={setSelectedResources}
                />
            </div>

            <ResourcesDialog 
                open={resourcesDialog}
                onOpenChange={setResourcesDialog}
                selectedResources={selectedResources}
            />
        </div>
    )
}

export default GoalDetail