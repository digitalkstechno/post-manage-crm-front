"use client";

import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Role, User, Post, PostStatus, Company, PaginationData } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface PostStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  rework: number;
}

interface AdminDashboardStats {
  totalPosts: number;
  thisMonthPosts: number;
  totalApproved: number;
  totalRejected: number;
  thisMonthApproved: number;
  thisMonthRejected: number;
  lastMonthApproved: number;
  lastMonthRejected: number;
}

interface AppContextType {
  role: Role;
  user: User | null;
  posts: Post[];
  postPagination: PaginationData | null;
  postStats: PostStats;
  adminStats: AdminDashboardStats;
  staffList: any[];
  staffPagination: PaginationData | null;
  companies: Company[];
  companyPagination: PaginationData | null;
  searchQuery: string;
  authReady: boolean;
  isLoading: boolean;
  setSearchQuery: (q: string) => void;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  fetchPosts: (page?: number, limit?: number, search?: string, status?: string) => Promise<void>;
  fetchPostStats: () => Promise<void>;
  fetchAdminStats: () => Promise<void>;
  fetchStaff: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchCompanies: (page?: number, limit?: number, search?: string) => Promise<void>;
  getCompanyDropdown: () => Promise<any[]>;
  getStaffDropdown: () => Promise<any[]>;
  addPost: (data: any) => Promise<void>;
  addStaff: (data: any) => Promise<void>;
  updateStaff: (id: string, data: any) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  addCompany: (data: Partial<Company>) => Promise<void>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  resubmit: (id: string, fileLink: string) => Promise<void>;
  postToSocial: (id: string) => Promise<void>;
  updateStatus: (id: string, status: PostStatus, comment?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postPagination, setPostPagination] = useState<PaginationData | null>(null);
  const [postStats, setPostStats] = useState<PostStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    rework: 0
  });
  const [adminStats, setAdminStats] = useState<AdminDashboardStats>({
    totalPosts: 0,
    thisMonthPosts: 0,
    totalApproved: 0,
    totalRejected: 0,
    thisMonthApproved: 0,
    thisMonthRejected: 0,
    lastMonthApproved: 0,
    lastMonthRejected: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffPagination, setStaffPagination] = useState<PaginationData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPagination, setCompanyPagination] = useState<PaginationData | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const PROTECTED = ["/posts", "/add-post", "/directory", "/admin", "/companies"];

  const mapPost = (s: any): Post => ({
    id: s._id,
    title: s.title,
    description: s.description,
    link: s.fileLink,
    companyId: s.company?._id || s.company || "",
    companyName: s.company?.name || "N/A",
    uploadAt: s.uploadAt || "",
    status: s.status.toLowerCase() as PostStatus,
    createdAt: s.createdAt,
    staffName: s.submittedBy?.fullName || "Unknown",
    staffEmail: s.submittedBy?.email || "",
    adminComment: s.adminComment || "",
    postedToSocial: s.postedToSocial || false,
  });

  const fetchStaff = useCallback(async (page = 1, limit = 10, search = "") => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/staff/?page=${page}&limit=${limit}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStaffList(Array.isArray(data.data) ? data.data : []);
      if (data.pagination) setStaffPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async (page = 1, limit = 10, search = "") => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/companies?page=${page}&limit=${limit}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setCompanies(list.map((c: any) => ({
        id: c._id,
        name: c.name,
        facebook: c.facebook,
        instagram: c.instagram,
        googleMyBusiness: c.googleMyBusiness,
        category: c.category
      })));
      if (data.pagination) setCompanyPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPostStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/submissions/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setPostStats(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchAdminStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/submissions/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setAdminStats(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPosts = useCallback(async (page = 1, limit = 10, search = "", status = "") => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      let url = `${API}/submissions?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status.toUpperCase()}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setPosts(list.map(mapPost));
      if (data.pagination) setPostPagination(data.pagination);
      
      fetchPostStats();
      if (role === 'admin' || role === 'hr') fetchAdminStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPostStats, fetchAdminStats, role]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedRole = localStorage.getItem("role") as Role;
      const savedUser = localStorage.getItem("user");

      if (!token || !savedRole) {
        setAuthReady(true);
        if (PROTECTED.some((p) => window.location.pathname.startsWith(p))) {
          router.replace("/");
        }
        return;
      }

      setRole(savedRole);
      if (savedUser) setUser(JSON.parse(savedUser));
      setAuthReady(true);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, selectedRole: Role) => {
    try {
      const res = await fetch(`${API}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();

      if (result.status === "Success") {
        const backendRole = (
          typeof result.data.role === "object"
            ? result.data.role?.roleName
            : result.data.role
        ) as Role;

        const userData = {
          id: result.data._id,
          name: result.data.fullName,
          email: result.data.email,
          role: backendRole,
          assignedCompanies: result.data.assignedCompanies || [],
        };

        localStorage.setItem("token", result.token);
        localStorage.setItem("role", backendRole as string);
        localStorage.setItem("user", JSON.stringify(userData));
        setRole(backendRole);
        setUser(userData);

        await Promise.all([
          fetchPosts(1, 10),
          fetchStaff(1, 10),
          fetchCompanies(1, 10),
          fetchPostStats()
        ]);
        
        if (backendRole === 'admin' || backendRole === 'hr') fetchAdminStats();

        router.push("/posts");
      } else {
        toast.error(result.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Cannot connect to server. Please make sure the backend is running.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setRole(null);
    setUser(null);
    setPosts([]);
    setStaffList([]);
    setCompanies([]);
    router.replace("/");
  };

  const addPost = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/"); return; }

      const res = await fetch(`${API}/submissions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          fileLink: data.link,
          company: data.companyId, // Sending ID now
          uploadAt: data.uploadAt || undefined,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        toast.success("Post added successfully");
        await fetchPosts(1, 10);
        await fetchPostStats();
        if (role === 'admin') fetchAdminStats();
        router.push("/posts");
      } else {
        toast.error("Post failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const updateStatus = async (id: string, status: PostStatus, comment?: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/submissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: (status as string).toUpperCase(),
          adminComment: comment,
        }),
      });
      toast.success("Status updated");
      setPosts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status, adminComment: comment } : s))
      );
      fetchPostStats();
      if (role === 'admin') fetchAdminStats();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const resubmit = async (id: string, fileLink: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/submissions/${id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileLink }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        toast.success("Resubmitted successfully");
        const s = result.data;
        setPosts((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, link: s.fileLink, status: "pending", adminComment: "" } : sub
          )
        );
        fetchPostStats();
        if (role === 'admin') fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to resubmit");
    }
  };

  const postToSocial = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/submissions/${id}/post-social`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Posted to social successfully");
        setPosts((prev) =>
          prev.map((s) => s.id === id ? { ...s, postedToSocial: true } : s)
        );
      } else {
        toast.error(result.message || "Failed to post");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const addCompany = async (data: Partial<Company>) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/companies/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Company added successfully");
        await fetchCompanies(1, 10);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add company");
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Company updated successfully");
        await fetchCompanies(companyPagination?.page || 1, 10);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update company");
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/companies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Company deleted successfully");
        setCompanies((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addStaff = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/staff/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.status === "Success") {
        toast.success("Staff added successfully");
        await fetchStaff(1, 10);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStaff = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/staff/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.status === "Success") {
        toast.success("Staff updated successfully");
        await fetchStaff(staffPagination?.page || 1, 10);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update staff");
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.status === "Success") {
        toast.success("Staff deleted successfully");
        setStaffList((prev) => prev.filter((s) => (s._id || s.id) !== id));
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete staff");
    }
  };

  const getCompanyDropdown = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/companies/dropdown`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      return result.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const getStaffDropdown = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/staff/dropdown`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      return result.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };


  return (
    <AppContext.Provider
      value={{
        role, user, posts, postPagination, postStats, adminStats, staffList, staffPagination, 
        companies, companyPagination, isLoading,
        login, logout, fetchPosts, fetchPostStats, fetchAdminStats, fetchStaff, fetchCompanies,
        addPost, addStaff, updateStaff, deleteStaff, addCompany, updateCompany, deleteCompany,
        resubmit, postToSocial, updateStatus, searchQuery, setSearchQuery, authReady,
        getCompanyDropdown, getStaffDropdown
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
