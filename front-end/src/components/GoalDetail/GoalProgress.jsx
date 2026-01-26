import React from 'react'
import { CheckCircle2 } from 'lucide-react'

const GoalProgress = ({ selectedGoal, overallStats, dailyStats, weeklyStats, monthlyStats }) => {
    return (
        <div className={`rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 ${
            selectedGoal.isCompleted ? 'bg-green-100 border-2 border-green-300' : 'bg-green-50'
        }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Overall Progress</h2>
                {selectedGoal.isCompleted && (
                    <div className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center w-fit">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Goal Completed! 🎉
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                        {overallStats.percentage}%
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">Complete</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                        {dailyStats.completed}/{dailyStats.total}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">Daily Tasks</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                        {weeklyStats.completed}/{weeklyStats.total}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">Weekly Tasks</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                        {monthlyStats.completed}/{monthlyStats.total}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">Monthly Tasks</div>
                </div>
            </div>
            
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${overallStats.percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    )
}

export default GoalProgress