import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useRole() {
  const [roles, setRoles] = useState({
    customer: true,
    provider: false,
  });

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();

          setRoles({
            customer: data?.roles?.customer ?? true,
            provider: data?.roles?.provider ?? false,
          });
        }
      } catch (error) {
        console.log("Role fetch error:", error);
      }
    };

    fetchRole();
  }, []);

  return { roles };
}