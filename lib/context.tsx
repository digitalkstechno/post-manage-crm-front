"use client";

import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Role, User, Submission, SubmissionStatus } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AppContextType {
  role: Role;
  user: User | null;
  submissions: Submission[];
  staffList: any[];
  searchQuery: string;
  authReady: boolean;
  setSearchQuery: (q: string) => void;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  addSubmission: (data: any) => Promise<void>;
  addStaff: (data: any) => Promise<void>;
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
        const res = await fetch("http://localhost:5001/api/submissions", {
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
      } catch (err) {
        console.error(err);
      }

      setAuthReady(true);
    };
    fetchData();
  }, []);
  const fetchStaff = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5001/api/staff/", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    const list = Array.isArray(data.data) ? data.data : [];
    setStaffList(list);
  };

  const login = async (email: string, password: string, selectedRole: Role) => {
    try {
      const res = await fetch("http://localhost:5001/api/staff/login", {
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
        const subRes = await fetch("http://localhost:5001/api/submissions", {
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
          router.push("/submissions"); // admin - same submissions page, approve/reject buttons auto show thase
        } else {
          router.push("/submissions"); // staff - same page, limited view
        }
      } else {
        alert("Login failed: " + result.message);
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
      alert("Please login first");
      router.push("/");
      return;
    }

    const res = await fetch("http://localhost:5001/api/submissions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        fileLink: data.link,
      }),
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
      alert("Submission failed: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  }
};
  const updateStatus = async (
    id: string,
    status: SubmissionStatus,
    comment?: string,
  ) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5001/api/submissions/${id}`, {
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
    const res = await fetch("http://localhost:5001/api/staff/create", {
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

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        submissions,
        staffList,
        login,
        logout,
        addSubmission,
        addStaff,
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
