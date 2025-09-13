import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AiOutlineMail } from "react-icons/ai";
import { MdOutlineShield } from "react-icons/md";
import { FaUsers, FaChartLine, FaCheckCircle, FaBolt } from "react-icons/fa";
import axios from "axios";

const Auth = () => {
  const [loginError, setLoginError] = useState(null);
  const { loggedIn, navigate, setToken, setLoggedIn, setUser } =
    useContext(AuthContext);

  // On successful Google login, exchanging Google's credential for JWT
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = (
        await axios.post(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/auth/google`,
          {
            credentials: credentialResponse.credential,
          },
          { withCredentials: true }
        )
      ).data;
      if (res.success) {
        localStorage.setItem("jwt_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setToken(res.data.token); // Storing JWT for subsequent API calls
        setUser(res.data.user);
        setLoggedIn(true);
        navigate("/");
      }
    } catch (err) {
      setLoginError(
        "Login failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const features = [
    {
      icon: <AiOutlineMail className="text-orange-500" />,
      title: "Email Campaigns",
      description: "Create and manage targeted campaigns",
    },
    {
      icon: <FaUsers className="text-blue-500" />,
      title: "Customer Management",
      description: "Organize and track customer data",
    },
    {
      icon: <FaChartLine className="text-green-500" />,
      title: "Analytics & Insights",
      description: "Track performance and growth",
    },
  ];

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                Manage your customers <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  like a pro
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Streamline your customer relationships, track interactions, and
                grow your business with powerful analytics and automation tools.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-lg border hover:shadow-md transition border-orange-200"
              >
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <MdOutlineShield className="text-green-500" />
              <span className="text-sm text-gray-600">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span className="text-sm text-gray-600">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBolt className="text-orange-500" />
              <span className="text-sm text-gray-600">99.9% Uptime</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen px-4 ml-5">
          <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md text-center space-y-6">
            <div className="text-3xl mb-6">
              <span className="bg-white border px-2 py-3 rounded-xl border-orange-400 shadow">
                &lt;/&gt;
              </span>
            </div>

            <h1 className="text-3xl font-semibold text-gray-800 tracking-wide">
              Welcome to <span className="font-bold">MiniCRM</span>
            </h1>

            <p className="text-gray-500 text-sm -mt-5">
              Access your dashboard and start tracking
            </p>

            {/* Google Login */}
            <div className="w-full">
              <div className="border border-orange-100 rounded-md overflow-hidden hover:bg-orange-50 transition">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLoginError("Google Login Failed")}
                  width="100%"
                />
              </div>
            </div>

            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

            <div className="relative my-6">
              <div className="border-t border-gray-200" />
              <div className="absolute inset-0 flex items-center justify-center -top-3 font-semibold">
                <span className="bg-white px-3 text-gray-500 text-sm translate-y-1">
                  or continue with email
                </span>
              </div>
            </div>

            <button
              className="w-full h-12 border border-orange-100 text-gray-400 rounded hover:bg-orange-50 transition cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled
            >
              <span className="text-lg">
                <AiOutlineMail />
              </span>
              <span>Email login (Coming Soon)</span>
            </button>

            <p className="text-xs text-gray-400 pt-2">
              By signing in, you agree to our{" "}
              <span className="font-bold text-orange-400 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-bold text-orange-400 cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Auth;
