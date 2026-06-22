import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useFormValidator } from '@/app/hooks/useFormValidator';
import { validateRequired, validateEmail } from '@/shared/lib/validators';
import { uiCopy } from '@/shared/lib/ui-copy';
import EliteButton from '@/shared/ui/EliteButton/index';
import EliteInput from '@/shared/ui/EliteInput/index';


const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { navigate } = useNavigate();

    const { values, errors, isSubmitting, handleChange, handleSubmit, setErrors } = useFormValidator(
        { email: '', password: '' },
        {
            email: [validateRequired, validateEmail],
            password: [validateRequired],
        }
    );

    const handleLogin = async () => {
        try {
            await login(values.email, values.password);
            navigate('/dashboard');
        } catch (err: any) {
            setErrors({ form: err.message || uiCopy.auth.loginFormError });
        }
    };

    return (
        <div className="h-[100dvh] flex flex-col items-center justify-center px-[clamp(1rem,4vw,2rem)] relative overflow-hidden">
            {/* Ambient Orbs */}
            <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/[0.06] blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-[clamp(1.5rem,4vh,3rem)] relative z-10"
            >
                <button onClick={() => navigate('/')} className="group focus:outline-none">
                    <span className="text-[clamp(2rem,5vw,3rem)] font-black text-white tracking-tighter uppercase transition-transform group-hover:scale-105 block">
                        HowMuch<span className="text-primary italic font-cursive lowercase px-1">Love</span>
                    </span>
                    <p className="text-[clamp(0.9rem,1.3vw,1.2rem)] font-cursive text-primary/60 lowercase italic mt-1">eternize o que seu coração sente...</p>
                </button>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card-elite p-[clamp(1.5rem,4vw,3rem)] relative overflow-hidden w-full max-w-md z-10"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.08] blur-3xl rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/[0.05] blur-2xl rounded-full -ml-10 -mb-10" />
                
                <h2 className="text-[clamp(1.25rem,2vw,1.6rem)] font-black text-center text-white tracking-tight mb-[clamp(1.5rem,4vh,2.5rem)] uppercase whitespace-nowrap">{uiCopy.auth.loginTitle}</h2>
                
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                    {errors.form && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            {errors.form}
                        </motion.div>
                    )}
                    
                    <EliteInput
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        icon={Mail}
                        error={errors.email}
                    />
                    
                    <EliteInput
                        label="Senha"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        icon={Lock}
                        error={errors.password}
                    />

                    <div className="flex justify-end mt-2">
                        <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:text-primary-hover transition-colors text-[10px] font-bold uppercase tracking-widest">
                            Esqueceu a senha?
                        </button>
                    </div>
                    
                    <EliteButton variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        fullWidth
                        className="group"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {uiCopy.auth.loginCta}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </EliteButton>
                </form>
                
                <p className="text-center text-slate-400 mt-10 text-sm font-medium">
                    {uiCopy.auth.loginPrompt}{' '}
                    <button onClick={() => navigate('/register')} className="font-black text-primary hover:text-primary-hover transition-colors uppercase tracking-widest text-[11px] ml-1">
                        {uiCopy.auth.registerCta}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
