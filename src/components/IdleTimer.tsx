import { useEffect, useRef } from "react";
import { logout } from "@/data/store";
import { toast } from "sonner";

// 15 minutes in milliseconds
const IDLE_TIMEOUT = 15 * 60 * 1000;

const IdleTimer = ({ children }: { children: React.ReactNode }) => {
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
        logout();
        toast.warning("Session Expired", {
            description: "You have been logged out due to inactivity.",
        });
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
