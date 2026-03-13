import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  setDoc,
  addDoc,
  serverTimestamp,
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
  price?: number;
  status: string;
  availableDays?: string[];
  startTime?: string;
  endTime?: string;
  fullName?: string;
  photoURL?: string;
  bio?: string;
};

export default function AdminApplications() {
  const { theme } = useTheme();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

        if (data.admin !== true) {
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

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "providerApplications"),
        where("status", "==", "pending")
      );

      const snap = await getDocs(q);
      const list: Application[] = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();

        let profile: any = {};
        try {
          const userSnap = await getDoc(doc(db, "users", docSnap.id));
          if (userSnap.exists()) {
            profile = userSnap.data();
          }
        } catch (error) {
          console.log("Profile fetch error:", error);
        }

        list.push({
          id: docSnap.id,
          userId: docSnap.id,
          businessName: data.businessName || "",
          category: data.category || "",
          description: data.description || "",
          location: data.location || "",
          price: data.price || 0,
          status: data.status || "pending",
          fullName: profile.fullName || "",
          photoURL: profile.photoURL || "",
          bio: profile.bio || "",
          availableDays: data.availableDays || [],
          startTime: data.startTime || "",
          endTime: data.endTime || "",
        });
      }

      setApplications(list);
    } catch (error) {
      console.log("Fetch applications error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchApplications();
  }, [isAdmin]);

  const approveApplication = async (app: Application) => {
    try {
      await updateDoc(doc(db, "users", app.userId), {
        "roles.provider": true,
        providerStatus: "approved",
      });

      await updateDoc(doc(db, "providerApplications", app.id), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "services", app.userId),
        {
          providerId: app.userId,
          applicationId: app.id,
          businessName: app.businessName,
          category: app.category,
          description: app.description,
          location: app.location || "",
          price: app.price || 0,
          availableDays: app.availableDays || [],
          startTime: app.startTime || "",
          endTime: app.endTime || "",
          isActive: true,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, "notifications"), {
        userId: app.userId,
        title: "Application Approved",
        body: "Your service provider application has been approved.",
        type: "provider_approved",
        isRead: false,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Application approved and service is now live.");
      fetchApplications();
    } catch (error) {
      console.log("Approve error:", error);
      Alert.alert("Error", "Failed to approve application.");
    }
  };

  const rejectApplication = async (app: Application) => {
    try {
      await updateDoc(doc(db, "providerApplications", app.id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", app.userId), {
        providerStatus: "rejected",
      });

      fetchApplications();
    } catch (error) {
      console.log("Reject error:", error);
      Alert.alert("Error", "Failed to reject application.");
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.bg,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

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
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 18,
                padding: 18,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                {item.photoURL ? (
                  <Image
                    source={{ uri: item.photoURL }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginRight: 12,
                    }}
                  />
                ) : null}

                <View style={{ flex: 1 }}>
                  {!!item.fullName && (
                    <Text
                      style={{
                        fontFamily: "Kyiv_600",
                        fontSize: 14,
                        color: theme.colors.text,
                      }}
                    >
                      {item.fullName}
                    </Text>
                  )}

                  {!!item.bio && (
                    <Text
                      style={{
                        fontFamily: "Kyiv_400",
                        color: theme.colors.text,
                        opacity: 0.7,
                      }}
                    >
                      {item.bio}
                    </Text>
                  )}
                </View>
              </View>

              <Text
                style={{
                  fontFamily: "Kyiv_700",
                  fontSize: 17,
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
                Price: ₱{Number(item.price || 0).toLocaleString()}
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

              {item.availableDays && item.availableDays.length > 0 && (
                <Text
                  style={{
                    fontFamily: "Kyiv_400",
                    color: theme.colors.text,
                    marginTop: 6,
                  }}
                >
                  Days: {item.availableDays.join(" | ")}
                </Text>
              )}

              {!!item.startTime && !!item.endTime && (
                <Text
                  style={{
                    fontFamily: "Kyiv_400",
                    color: theme.colors.text,
                    marginTop: 4,
                  }}
                >
                  Time: {item.startTime} - {item.endTime}
                </Text>
              )}

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
                    backgroundColor: "#43A047",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
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
                  <Text style={{ color: "#fff", fontFamily: "Kyiv_600" }}>
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