import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/data/useAppStore";

// 15 minutes in milliseconds
const IDLE_TIMEOUT = 15 * 60 * 1000;

const IdleTimer = ({ children }: { children: React.ReactNode }) => {
    const { logout } = useAppStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            handleIdle();
        }, IDLE_TIMEOUT);
    };

    const handleIdle = () => {
        toast.warning("Session Expired", {
            description: "You have been logged out due to inactivity.",
        });

        setTimeout(() => {
            logout();
        }, 1500);
    };

    useEffect(() => {
        // Events to listen for
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, []);

    return <>{children}</>;
};

export default IdleTimer;
