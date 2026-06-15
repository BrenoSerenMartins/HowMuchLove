import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useFormValidator } from '@/app/hooks/useFormValidator';
import { validateRequired, validateEmail, validatePassword } from '@/shared/lib/validators';
import { uiCopy } from '@/shared/lib/ui-copy';

const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const { navigate } = useNavigate();
    const { values, errors, isSubmitting, handleChange, handleSubmit, setErrors } = useFormValidator(
        { name: '', email: '', password: '' },
        {
            name: [validateRequired],
            email: [validateRequired, validateEmail],
            password: validatePassword,
        }
    );

    const handleRegister = async () => {
        try {
            await register(values.name, values.email, values.password);
            navigate('/dashboard');
        } catch (err: any) {
            setErrors({ form: err.message || uiCopy.auth.registerFormError });
        }
    };

    return (
        <div className="container-fluid w-full max-w-md mx-auto relative z-10 py-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                 <button onClick={() => navigate('/')} className="group focus:outline-none">
                    <span className="text-4xl font-black text-white tracking-tighter uppercase transition-transform group-hover:scale-105 block">
                        HowMuch<span className="text-primary italic font-cursive lowercase px-1">Love</span>
                    </span>
                </button>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card-elite p-10 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h2 className="text-3xl font-black text-white tracking-tight mb-8 uppercase">{uiCopy.auth.registerTitle}</h2>
                
                <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                    {errors.form && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            {errors.form}
                        </motion.div>
                    )}
                    
                    <div>
                        <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Nome</label>
                        <div className="relative group">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={values.name}
                                onChange={handleChange}
                                placeholder="Seu nome"
                                required
                                aria-invalid={!!errors.name}
                                className={`input-elite pr-12 ${errors.name ? '!border-red-500/50' : ''}`}
                            />
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                        </div>
                        {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Email</label>
                        <div className="relative group">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                required
                                aria-invalid={!!errors.email}
                                className={`input-elite pr-12 ${errors.email ? '!border-red-500/50' : ''}`}
                            />
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                        </div>
                        {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Senha</label>
                        <div className="relative group">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                                aria-invalid={!!errors.password}
                                className={`input-elite pr-12 ${errors.password ? '!border-red-500/50' : ''}`}
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
                        </div>
                         {errors.password && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">{errors.password}</p>}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full !py-5 group"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {uiCopy.auth.registerCta}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
                
                <p className="text-center text-slate-400 mt-10 text-sm font-medium">
                    {uiCopy.auth.registerPrompt}{' '}
                    <button onClick={() => navigate('/login')} className="font-black text-primary hover:text-primary-hover transition-colors uppercase tracking-widest text-[11px] ml-1">
                        {uiCopy.auth.loginCta}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
