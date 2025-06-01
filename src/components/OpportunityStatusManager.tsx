// components/OpportunityStatusManager.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface OpportunityStatusManagerProps {
  showOpportunityManager: boolean;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function OpportunityStatusManager({
  showOpportunityManager,
  showMessage
}: OpportunityStatusManagerProps) {
  const [isOpenToOpportunities, setIsOpenToOpportunities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (showOpportunityManager) {
      fetchOpportunityStatus();
    }
  }, [showOpportunityManager]);

  const fetchOpportunityStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'open_to_opportunities')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // If no record exists, default to false
      const status = data?.value === 'true' || false;
      setIsOpenToOpportunities(status);
    } catch (error) {
      console.error('Error fetching opportunity status:', error);
      showMessage("Failed to fetch opportunity status", "error");
    } finally {
      setInitialLoad(false);
    }
  };

  const updateOpportunityStatus = async (newStatus: boolean) => {
    setLoading(true);

    try {
      // First, try to update existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'open_to_opportunities')
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('settings')
          .update({
            value: newStatus.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('settings')
          .insert([{
            key: 'open_to_opportunities',
            value: newStatus.toString()
          }]);

        if (error) throw error;
      }

      setIsOpenToOpportunities(newStatus);
      showMessage(
        `Opportunity status ${newStatus ? 'enabled' : 'disabled'} successfully!`,
        "success"
      );
    } catch (error) {
      console.error('Error updating opportunity status:', error);
      showMessage("Failed to update opportunity status", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!showOpportunityManager) return null;

  return (
    <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>💼</span> Opportunity Status
        </h2>
        <p className="text-gray-300 mt-1">Control whether you're open to new opportunities</p>
      </div>

      <div className="p-6">
        {initialLoad ? (
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-purple-500/30 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <span className="ml-3 text-gray-300">Loading status...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Status Display */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${
                    isOpenToOpportunities
                      ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                      : 'bg-gray-500'
                  }`}>
                    {isOpenToOpportunities && (
                      <div className="w-4 h-4 bg-emerald-400 rounded-full animate-ping absolute"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {isOpenToOpportunities ? "Open to Opportunities" : "Not Open to Opportunities"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isOpenToOpportunities
                        ? "The green badge will be visible on your resume page"
                        : "The opportunity badge will be hidden from your resume"
                      }
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => updateOpportunityStatus(!isOpenToOpportunities)}
                  disabled={loading}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${
                    isOpenToOpportunities
                      ? 'bg-emerald-500'
                      : 'bg-gray-600'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                      isOpenToOpportunities ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <span>👁️</span> Preview
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                This is how the badge will appear on your resume:
              </p>

              {isOpenToOpportunities ? (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  </div>
                  <span className="text-emerald-300 font-medium">Open to opportunities</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600/20 border border-gray-500/30">
                  <span className="text-gray-400 text-sm">Badge Hidden</span>
                  <span className="text-lg">🫥</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => updateOpportunityStatus(true)}
                disabled={loading || isOpenToOpportunities}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && isOpenToOpportunities ? "Enabling..." : "Enable"}
              </button>

              <button
                onClick={() => updateOpportunityStatus(false)}
                disabled={loading || !isOpenToOpportunities}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && !isOpenToOpportunities ? "Disabling..." : "Disable"}
              </button>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-lg">💡</span>
                <div>
                  <h5 className="text-blue-300 font-medium mb-1">Pro Tip</h5>
                  <p className="text-blue-200 text-sm">
                    Turn this off when you don't want your current employer to see that you're looking for new opportunities.
                    You can always enable it again when you're ready to start job hunting!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}