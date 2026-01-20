import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useUserSync() {
    const { user, isLoaded } = useUser();
    const syncUser = useMutation(api.users.create);
    const existingUser = useQuery(api.users.getByClerkId, 
        user ? { clerkId: user.id } : "skip"
    );

    useEffect(() => {
        console.log("User Sync State:", { isLoaded, hasUser: !!user, existingUser });
        if (isLoaded && user && existingUser === null) {
            console.log("Syncing new user to Convex...");
            void syncUser({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || "",
                name: user.fullName || user.firstName || "Anonymous",
                role: "learner",
            });
        }
    }, [isLoaded, user, existingUser, syncUser]);

    return { 
        dbUser: existingUser,
        isSyncing: isLoaded && user && existingUser === undefined 
    };
}
