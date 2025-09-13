import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  FaUpload,
  FaUsers,
  FaShoppingCart,
  FaCode,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronDown,
  FaFileAlt,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";

const DataIngest = () => {
  const [type, setType] = useState("customers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jsonInput, setJsonInput] = useState("[]");
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { token } = useContext(AuthContext);

  const handleTypeChange = (newType) => {
    setError("");
    setType(newType);
    setJsonInput("[]");
  };

  const validateJson = (input) => {
    try {
      const parsed = JSON.parse(input.trim());
      if (!Array.isArray(parsed)) {
        return { valid: false, error: "Data must be a JSON array" };
      }
      if (parsed.length === 0) {
        return { valid: false, error: "Array cannot be empty" };
      }
      return { valid: true, data: parsed };
    } catch (err) {
      return { valid: false, error: "Invalid JSON format" };
    }
  };

  const handleSubmit = async () => {
    setAlertMessage("");
    setError("");
    if (!token) {
      setError("You must be logged in to import data");
      return;
    }
    if (loading) return;
    if (!jsonInput.trim()) {
      setError("Please enter valid JSON data");
      return;
    }

    const validation = validateJson(jsonInput);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError("");
    setAlertMessage("");

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL_BACKEND}/${type}`,
        {
          type: validation.data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setAlertMessage(
        `${validation.data.length} ${type} record(s) ingested successfully`
      );
      setJsonInput("[]");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const schema = {
    customers: [{ name: "John Doe", email: "john@example.com" }],
    orders: [
      {
        email: "john@example.com",
        items: ["item1", "item2"],
        amount: 29.99,
        orderDate: "2025-06-01",
      },
    ],
  };

  const getTypeIcon = (dataType) => {
    return dataType === "customers" ? (
      <FaUsers className="h-4 w-4" />
    ) : (
      <FaShoppingCart className="h-4 w-4" />
    );
  };

  const jsonValidation = validateJson(jsonInput);
  const recordCount = jsonValidation.valid ? jsonValidation.data.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 pt-25">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <FaUpload className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Data Ingestion
              </h1>
              <p className="text-slate-600">
                Import customer and order data into your system
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2 text-slate-800 font-semibold flex items-center gap-2">
            <FaFileAlt />
            Select Data Type
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleTypeChange("customers")}
              className={`cursor-pointer px-4 py-2 rounded font-medium ${
                type === "customers"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              <FaUsers className="inline mr-1" />
              Customers
            </button>
            <button
              onClick={() => handleTypeChange("orders")}
              className={`cursor-pointer px-4 py-2 rounded font-medium ${
                type === "orders"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              <FaShoppingCart className="inline mr-1" />
              Orders
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <button
            onClick={() => setIsSchemaOpen(!isSchemaOpen)}
            className="cursor-pointer flex justify-between items-center w-full text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <FaCode />
              Expected JSON Schema
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                {type}
              </span>
            </div>
            <FaChevronDown
              className={`transition-transform ${
                isSchemaOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isSchemaOpen && (
            <div className="mt-4 bg-orange-900 text-orange-50 p-4 rounded font-mono text-sm">
              <pre className="selection:bg-orange-200 selection:text-gray-600">
                {JSON.stringify(schema[type], null, 2)}
              </pre>
              {type === "orders" && (
                <div className="mt-2 text-orange-200 flex items-center gap-2">
                  <FaInfoCircle />
                  Note: The 'items' field is optional for order records.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              {getTypeIcon(type)}
              JSON Data Input
            </div>
            {jsonValidation.valid && recordCount > 0 && (
              <span className="text-green-600 text-sm flex items-center gap-1">
                <FaCheckCircle />
                {recordCount} record{recordCount !== 1 ? "s" : ""} ready
              </span>
            )}
          </div>
          <textarea
            rows={12}
            className="w-full border border-gray-400 p-3 rounded font-mono text-sm"
            placeholder={`Paste JSON array of ${type}s here`}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setError("");
              setAlertMessage("");
            }}
          />
          {error && (
            <div className="text-red-600 flex items-center gap-2 bg-red-100 p-2 rounded text-sm">
              <FaExclamationCircle />
              {error}
            </div>
          )}
          {alertMessage && (
            <div className="text-green-700 bg-green-100 p-2 rounded text-sm flex items-center gap-2">
              <FaCheckCircle />
              {alertMessage}
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {jsonInput.trim() === "[]" ? (
                "Enter your JSON data to get started"
              ) : jsonValidation.valid ? (
                <span className="text-green-600 flex items-center gap-1">
                  <FaCheckCircle />
                  Ready to import {recordCount} record
                  {recordCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <FaExclamationCircle />
                  Invalid JSON format
                </span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !jsonValidation.valid || recordCount === 0}
              className="disabled:cursor-not-allowed cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FaUpload />
                  Import {type}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-orange-200 rounded-lg flex items-center justify-center">
              <FaInfoCircle className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Import Guidelines
              </h3>
              <ul className="list-disc ml-5 text-sm text-slate-600 mt-1 space-y-1">
                <li>Data must be in valid JSON array format</li>
                <li>Each record should follow the expected schema structure</li>
                <li>Email addresses must be valid and unique for customers</li>
                <li>Order dates should be in YYYY-MM-DD format</li>
                <li>Large datasets may take a few moments to process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIngest;
