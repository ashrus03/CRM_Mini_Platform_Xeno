import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const CampaignBuilder = () => {
  const { token, isAuthLoading } = useContext(AuthContext);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiError, setAiError] = useState("");
  const [objective, setObjective] = useState("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);
  const [campaignName, setCampaignName] = useState("");
  const [audienceCount, setAudienceCount] = useState(0);
  const [error, setError] = useState("");
  const [logic, setLogic] = useState("AND");
  const [rules, setRules] = useState([
    { metric: "totalSpend", operator: ">", value: "" },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...rules];
    updatedRules[index][field] = value;
    setRules(updatedRules);
  };

  const addRule = () => {
    setRules([...rules, { metric: "totalSpend", operator: ">", value: "" }]);
  };

  const removeRule = (index) => {
    const updated = [...rules];
    updated.splice(index, 1);
    setRules(updated);
  };

  const handlePreview = async () => {
    setError("");
    setAudienceCount(null);
    if (rules.some((rule) => rule.value === "")) {
      setError("Please fill in all rule values before previewing.");
      return;
    }
    if (error) return;
    if (previewLoading) return;
    try {
      setPreviewLoading(true);
      const payloadRules = rules
        .filter((rule) => rule.value !== "")
        .map(({ metric, operator, value }) => ({
          metric,
          operator,
          value,
        }));

      const response = (
        await axios.post(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/campaigns/preview`,
          {
            rules: payloadRules,
            logic,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ).data;
      if (response.success) {
        setAudienceCount(response.data.count);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Unknown error";
      setError("Failed to preview audience size: " + message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!campaignName.trim()) {
      setError("Campaign name is required.");
      return;
    }
    if (rules.some((rule) => rule.value === "")) {
      setError("Please fill in all rule values before creating the campaign.");
      return;
    }
    if (!objective.trim()) {
      setError("Campaign objective is required.");
      return;
    }
    if (createLoading) return;
    try {
      setCreateLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BASE_URL_BACKEND}/campaigns`,
        {
          name: campaignName,
          rules,
          objective,
          logic,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/campaigns", { replace: true });
      setCampaignName("");
      setRules([{ metric: "totalSpend", operator: ">", value: "" }]);
      setObjective("");
      setAudienceCount(0);
      setAiSuggestions([]);
      setSelectedSuggestionIndex(null);
      setLogic("AND");
      setAiError("");
      setError("");
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSuggest = async () => {
    setAiError("");
    setAiSuggestions([]);
    if (!objective.trim()) {
      setAiError("Please enter a campaign objective to get suggestions.");
      return;
    }
    if (aiLoading) return;
    try {
      setAiLoading(true);
      const res = (
        await axios.post(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/ai/suggest`,
          { objective },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ).data;
      setAiSuggestions(res.data.suggestions);
    } catch (e) {
      setAiError(
        "AI failed to suggest: " + (e.response?.data?.error || e.message)
      );
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !token) {
      navigate("/campaigns", { replace: true });
      return;
    }
  }, [isAuthLoading, token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 py-8 px-4">
      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-300 to-orange-300 dark:from-orange-500 dark:to-orange-500 px-8 py-6">
            <h2 className="text-3xl font-bold text-white">Create Campaign</h2>
            <p className="text-orange-100 mt-2">
              Build targeted campaigns with AI-powered suggestions
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-slate-700">
                Campaign Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter a descriptive campaign name"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Audience Segmentation
              </h3>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600">
                  Logic:
                </label>
                <select
                  className="border-2 border-slate-200 px-4 py-2 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white text-slate-900 cursor-pointer"
                  value={logic}
                  onChange={(e) => setLogic(e.target.value)}
                >
                  <option value="AND">AND (All conditions must match)</option>
                  <option value="OR">OR (Any condition can match)</option>
                </select>
              </div>

              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-slate-200"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Metric
                        </label>
                        <select
                          className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 bg-white text-slate-900 cursor-pointer"
                          value={rule.metric}
                          onChange={(e) =>
                            handleRuleChange(index, "metric", e.target.value)
                          }
                        >
                          <option value="totalSpend">Total Spend (₹)</option>
                          <option value="visits">Visits</option>
                          <option value="lastPurchased">Last Purchased</option>
                        </select>
                      </div>

                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Condition
                        </label>
                        <select
                          className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 bg-white text-slate-900 cursor-pointer"
                          value={rule.operator}
                          onChange={(e) =>
                            handleRuleChange(index, "operator", e.target.value)
                          }
                        >
                          <option value=">">&gt; Greater than</option>
                          <option value="<">&lt; Less than</option>
                          <option value="==">= Equal to</option>
                          <option value="<=">&lt;= Less than or equal</option>
                          <option value=">=">
                            &gt;= Greater than or equal
                          </option>
                          <option value="!=">!= Not equal to</option>
                        </select>
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Value
                        </label>
                        <input
                          type={
                            rule.metric === "lastPurchased" ? "date" : "number"
                          }
                          min={0}
                          className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
                          value={rule.value}
                          onChange={(e) =>
                            handleRuleChange(index, "value", e.target.value)
                          }
                          placeholder="Enter value"
                        />
                      </div>

                      {rules.length > 1 && (
                        <button
                          onClick={() => removeRule(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addRule}
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200 cursor-pointer"
              >
                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">
                  +
                </span>
                Add Rule
              </button>
            </div>

            <div className="bg-orange-100 rounded-xl p-6 border border-orange-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-orange-900">
                    Audience Preview
                  </h4>
                  <p className="text-sm text-orange-700">
                    Estimated audience size based on your rules
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-800">
                    {audienceCount !== null
                      ? audienceCount.toLocaleString()
                      : "—"}
                  </div>
                  <div className="text-sm text-orange-600">users</div>
                </div>
              </div>

              <button
                className="w-full sm:w-auto bg-orange-200 hover:bg-orange-300 text-orange-900 border border-orange-400 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={handlePreview}
                disabled={previewLoading}
              >
                {previewLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-900 border-t-transparent rounded-full animate-spin"></div>
                    Calculating...
                  </span>
                ) : (
                  "Preview Audience Size"
                )}
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-slate-700">
                  Campaign Objective
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    (for AI suggestions)
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Increase product sales, Drive website traffic, Boost engagement"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {objective.trim() === "" ? (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 bg-slate-300 text-slate-500 px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-not-allowed
                    "
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Suggest Messages
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={handleSuggest}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Suggest Messages
                      </>
                    )}
                  </button>
                )}
              </div>

              {aiSuggestions.length > 0 && (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
                  <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-violet-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    AI Suggestions
                  </h4>
                  <div className="grid gap-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setObjective(suggestion);
                          setSelectedSuggestionIndex(index);
                        }}
                        className={`cursor-pointer px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                          selectedSuggestionIndex === index
                            ? "bg-violet-100 border-violet-400 text-violet-800"
                            : "bg-white border-slate-200 hover:bg-orange-50 hover:border-orange-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              selectedSuggestionIndex === index
                                ? "bg-violet-500"
                                : "bg-slate-300"
                            }`}
                          ></div>
                          <p className="flex-1">{suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(error || aiError) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-medium text-red-800">Error</h4>
                    <p className="text-red-700 text-sm mt-1">
                      {error || aiError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-200">
              <button
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={handleCreate}
                disabled={createLoading}
              >
                {createLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Campaign...
                  </span>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilder;
