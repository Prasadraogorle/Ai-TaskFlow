import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Calendar, Clock, CheckCircle2, Gamepad2, Loader2 } from 'lucide-react'
import { connectGoogleCalendar, addTasksToCalendar, removeTasksFromCalendar } from '@/store/google'

const GoalHeader = ({ selectedGoal, goalId, user, navigate }) => {
    const dispatch = useDispatch()
    const { loading: googleLoading } = useSelector((state) => state.google)
    const googleConnected = user?.googleConnected
    const isCalendarSynced = selectedGoal?.dailyTasks?.some(group =>
        group.calendarEventIds?.some(id => id)
    )

    return (
        <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                                    {selectedGoal.goalTitle}
                                </h1>
                                {selectedGoal.isCompleted && (
                                    <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center w-fit mt-1 sm:mt-0">
                                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Completed
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                                <div className="flex items-center">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                                    <span>{selectedGoal.duration}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                                    <span>{selectedGoal.totalDays} days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                        {!googleConnected && (
                            <button
                                onClick={() => dispatch(connectGoogleCalendar(goalId))}
                                disabled={googleLoading}
                                className="bg-white border border-blue-500 text-blue-600 px-3 sm:px-4 py-2 rounded-lg font-medium
                                         hover:bg-blue-500 hover:text-white transition-all duration-300 text-xs sm:text-sm
                                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {googleLoading ? (
                                    <>
                                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    'Connect Calendar'
                                )}
                            </button>
                        )}

                        {googleConnected && !isCalendarSynced && (
                            <button
                                onClick={() => dispatch(addTasksToCalendar({ goalId }))}
                                disabled={googleLoading}
                                className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium
                                         hover:bg-white hover:text-green-600 hover:border hover:border-green-600 transition-all duration-300 text-xs sm:text-sm
                                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {googleLoading ? (
                                    <>
                                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    'Add to Calendar'
                                )}
                            </button>
                        )}

                        {googleConnected && isCalendarSynced && (
                            <button
                                onClick={() => dispatch(removeTasksFromCalendar({ goalId }))}
                                disabled={googleLoading}
                                className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium
                                         hover:bg-white hover:text-red-600 hover:border hover:border-red-600 transition-all duration-300 text-xs sm:text-sm
                                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {googleLoading ? (
                                    <>
                                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                        <span>Removing...</span>
                                    </>
                                ) : (
                                    'Remove Calendar'
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => navigate(`/user/goal/${goalId}/map`)}
                            className="bg-green-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium 
                                     transition-colors duration-300 flex items-center space-x-2 
                                     hover:bg-white hover:text-green-600 hover:border hover:border-green-600"
                        >
                            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Adventure Map</span>
                            <span className="sm:hidden">Map</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GoalHeader   