import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRoles = {
  customer: boolean;
  provider: boolean;
  admin: boolean;
};

export type ModeType = "customer" | "provider";

type RoleContextValue = {
  loading: boolean;
  uid: string | null;
  roles: UserRoles;
  currentMode: ModeType;
  setCurrentMode: (mode: ModeType) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const DEFAULT_ROLES: UserRoles = {
  customer: true,
  provider: false,
  admin: false,
};

export function RoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [roles, setRoles] =
    useState<UserRoles>(DEFAULT_ROLES);
  const [currentMode, setCurrentModeState] =
    useState<ModeType>("customer");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setRoles(DEFAULT_ROLES);
        setCurrentModeState("customer");
        setLoading(false);
        return;
      }

      setUid(user.uid);

      try {
        const snap = await getDoc(
          doc(db, "users", user.uid)
        );
        const data = (snap.data() ?? {}) as any;

        const nextRoles: UserRoles = {
          customer: Boolean(data?.roles?.customer ?? true),
          provider: Boolean(data?.roles?.provider ?? false),
          admin: Boolean(data?.roles?.admin ?? false),
        };

        setRoles(nextRoles);

        // Load currentMode
        if (
          data?.currentMode === "provider" &&
          nextRoles.provider
        ) {
          setCurrentModeState("provider");
        } else {
          setCurrentModeState("customer");
        }
      } catch {
        setRoles(DEFAULT_ROLES);
        setCurrentModeState("customer");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const setCurrentMode = async (mode: ModeType) => {
    if (!uid) return;

    setCurrentModeState(mode);

    try {
      await updateDoc(doc(db, "users", uid), {
        currentMode: mode,
      });
    } catch {
      // fail silently
    }
  };

  const value = useMemo<RoleContextValue>(
    () => ({
      loading,
      uid,
      roles,
      currentMode,
      setCurrentMode,
    }),
    [loading, uid, roles, currentMode]
  );

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx)
    throw new Error(
      "useRoleContext must be used within RoleProvider"
    );
  return ctx;
}
