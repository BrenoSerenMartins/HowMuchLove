import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import { useFormValidator } from '../hooks/useFormValidator';
import { validateRequired, validateEmail, validatePassword } from '../utils/validators';
import PageWrapper from '../components/PageWrapper';

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
            // FIX: Remove 'as any' cast as 'form' property is now part of FormErrors type.
            setErrors({ form: err.message || 'Ocorreu um erro ao criar a conta.' });
        }
    };

    return (
      <PageWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 px-4 overscroll-none">
            <div className="w-full max-w-md relative z-10">
                 <div className="text-center mb-8">
                     <button onClick={() => navigate('/')} className="text-3xl font-bold text-slate-900 focus:outline-none">
                        HowMuch<span className="text-pink-500 font-extrabold">Love</span>
                    </button>
                </div>
                <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Crie sua conta</h2>
                    <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                        {errors.form && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center">{errors.form}</p>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-2">Nome</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={values.name}
                                onChange={handleChange}
                                required
                                aria-invalid={!!errors.name}
                                className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                required
                                aria-invalid={!!errors.email}
                                className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                required
                                aria-invalid={!!errors.password}
                                className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-pink-500 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-pink-600 transition-colors duration-300 disabled:bg-pink-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>
                    <p className="text-center text-slate-600 mt-6">
                        Já tem uma conta?{' '}
                        <button onClick={() => navigate('/login')} className="font-semibold text-pink-500 hover:text-pink-600">
                            Entrar
                        </button>
                    </p>
                </div>
            </div>
        </div>
      </PageWrapper>
    );
};

export default RegisterPage;