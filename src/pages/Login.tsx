import { useState } from "react";
import { login } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Lock, User, Instagram, Facebook, Twitter, Mail, ChevronDown } from "lucide-react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            if (login(username, password)) {
                toast.success("Welcome back!", { duration: 2000 });
                window.location.href = "/";
            } else {
                toast.error("Invalid credentials", { description: "Please check your username and password." });
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-secondary/80 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

            {/* Main Content Area - matching Layout.tsx padding */}
            <div className="relative w-full z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 animate-fade-in flex items-center justify-center min-h-screen">

                <div className="w-full max-w-[1000px] h-auto md:min-h-[550px] bg-card rounded-2xl shadow-xl relative flex flex-col md:flex-row overflow-hidden border border-border/50">

                    {/* --- Left Primary Side --- */}
                    <div className="w-full md:w-[45%] h-64 md:h-auto bg-primary relative flex items-center justify-center p-6 shrink-0 z-0 overflow-hidden">
                        {/* Abstract shapes in the background of blue side */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
                            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-2xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_60%)]" />
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
                                <div className="w-36 h-36 md:w-48 md:h-48 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center justify-center border-[3px] border-white/30 relative overflow-hidden group hover:scale-[1.05] transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.2)] z-10">
                                    {/* Inner subtle glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>

                                    <img src="/favicon.ico" alt="ADC Logo" className="w-[65%] h-[65%] object-cover rounded-full relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-700" />

                                    <div className="absolute bottom-4 md:bottom-6 w-full text-center z-10">
                                        <span className="text-sm md:text-lg font-extrabold tracking-widest text-primary px-3 py-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">ADC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right White Side --- */}
                    <div className="w-full md:w-[55%] h-full bg-card z-10 transition-all duration-300">



                        <div className="w-full h-full flex flex-col justify-center px-8 sm:px-12 md:pl-20 lg:pl-28 xl:pl-32 pr-8 sm:pr-12 md:pr-16 pt-8 pb-4 relative">

                            <div className="mb-8">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-2 uppercase tracking-wide">LOGIN</h2>
                                <p className="text-muted-foreground text-sm font-medium">Enter your username and password to log in</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Enter Username"
                                            className="pl-12 py-6 bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-xl w-full transition-all text-foreground font-medium placeholder:font-normal placeholder:text-muted-foreground"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="Enter Password"
                                            className="pl-12 py-6 bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-xl w-full transition-all text-foreground font-medium placeholder:font-normal placeholder:text-muted-foreground"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center space-x-3 mt-2 cursor-pointer group w-max">
                                    <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-border group-hover:border-primary transition-colors">
                                        <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                                        <div className="w-full h-full bg-primary rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">Remember me</span>
                                </label>

                                <Button type="submit" className="w-full h-11 mt-6 font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]" disabled={isLoading}>
                                    {isLoading ? "LOGGING IN..." : "LOGIN"}
                                </Button>
                            </form>

                            <div className="mt-8 flex flex-col items-center">
                                <div className="text-center text-[11px] text-muted-foreground bg-muted/30 px-4 py-2 rounded-md border border-border/50">
                                    <p>Demo Admin: <span className="font-mono text-foreground font-semibold">admin/admin123</span> &bull; Viewer: <span className="font-mono text-foreground font-semibold">viewer/viewer123</span></p>
                                </div>

                                <div className="text-center mt-6 text-xs text-muted-foreground font-medium">
                                    © {new Date().getFullYear()}. ADC Building All Rights Reserved.
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
