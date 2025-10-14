import ExampleGeneration from "@/components/User/Roadmap/ExampleGeneration";
import Header from "@/components/User/Roadmap/Header";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
export default function RoadMapGeneration() {
  const [skill, setSkill] = useState("");
  const [selectedApproach, setSelectedApproach] = useState("complete-mastery");
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const popularSkills = [
    "React Development",
    "Full Stack Development",
    "Python Programming",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "DevOps Engineering",
    "Mobile App Development",
    "Cybersecurity",
    "Cloud Computing",
  ];

  const learningApproaches = [
    {
      id: "complete-mastery",
      name: "Complete Mastery",
      description: "Full comprehensive learning from basics to advanced",
      roadmapStyle:
        "Shows all concepts across all levels with detailed progression",
    },
    {
      id: "interview-prep",
      name: "Interview Preparation",
      description: "Focus on commonly asked concepts and practical questions",
      roadmapStyle:
        "Emphasizes frequently tested topics, coding problems, and key concepts",
    },
    {
      id: "quick-recap",
      name: "Quick Recap/Revision",
      description:
        "Brief overview of key concepts for someone with basic knowledge",
      roadmapStyle:
        "Condensed version highlighting essential topics and key points",
    },
    {
      id: "project-focused",
      name: "Project-Based Learning",
      description:
        "Learn through building real-world projects and applications",
      roadmapStyle:
        "Organized around practical projects with concepts learned as needed",
    },
    {
      id: "certification-prep",
      name: "Certification Preparation",
      description: "Structured learning for specific technology certifications",
      roadmapStyle:
        "Aligned with certification exam objectives and requirements",
    },
    {
      id: "foundation-building",
      name: "Strong Foundation",
      description:
        "Deep understanding of core concepts before moving to advanced topics",
      roadmapStyle:
        "Emphasizes fundamentals with thorough understanding before progression",
    },
    {
      id: "practical-skills",
      name: "Practical Skills Only",
      description: "Focus on immediately applicable skills for current work",
      roadmapStyle:
        "Skips theoretical concepts, focuses on hands-on practical applications",
    },
    {
      id: "competitive-programming",
      name: "Competitive Programming",
      description:
        "Algorithm and data structure focused for coding competitions",
      roadmapStyle:
        "Heavy emphasis on algorithms, data structures, and problem-solving",
    },
    {
      id: "academic-study",
      name: "Academic/Theoretical",
      description:
        "Comprehensive theoretical understanding with academic depth",
      roadmapStyle:
        "Includes theoretical foundations, research papers, and academic concepts",
    },
  ];

  const handleSkillSelect = (selectedSkill) => {
    setSkill(selectedSkill);
  };

  const roadmapGenerationRequest = async () => {
    setIsLoading(true);
    if (!skill) {
      toast.info("Please enter a skill to generate comprehensive roadmap");
      return;
    }

    // ✅ Find the full approach object by id
    const approachObject = learningApproaches.find(
      (approach) => approach.id === selectedApproach
    );
    console.log(skill, approachObject, user.id);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/roadmap/generation`,
        {
          skill: skill,
          approach: approachObject,
          id: user.id,
        }
      );
      setIsLoading(false);
      console.log(response.data);
      toast.success(
        <div>
          <p className="text-sm text-black">Roadmap generated successfully!</p>
          <Link 
            to={`/user/road-map/displayDetailedRoadmap/${response.data.roadmap._id}`}
            className=" text-sm inline-block mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700 transition"
          >
            View
          </Link>
        </div>,
        { autoClose: 7000,theme:"light" }, 
      );
              setGeneratedRoadmap(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate roadmap");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Complete Skill Concept Roadmap
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto">
            Get a comprehensive overview of any skill from basic concepts to guru-level mastery. 
            Discover all topics, concepts, and related skills to plan your complete learning journey.
          </p>
        </div>
        
        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg py-8 px-4 mb-8">
          {/* Skill Input Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-green-600 mb-4">
              Enter the skill you want to master completely
            </label>
            <input
              type="text"
              value={skill}
              required
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. Python Programming"
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-600 focus:outline-none text-lg transition-colors"
            />
          </div>

          {/* Popular Skills */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Popular Skills
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {popularSkills.map((popularSkill, index) => (
                <button
                  key={index}
                  onClick={() => handleSkillSelect(popularSkill)}
                  className="px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-500 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  {popularSkill}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Focus on Specific Level (Optional)
            </h3>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                How would you like to approach learning this skill?
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {learningApproaches.map((approach) => (
                  <label
                    key={approach.id}
                    className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-500 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="learningApproach"
                      value={approach.id}
                      checked={selectedApproach === approach.id}
                      onChange={(e) => setSelectedApproach(e.target.value)}
                      className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500 mt-1"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-800 text-sm mb-1">
                        {approach.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {approach.description}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        📋 {approach.roadmapStyle}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={roadmapGenerationRequest}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-lg text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex  gap-3">
                  <div className="w-4 h-4 p-0 border-t-1 animate-spin rounded-3xl"></div>
                  <div>Generating Complete Concept Map</div>{" "}
                </div>
              ) : (
                <div>Generate Complete Concept Map</div>
              )}
            </button>
          </div>

          {/* Generated Roadmap Display */}
          {generatedRoadmap && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Complete Concept Roadmap: {generatedRoadmap.skill}
              </h3>
              <p className="text-green-700">{generatedRoadmap.message}</p>
            </div>
          )}
        </div>
        <Header />
        <ExampleGeneration />
      </div>
    </div>
  );
}
