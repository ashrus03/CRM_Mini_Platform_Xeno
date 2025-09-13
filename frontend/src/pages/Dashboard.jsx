import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaUpload,
  FaUsers,
  FaBolt,
  FaEnvelope,
  FaChartBar,
  FaBullseye,
  FaMagic,
  FaChartLine,
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pt-20">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="inline-flex items-center border border-orange-200 text-orange-700 bg-orange-50 px-4 py-2 rounded-full text-sm font-medium">
                <FaMagic className="mr-2" />
                Customer Management Platform
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-slate-800">
                Manage Smarter.
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Track. Connect.
                  <br />
                  Accelerate
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Keep your customer and order data in check, and focus on
                building strong relationships that drive growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/campaigns">
                <button className="cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg transition-all duration-300 group px-8 py-4 rounded-lg text-lg flex items-center">
                  <FaEnvelope className="mr-2" />
                  Launch Campaigns
                  <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link to="/ingest">
                <button className="cursor-pointer border border-orange-200 hover:bg-orange-50 transition-all duration-300 group px-8 py-4 rounded-lg text-lg flex items-center bg-white">
                  <FaUpload className="mr-2" />
                  Import Data
                  <FaBolt className="ml-2 text-orange-500 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 -ml-18">
              {[
                { value: "10K+", label: "Customers" },
                { value: "95%", label: "Delivery Rate" },
                { value: "24/7", label: "Support" },
              ].map((item, i) => (
                <div className="text-center" key={i}>
                  <div className="text-2xl font-bold text-slate-800">
                    {item.value}
                  </div>
                  <div className="text-sm text-slate-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden shadow-2xl rounded-xl">
              <div className="relative">
                <img
                  src="/hero1.jpeg"
                  alt="Dashboard Analytics"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute" />
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">
                  Growth Rate
                </div>
                <div className="text-lg font-bold text-green-600">+24%</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <FaBullseye className="text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">
                  Conversion
                </div>
                <div className="text-lg font-bold text-blue-600">89.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Powerful tools and insights to help you manage customers, track
            performance, and grow your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaEnvelope className="h-8 w-8 text-white" />,
              title: "Email Campaigns",
              text: "Create and send targeted email campaigns to engage your customers and drive conversions.",
              color: "from-orange-400 to-amber-500",
            },
            {
              icon: <FaChartBar className="h-8 w-8 text-white" />,
              title: "Analytics & Insights",
              text: "Track performance metrics and gain valuable insights to optimize your marketing strategies.",
              color: "from-blue-400 to-blue-500",
            },
            {
              icon: <FaUsers className="h-8 w-8 text-white" />,
              title: "Customer Management",
              text: "Organize and manage your customer data with powerful tools for segmentation and targeting.",
              color: "from-green-400 to-emerald-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 text-center shadow-lg rounded-lg bg-gradient-to-br from-white to-orange-50/30 backdrop-blur hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`h-16 w-16 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-6`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
