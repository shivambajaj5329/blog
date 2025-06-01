// components/Jobs.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Job {
  id: number;
  title: string;
  company: string;
  date_range: string;
  description: string;
  technologies: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface JobsProps {
  onLoadComplete?: () => void;
}

export default function Jobs({ onLoadComplete }: JobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('order_index', { ascending: false });

      if (error) {
        throw error;
      }

      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
      onLoadComplete?.();
    }
  };

  if (loading) {
    return (
      <div className="timeline relative max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-500/30 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <span className="ml-4 text-gray-300">Loading professional journey...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline relative max-w-5xl mx-auto">
        <div className="text-center py-16">
          <div className="text-red-400 mb-4">⚠️ {error}</div>
          <button
            onClick={fetchJobs}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="timeline relative max-w-5xl mx-auto">
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">📝 No jobs added yet</div>
          <p className="text-gray-500">Add your first job experience from the admin panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline relative max-w-5xl mx-auto">
      {/* Central timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 rounded-full hidden md:block"></div>

      {jobs.map((job, index) => {
        const isRightSide = index % 2 === 0;
        const gradientColors = [
          'from-purple-500 to-pink-500',
          'from-pink-500 to-blue-500',
          'from-blue-500 to-cyan-500',
          'from-cyan-500 to-emerald-500'
        ];
        const shadowColors = [
          'shadow-purple-500/50',
          'shadow-pink-500/50',
          'shadow-blue-500/50',
          'shadow-cyan-500/50'
        ];

        const gradientClass = gradientColors[index % gradientColors.length];
        const shadowClass = shadowColors[index % shadowColors.length];

        return (
          <div key={job.id} className="timeline-item relative mb-16 opacity-0 transform translate-y-12">
            {/* Timeline dot */}
            <div className={`absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r ${gradientClass} rounded-full border-4 border-black z-10 shadow-lg ${shadowClass} hidden md:block`}></div>

            {/* Job content */}
            <div className={`${isRightSide
              ? 'md:w-1/2 md:ml-auto md:pl-12'
              : 'md:w-1/2 md:pr-12'
            }`}>
              <div className={`bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 ${
                !isRightSide ? 'md:text-right' : ''
              }`}>
                <div className="text-purple-400 font-semibold text-sm mb-2">
                  {job.date_range}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">
                  {job.title}
                </h3>
                <div className="text-pink-400 font-semibold mb-4">
                  {job.company}
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {job.description}
                </p>
                <div className={`flex flex-wrap gap-2 ${!isRightSide ? 'md:justify-end' : ''}`}>
                  {job.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}