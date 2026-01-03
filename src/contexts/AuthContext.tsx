import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

type AppRole = "admin" | "employee" | "intern";

interface AuthContextType {
  session: Session | null;
  userRole: AppRole | null;
  userName: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        setIsLoading(true);
        // Defer Supabase calls to avoid auth deadlocks
        setTimeout(() => {
          fetchUserData(session.user.id, session.user.email);
        }, 0);
      } else {
        setUserRole(null);
        setUserName("");
        setIsLoading(false);
      }
    });

    // THEN check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setIsLoading(true);
        setTimeout(() => {
          fetchUserData(session.user.id, session.user.email);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, fallbackEmail?: string | null) => {
    try {
      // Get user role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      if (roles && roles.length > 0) {
        setUserRole(roles[0].role as AppRole);
      } else {
        setUserRole(null);
      }

      // Get user name from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      setUserName(profile?.full_name || fallbackEmail || "User");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserRole(null);
      setUserName("");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    setUserName("");
  };

  const refreshAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchUserData(session.user.id, session.user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        userRole,
        userName,
        isLoading,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
