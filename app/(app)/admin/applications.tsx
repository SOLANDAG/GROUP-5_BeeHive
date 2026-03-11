import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { router } from "expo-router";

type Application = {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  location?: string;
  status: string;
};

export default function AdminApplications() {
  const { theme } = useTheme();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ================================
  // CHECK ADMIN
  // ================================
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/(app)/home");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
          router.replace("/(app)/home");
          return;
        }

        const data = snap.data();

        if (!data.admin) {
          router.replace("/(app)/home");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.log("Admin check error:", error);
        router.replace("/(app)/home");
      }
    };

    checkAdmin();
  }, []);

  // ================================
  // FETCH APPLICATIONS
  // ================================
  const fetchApplications = async () => {
    try {
      const q = query(
        collection(db, "providerApplications"),
        where("status", "==", "pending")
      );

      const snap = await getDocs(q);

      const list: Application[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();

        list.push({
          id: docSnap.id,
          userId: data.userId,
          businessName: data.businessName,
          category: data.category,
          description: data.description,
          location: data.location,
          status: data.status,
        });
      });

      setApplications(list);
    } catch (error) {
      console.log("Fetch applications error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  // ================================
  // APPROVE
  // ================================
  const approveApplication = async (app: Application) => {
    try {
      await updateDoc(doc(db, "users", app.userId), {
        "roles.provider": true,
        providerStatus: "approved",
      });

      await updateDoc(doc(db, "providerApplications", app.id), {
        status: "approved",
      });

      fetchApplications();
    } catch (error) {
      console.log("Approve error:", error);
    }
  };

  // ================================
  // REJECT
  // ================================
  const rejectApplication = async (app: Application) => {
    try {
      await updateDoc(doc(db, "providerApplications", app.id), {
        status: "rejected",
      });

      fetchApplications();
    } catch (error) {
      console.log("Reject error:", error);
    }
  };

  // ================================
  // NOT ADMIN
  // ================================
  if (!isAdmin) return null;

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  // ================================
  // SCREEN
  // ================================
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "Kyiv_700",
          fontSize: 24,
          marginBottom: 20,
          color: theme.colors.text,
        }}
      >
        Provider Applications
      </Text>

      {applications.length === 0 ? (
        <Text
          style={{
            fontFamily: "Kyiv_400",
            color: theme.colors.text,
            opacity: 0.6,
          }}
        >
          No pending applications.
        </Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: theme.colors.card,
                padding: 16,
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "Kyiv_600",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                {item.businessName}
              </Text>

              <Text
                style={{
                  fontFamily: "Kyiv_400",
                  color: theme.colors.text,
                  marginTop: 4,
                }}
              >
                Category: {item.category}
              </Text>

              <Text
                style={{
                  fontFamily: "Kyiv_400",
                  color: theme.colors.text,
                  marginTop: 4,
                }}
              >
                {item.description}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 12,
                  gap: 10,
                }}
              >
                <Pressable
                  onPress={() => approveApplication(item)}
                  style={{
                    backgroundColor: "#4CAF50",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "Kyiv_600",
                    }}
                  >
                    Approve
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => rejectApplication(item)}
                  style={{
                    backgroundColor: "#E53935",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "Kyiv_600",
                    }}
                  >
                    Reject
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}