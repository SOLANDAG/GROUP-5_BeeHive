import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setIsAdmin(data.admin === true);
        }
      } catch (error) {
        console.log("Role check error:", error);
      }

      setLoading(false);
    };

    checkRole();
  }, []);

  return { isAdmin, loading };
}