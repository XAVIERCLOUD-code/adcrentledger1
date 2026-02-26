import { useState } from "react";
// Temporarily mock login here since auth isn't fully set up with Supabase yet.
const mockLogin = (user: string, pass: string) => {
    if (user === 'Isobel' && pass === 'venus_tinker') {
        localStorage.setItem('adc_user_v2', JSON.stringify({ id: '1', name: 'Isobel', role: 'admin' }));
        localStorage.setItem('adc_auth_token_v2', 'mock-jwt-token-admin');
        window.dispatchEvent(new Event('storage'));
        return true;
    }
    if (user === 'Avelinda' && pass === 'Richlind') {
        localStorage.setItem('adc_user_v2', JSON.stringify({ id: '2', name: 'Avelinda', role: 'viewer' }));
        localStorage.setItem('adc_auth_token_v2', 'mock-jwt-token-viewer');
        window.dispatchEvent(new Event('storage'));
        return true;
    }
    return false;
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            if (mockLogin(username, password)) {
                toast.success("Welcome back!", { duration: 2000 });
                window.location.href = "/";
            } else {
                toast.error("Invalid credentials", { description: "Please check your username and password." });
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans flex items-center justify-center">
            {/* Subtle Premium Tech Dot Pattern Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-[0.15] dark:opacity-[0.2] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            ></div>

            {/* Radial Gradient Mask to softly fade out the pattern towards the edges */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_800px_at_50%_50%,transparent_0%,hsl(var(--background))_100%)]"></div>

            {/* Animated Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse pointer-events-none z-0" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/40 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse pointer-events-none z-0" style={{ animationDuration: '10s' }}></div>
            <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-pulse pointer-events-none z-0" style={{ animationDuration: '12s' }}></div>

            {/* Main Content Area */}
            <div className="relative w-full z-10 mx-auto max-w-6xl px-4 py-8 animate-fade-in flex items-center justify-center">

                {/* Glass Window Container */}
                <div className="w-full max-w-[1000px] min-h-[550px] bg-background/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/10 dark:border-white/5 relative flex flex-col md:flex-row overflow-hidden">

                    {/* Inner subtle border glow */}
                    <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

                    {/* --- Left Primary Side (Glassy Gradient) --- */}
                    <div className="w-full md:w-[45%] h-64 md:h-auto relative flex items-center justify-center p-6 shrink-0 z-0 overflow-hidden bg-gradient-to-br from-primary/80 to-primary/30 backdrop-blur-md border-r border-white/10">
                        {/* Abstract shapes in the background of blue side */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
                            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-2xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0,transparent_60%)]" />
                        </div>

                        {/* ADC Logo Concept */}
                        <div className="relative z-10 flex flex-col items-center justify-center p-2">
                            <div className="relative w-56 h-56 md:w-[280px] md:h-[280px] flex items-center justify-center">

                                {/* Rotating Outer Text Ring */}
                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-white/90 drop-shadow-md animate-[spin_20s_linear_infinite] pointer-events-none z-0">
                                    <path id="circle-text-path" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                                    <text className="text-[8px] font-black uppercase tracking-[0.3em]" fill="currentColor">
                                        <textPath href="#circle-text-path" startOffset="0%" textLength="219" lengthAdjust="spacing">
                                            ADC LEASING ★ ADC LEASING ★
                                        </textPath>
                                    </text>
                                </svg>

                                {/* Inner Logo Circle */}
                                <div className="w-36 h-36 md:w-48 md:h-48 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center justify-center border-[2px] border-white/40 relative overflow-hidden group hover:scale-[1.05] transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.2)] z-10">
                                    {/* Inner subtle glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent"></div>

                                    <img src="/favicon.ico" alt="ADC Logo" className="w-[65%] h-[65%] object-cover rounded-full relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" />

                                    <div className="absolute bottom-4 md:bottom-6 w-full text-center z-10">
                                        <span className="text-sm md:text-lg font-extrabold tracking-widest text-primary px-4 py-0.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg">ADC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Transparent Side --- */}
                    <div className="w-full md:w-[55%] h-full bg-transparent z-10 transition-all duration-300">
                        <div className="w-full h-full flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 pt-10 pb-8 relative">

                            <div className="mb-10 text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">Welcome Back</h2>
                                <p className="text-muted-foreground text-sm font-medium">Sign in to your account to continue</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/90 ml-1 block">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                        <Input
                                            placeholder="Enter your username"
                                            className="pl-12 py-6 bg-white/5 dark:bg-black/10 border-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl w-full transition-all text-foreground font-medium placeholder:text-muted-foreground/50 shadow-inner backdrop-blur-sm"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/90 ml-1 block">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            className="pl-12 py-6 bg-white/5 dark:bg-black/10 border-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl w-full transition-all text-foreground font-medium placeholder:text-muted-foreground/50 shadow-inner backdrop-blur-sm"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-white/20 group-hover:border-primary/70 transition-colors bg-white/5">
                                            <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                                            <div className="w-full h-full bg-primary rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground/70 font-medium group-hover:text-foreground transition-colors">Remember me</span>
                                    </label>
                                    <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 mt-6 font-bold text-base rounded-xl shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : "Sign In"}
                                </Button>
                            </form>

                            <div className="mt-10 flex flex-col items-center">
                                {/* Removed Demo Login Info */}

                                <div className="text-center mt-6 text-xs text-muted-foreground/60 font-medium">
                                    © {new Date().getFullYear()} ADC Building. All Rights Reserved.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
