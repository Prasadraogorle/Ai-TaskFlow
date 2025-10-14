import React from 'react'

export default function Header() {

    const skillLevels = [
       { id: 'all', name: 'All Levels', description: 'Complete overview from basic to guru' },
       { id: 'novice', name: 'Novice', description: 'Just starting to learn the fundamentals' },
       { id: 'beginner', name: 'Beginner', description: 'Understanding basic concepts with guidance' },
       { id: 'competent', name: 'Competent', description: 'Applying knowledge in practical settings' },
       { id: 'proficient', name: 'Proficient', description: 'Understanding bigger picture and variations' },
       { id: 'expert', name: 'Expert', description: 'Intuitive understanding and adaptability' },
       { id: 'master', name: 'Master', description: 'Effortless excellence and innovation' }
     ];
  return (
    <div>
        {/* Header */}
        
{/* Skill Progression Levels */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Skill Progression Framework
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {skillLevels.slice(1).map((level, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">{level.name}</h3>
                <p className="text-xs text-gray-600 leading-tight">{level.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Complete Overview</h3>
            <p className="text-gray-600 text-sm">All concepts from basic to guru level in one comprehensive map</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Skill Progression</h3>
            <p className="text-gray-600 text-sm">Clear progression path through 6 mastery levels</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Related Skills</h3>
            <p className="text-gray-600 text-sm">Discover complementary skills and next learning opportunities</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Career Pathways</h3>
            <p className="text-gray-600 text-sm">Understand career opportunities and specialization options</p>
          </div>
        </div>
    </div>
  )
}
