// components/JobsManager.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Job {
  id?: number;
  title: string;
  company: string;
  date_range: string;
  description: string;
  technologies: string[];
  order_index: number;
}

interface JobsManagerProps {
  showJobsManager: boolean;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function JobsManager({ showJobsManager, showMessage }: JobsManagerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Job>({
    title: "",
    company: "",
    date_range: "",
    description: "",
    technologies: [],
    order_index: 0
  });
  const [techInput, setTechInput] = useState("");

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (showJobsManager) {
      fetchJobs();
    }
  }, [showJobsManager]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('order_index', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showMessage("Failed to fetch jobs", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      date_range: "",
      description: "",
      technologies: [],
      order_index: jobs.length
    });
    setTechInput("");
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.company.trim()) {
      showMessage("Title and company are required", "error");
      return;
    }

    setLoading(true);

    try {
      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update({
            title: formData.title,
            company: formData.company,
            date_range: formData.date_range,
            description: formData.description,
            technologies: formData.technologies,
            order_index: formData.order_index,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingJob.id);

        if (error) throw error;
        showMessage("Job updated successfully!", "success");
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert([{
            title: formData.title,
            company: formData.company,
            date_range: formData.date_range,
            description: formData.description,
            technologies: formData.technologies,
            order_index: formData.order_index
          }]);

        if (error) throw error;
        showMessage("Job added successfully!", "success");
      }

      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      showMessage(`Failed to ${editingJob ? 'update' : 'add'} job`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      date_range: job.date_range,
      description: job.description,
      technologies: [...job.technologies],
      order_index: job.order_index
    });
    setTechInput("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage("Job deleted successfully!", "success");
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      showMessage("Failed to delete job", "error");
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const moveJob = async (job: Job, direction: 'up' | 'down') => {
    const currentIndex = job.order_index;
    const newIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;

    // Find job at the target position
    const targetJob = jobs.find(j => j.order_index === newIndex);

    if (!targetJob) return;

    try {
      // Swap order_index values
      await supabase
        .from('jobs')
        .update({ order_index: newIndex })
        .eq('id', job.id);

      await supabase
        .from('jobs')
        .update({ order_index: currentIndex })
        .eq('id', targetJob.id);

      fetchJobs();
      showMessage("Job order updated!", "success");
    } catch (error) {
      console.error('Error updating job order:', error);
      showMessage("Failed to update job order", "error");
    }
  };

  if (!showJobsManager) return null;

  return (
    <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>💼</span> Jobs Manager
        </h2>
        <p className="text-gray-300 mt-1">Manage your professional experience</p>
      </div>

      <div className="p-6">
        {/* Job Form */}
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4 text-white">
            {editingJob ? "✏️ Edit Job" : "➕ Add New Job"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Senior Full-Stack Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., TechCorp Solutions"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <input
                type="text"
                value={formData.date_range}
                onChange={(e) => setFormData(prev => ({ ...prev, date_range: e.target.value }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 2024 - Present"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order Index (higher = shows first)
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Describe your role and achievements..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Technologies
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Add a technology..."
              />
              <button
                type="button"
                onClick={addTechnology}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(index)}
                    className="ml-1 text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : editingJob ? "Update Job" : "Add Job"}
            </button>

            {editingJob && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Jobs List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <span>📋</span> Current Jobs ({jobs.length})
          </h3>

          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No jobs added yet. Create your first job entry above!
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                      <p className="text-purple-400">{job.company}</p>
                      <p className="text-sm text-gray-400">{job.date_range}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
                        Order: {job.order_index}
                      </span>
                      <button
                        onClick={() => moveJob(job, 'up')}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Move up"
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveJob(job, 'down')}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Move down"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(job.id!)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {job.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded text-purple-200 text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}