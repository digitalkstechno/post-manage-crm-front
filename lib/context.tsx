"use client";

import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Role, User, Submission, SubmissionStatus } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AppContextType {
  role: Role;
  user: User | null;
  submissions: Submission[];
  staffList: any[];
  companies: any[];
  searchQuery: string;
  authReady: boolean;
  setSearchQuery: (q: string) => void;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  addSubmission: (data: any) => Promise<void>;
  addStaff: (data: any) => Promise<void>;
  addCompany: (name: string) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  postToSocial: (id: string) => Promise<void>;
  updateStatus: (
    id: string,
    status: SubmissionStatus,
    comment?: string,
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const PROTECTED = ['/submissions', '/upload', '/directory', '/admin'];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const savedRole = localStorage.getItem("role") as Role;
      const savedUser = localStorage.getItem("user");

      if (!token || !savedRole) {
        setAuthReady(true);
        // Agar protected page pe hai toh / pe bhejo
        if (PROTECTED.some(p => window.location.pathname.startsWith(p))) {
          router.replace('/');
        }
        return;
      }

      setRole(savedRole);
      if (savedUser) setUser(JSON.parse(savedUser));

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        const mapped = list.map((s: any) => ({
          id: s._id,
          title: s.title,
          description: s.description,
          link: s.fileLink,
          status: s.status.toLowerCase(),
          createdAt: s.createdAt,
          staffName: s.submittedBy?.fullName || "Unknown",
          staffEmail: s.submittedBy?.email || "",
          adminComment: s.adminComment || "",
        }));
        setSubmissions(mapped);
        await fetchStaff();
        await fetchCompanies();
      } catch (err) {
        console.error(err);
      }

      setAuthReady(true);
    };
    fetchData();
  }, []);
  const fetchStaff = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    const list = Array.isArray(data.data) ? data.data : [];
    setStaffList(list);
  };

  const fetchCompanies = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/`);
    const data = await res.json();
    setCompanies(Array.isArray(data.data) ? data.data : []);
  };

  const login = async (email: string, password: string, selectedRole: Role) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();

      if (result.status === "Success") {
        const backendRole = result.data.role as Role;

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

        // Submissions fetch
        const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
          headers: { Authorization: `Bearer ${result.token}` },
        });
        const subData = await subRes.json();
        const list = Array.isArray(subData.data) ? subData.data : [];
        if (list.length > 0) {
          const mapped = list.map((s: any) => ({
            id: s._id,
            title: s.title,
            description: s.description,
            link: s.fileLink,
            status: s.status.toLowerCase(),
            createdAt: s.createdAt,
            staffName: s.submittedBy?.fullName || "Unknown",
            staffEmail: s.submittedBy?.email || "",
            adminComment: s.adminComment || "",
          }));
          setSubmissions(mapped);
        }

        // Role based redirect
        if (backendRole === "admin") {
          router.push("/submissions");
        } else {
          router.push("/submissions");
        }
      } else {
        toast.error(result.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
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
    if (!token) {
      toast.error("Please login first");
      router.push("/");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("fileLink", data.link || "");
    formData.append("company", data.company || "");
    if (data.atFile) formData.append("atFile", data.atFile);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    console.log("Add submission result:", result);

    if (result.success && result.data) {
      const s = result.data;
      const mapped = {
        id: s._id,
        title: s.title,
        description: s.description,
        link: s.fileLink,
        status: s.status.toLowerCase(),
        createdAt: s.createdAt,
        staffName: s.submittedBy?.fullName || user?.name || "Unknown",
        staffEmail: s.submittedBy?.email || user?.email || "",
      };
      setSubmissions((prev) => [mapped, ...prev]); // ✅ list ma add thase
      router.push("/submissions"); // ✅ submit pachhi redirect
    } else {
      toast.error(result.message || "Submission failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong!");
  }
};
  const postToSocial = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${id}/post-social`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      setSubmissions((prev) =>
        prev.map((s) => s.id === id ? { ...s, postedToSocial: true, socialPostedAt: result.data.socialPostedAt } : s)
      );
    } else {
      toast.error(result.message || "Failed to post");
    }
  };

  const updateStatus = async (
    id: string,
    status: SubmissionStatus,
    comment?: string,
  ) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: status.toUpperCase(),
          adminComment: comment,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, adminComment: comment } : s,
      ),
    );
  };

  const addStaff = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.data?._id) {
      await fetchStaff();
    }
  };

  const addCompany = async (name: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    const result = await res.json();
    if (result.success) await fetchCompanies();
    else toast.error(result.message);
  };

  const deleteCompany = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchCompanies();
  };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        submissions,
        staffList,
        companies,
        login,
        logout,
        addSubmission,
        addStaff,
        addCompany,
        deleteCompany,
        postToSocial,
        updateStatus,
        searchQuery,
        setSearchQuery,
        authReady,
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
