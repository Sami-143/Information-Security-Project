import React, { useEffect, useState } from "react";
import adminApi from "../../Api/adminApi";
import { toast } from "react-toastify";
import { logout } from '../../Redux/authSlice';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    navigate("/signin", { replace: true });
  };

  const generateChartData = () => {
    const verified = users.filter(u => u.is_verified).length;
    const unverified = users.length - verified;
    const roles = [...new Set(users.map(u => u.role))];

    const roleData = roles.map(role => ({
      name: role,
      count: users.filter(u => u.role === role).length,
    }));

    return {
      verification: [
        { name: "Verified", count: verified },
        { name: "Unverified", count: unverified },
      ],
      roles: roleData,
    };
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getAllUsers();
        setUsers(data);
      } catch (err) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const chartData = generateChartData();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold text-[#c9d1d9]">Admin Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </div>

      {/* Stats & Charts */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#161b22] p-6 rounded-xl shadow border border-[#30363d]">
            <h2 className="text-xl font-bold mb-4 text-[#58a6ff]">Verification Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.verification}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="name" stroke="#c9d1d9" />
                <YAxis stroke="#c9d1d9" />
                <Tooltip />
                <Bar dataKey="count" fill="#3fb950" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#161b22] p-6 rounded-xl shadow border border-[#30363d]">
            <h2 className="text-xl font-bold mb-4 text-[#58a6ff]">Users by Role</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.roles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="name" stroke="#c9d1d9" />
                <YAxis stroke="#c9d1d9" />
                <Tooltip />
                <Bar dataKey="count" fill="#f85149" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#161b22] rounded-xl shadow border border-[#30363d] overflow-x-auto">
        {loading ? (
          <p className="p-6 text-[#8b949e]">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-[#8b949e]">No users found.</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[#21262d] text-[#c9d1d9] text-left">
              <tr>
                <th className="py-3 px-6 border-b border-[#30363d]">Name</th>
                <th className="py-3 px-6 border-b border-[#30363d]">Email</th>
                <th className="py-3 px-6 border-b border-[#30363d]">Verified</th>
                <th className="py-3 px-6 border-b border-[#30363d]">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#21262d] transition">
                  <td className="py-3 px-6 border-b border-[#30363d]">{user.name}</td>
                  <td className="py-3 px-6 border-b border-[#30363d]">{user.email}</td>
                  <td className="py-3 px-6 border-b border-[#30363d]">
                    {user.is_verified ? (
                      <span className="text-green-400 font-semibold">✅ Yes</span>
                    ) : (
                      <span className="text-red-400 font-semibold">❌ No</span>
                    )}
                  </td>
                  <td className="py-3 px-6 border-b border-[#30363d] capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
