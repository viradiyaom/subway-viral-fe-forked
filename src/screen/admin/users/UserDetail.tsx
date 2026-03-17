import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../../config/apiCall";
import {
  User as UserIcon,
  Mail,
  Shield,
  MapPin,
  Edit,
  Power,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";

interface User {
  _id: string;
  name: string;
  email: string;
  role_id: {
    _id: string;
    name: string;
    permissions: any;
  };
  assigned_shop_ids: string[];
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      usersApi
        .getById(id)
        .then((res) => setUser(res.data.data.user))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500">User not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate(ROUTES.ADMIN.USERS.LIST)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Personnel
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.ADMIN.USERS.LIST)}
          className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Directory
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.USERS.EDIT(user._id))}
          >
            <Edit size={16} className="mr-2" /> Update User
          </Button>
          <Button variant="danger" size="sm">
            <Power size={16} className="mr-2" /> Deactivate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-slate-300 mb-4 overflow-hidden">
              <UserIcon size={48} />
            </div>
            <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-primary-100 text-primary-700 mt-1">
              {user.role_id.name}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span className="text-xs truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Shield size={16} className="text-primary-500" />
              Role Permissions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(user.role_id.permissions).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="text-xs text-slate-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${value ? "bg-success-500" : "bg-slate-300"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <MapPin size={16} className="text-accent-500" />
              Assigned Shops
            </h3>
            {user.assigned_shop_ids.length > 0 ? (
              <div className="space-y-2">
                {user.assigned_shop_ids.map((shopId) => (
                  <div
                    key={shopId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 flex items-center justify-between"
                  >
                    Shop ID: {shopId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() =>
                        navigate(ROUTES.ADMIN.SHOPS.DETAILS(shopId))
                      }
                    >
                      View Shop
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 italic">
                  No shops assigned to this user.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
