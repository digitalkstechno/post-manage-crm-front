"use client";

import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Role, User, Submission, SubmissionStatus, Company } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface AppContextType {
  role: Role;
  user: User | null;
  submissions: Submission[];
  staffList: any[];
  companies: Company[];
  searchQuery: string;
  authReady: boolean;
  setSearchQuery: (q: string) => void;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  addSubmission: (data: any) => Promise<void>;
  addStaff: (data: any) => Promise<void>;
  addCompany: (name: string) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  resubmit: (id: string, fileLink: string) => Promise<void>;
  postToSocial: (id: string) => Promise<void>;
  updateStatus: (id: string, status: SubmissionStatus, comment?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();

  const PROTECTED = ["/submissions", "/upload", "/directory", "/admin", "/companies"];

  const mapSubmission = (s: any): Submission => ({
    id: s._id,
    title: s.title,
    description: s.description,
    link: s.fileLink,
    company: s.company?.name || s.company || "",
    companyName: s.company?.name || s.company || "",
    uploadAt: s.uploadAt || "",
    status: s.status.toLowerCase() as SubmissionStatus,
    createdAt: s.createdAt,
    staffName: s.submittedBy?.fullName || "Unknown",
    staffEmail: s.submittedBy?.email || "",
    adminComment: s.adminComment || "",
  });

  const fetchStaff = async (token: string) => {
    const res = await fetch(`${API}/staff/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStaffList(Array.isArray(data.data) ? data.data : []);
  };

  const fetchCompanies = async (token: string) => {
    const res = await fetch(`${API}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const list = Array.isArray(data.data) ? data.data : [];
    setCompanies(list.map((c: any) => ({ id: c._id, name: c.name })));
  };

  useEffect(() => {
    const fetchData = async () => {
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

      try {
        const res = await fetch(`${API}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        setSubmissions(list.map(mapSubmission));
        await fetchStaff(token);
        await fetchCompanies(token);
      } catch (err) {
        console.error(err);
      }

      setAuthReady(true);
    };
    fetchData();
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
        };

        localStorage.setItem("token", result.token);
        localStorage.setItem("role", backendRole as string);
        localStorage.setItem("user", JSON.stringify(userData));
        setRole(backendRole);
        setUser(userData);

        const subRes = await fetch(`${API}/submissions`, {
          headers: { Authorization: `Bearer ${result.token}` },
        });
        const subData = await subRes.json();
        const list = Array.isArray(subData.data) ? subData.data : [];
        if (list.length > 0) setSubmissions(list.map(mapSubmission));

        await fetchCompanies(result.token);
        router.push("/submissions");
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
    setSubmissions([]);
    router.replace("/");
  };

  const addSubmission = async (data: any) => {
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
          company: data.company || undefined,
          uploadAt: data.uploadAt || undefined,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setSubmissions((prev) => [mapSubmission(result.data), ...prev]);
        router.push("/submissions");
      } else {
        alert("Submission failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const updateStatus = async (id: string, status: SubmissionStatus, comment?: string) => {
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
    } catch (err) {
      console.error(err);
    }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, adminComment: comment } : s))
    );
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
        const s = result.data;
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, link: s.fileLink, status: "pending", adminComment: "" } : sub
          )
        );
      }
    } catch (err) {
      console.error(err);
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
        setSubmissions((prev) =>
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

  const addCompany = async (name: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/companies/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    const result = await res.json();
    if (result.success) await fetchCompanies(token!);
    else alert(result.message);
  };

  const deleteCompany = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/companies/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const addStaff = async (data: any) => {
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
    if (result.data?._id) await fetchStaff(token!);
  };

  return (
    <AppContext.Provider
      value={{
        role, user, submissions, staffList, companies,
        login, logout, addSubmission, addStaff, addCompany, deleteCompany,
        resubmit, postToSocial, updateStatus, searchQuery, setSearchQuery, authReady,
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
