import emailjs from "@emailjs/browser";

interface EmailConfig {
    serviceId: string;
    templateId: string;
    publicKey: string;
}

const getConfig = (): EmailConfig => {
    return {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "",
    };
};

export interface EmailTemplateParams {
    to_name: string;
    to_email: string;
    month: string;
    unit: string;
    rent: string;
    electric_usage: string;
    electric_bill: string;
    water_usage: string;
    water_bill: string;
    total_amount: string;
}

export const sendTenantNotification = async (
    params: EmailTemplateParams
): Promise<{ success: boolean; error?: string }> => {
    const config = getConfig();

    console.log("Attempting to send email with config:", {
        serviceId: config.serviceId,
        templateId: config.templateId,
        hasPublicKey: !!config.publicKey,
        payload: params
    });

    if (!config.serviceId || !config.templateId || !config.publicKey) {
        console.error("EmailJS configuration missing. Please check your .env file.");
        return { success: false, error: "Configuration missing" };
    }

    try {
        const response = await emailjs.send(
            config.serviceId,
            config.templateId,
            params as unknown as Record<string, unknown>,
            config.publicKey
        );
        console.log("EmailJS Response:", response);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to send email:", error);
        return { success: false, error: error?.text || error?.message || "Unknown error" };
    }
};
