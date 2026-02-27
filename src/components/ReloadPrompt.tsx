import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from "./ui/button"
import {
    Toast,
    ToastAction,
    ToastDescription,
    ToastTitle,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export function ReloadPrompt() {
    const { toast } = useToast()

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    useEffect(() => {
        if (offlineReady) {
            toast({
                title: "App ready for offline use",
                description: "You can now use this application without an internet connection.",
                duration: 5000,
            })
        }

        if (needRefresh) {
            toast({
                title: "New version available",
                description: "Please reload to update the application.",
                action: (
                    <ToastAction altText="Reload App" onClick={() => updateServiceWorker(true)}>
                        Reload
                    </ToastAction>
                ),
                duration: Infinity,
            })
        }
    }, [offlineReady, needRefresh, toast, updateServiceWorker])

    return null
}
