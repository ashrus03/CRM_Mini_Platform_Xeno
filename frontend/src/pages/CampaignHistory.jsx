import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  FiRefreshCw,
  FiPlus,
  FiMail,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

const CampaignHistory = () => {
  const { token } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    setErrorMessage(null);
    if (!token) {
      setErrorMessage("You must be logged in to view campaigns.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const response = (
        await axios.get(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/campaigns/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        )
      ).data;
      setCampaigns(response.data.campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [token]);

  const handleCreateCampaign = () => {
    setErrorMessage(null);
    if (loading) return;
    if (!token) {
      setErrorMessage("You must be logged in to create a campaign.");
      return;
    }
    navigate("/campaigns/new");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "running":
        return <FiActivity className="h-3 w-3" />;
      case "completed":
        return <FiCheckCircle className="h-3 w-3" />;
      default:
        return <FiCalendar className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-25">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Campaign History
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and track your email marketing campaigns
            </p>
            {errorMessage && (
              <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded shadow-lg">
                {errorMessage}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchCampaigns}
              disabled={loading}
              className="cursor-pointer flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleCreateCampaign}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              <FiPlus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-900 mb-2">
            <FiTrendingUp /> Recent Campaigns
          </div>
          <p className="text-slate-600 mb-4">
            View and manage your email marketing campaigns
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiRefreshCw className="h-6 w-6 animate-spin text-orange-500 mr-2" />
              <span className="text-slate-600">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <FiMail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-slate-600 mb-6">
                Get started by creating your first email campaign
              </p>
              <button
                onClick={handleCreateCampaign}
                className="cursor-pointer px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <FiPlus className="h-4 w-4 inline mr-2" />
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign, index) => (
                <div key={campaign._id}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-all duration-200">
                    <div className="flex-1 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-8">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Created{" "}
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {getStatusIcon(campaign.status)}
                          {campaign.status.charAt(0).toUpperCase() +
                            campaign.status.slice(1)}
                        </span>

                        <div className="flex items-center gap-2 text-slate-600">
                          <FiUsers className="h-4 w-4" />
                          <span>{campaign.audienceSize.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <FiCheckCircle className="h-4 w-4" />
                            <span className="font-medium">
                              {campaign.deliveryStats.sent.toLocaleString()}
                            </span>
                          </div>
                          {campaign.deliveryStats.failed > 0 && (
                            <div className="flex items-center gap-1 text-red-500">
                              <FiXCircle className="h-4 w-4" />
                              <span className="font-medium">
                                {campaign.deliveryStats.failed.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < campaigns.length - 1 && (
                    <hr className="my-4 border-slate-200" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignHistory;
