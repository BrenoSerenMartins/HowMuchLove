import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import { useFormValidator } from '../hooks/useFormValidator';
import { validateRequired, validateEmail } from '../utils/validators';

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
            setErrors({ form: err.message || 'Ocorreu um erro.' });
        }
    };

    const inputClasses = "w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-pink-400 focus:bg-black/30 text-white placeholder-slate-400 transition-colors";

    return (
        <main className="flex-grow flex items-center justify-center p-4 z-10">
          <div className="w-full max-w-md animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="text-center mb-8">
                   <button onClick={() => navigate('/')} className="text-4xl font-bold text-white focus:outline-none">
                      HowMuch<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-extrabold">Love</span>
                  </button>
              </div>
              <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-center text-white mb-6">Acesse sua conta</h2>
                  <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                      {errors.form && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm">{errors.form}</p>}
                      <div>
                          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                          <input
                              id="email"
                              name="email"
                              type="email"
                              value={values.email}
                              onChange={handleChange}
                              required
                              aria-invalid={!!errors.email}
                              className={`${inputClasses} ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'}`}
                          />
                          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>
                      <div>
                          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                          <input
                              id="password"
                              name="password"
                              type="password"
                              value={values.password}
                              onChange={handleChange}
                              required
                              aria-invalid={!!errors.password}
                              className={`${inputClasses} ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'}`}
                          />
                           {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                      </div>
                      <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                          {isSubmitting ? 'Entrando...' : 'Entrar'}
                      </button>
                  </form>
                  <p className="text-center text-slate-300 mt-6">
                      Não tem uma conta?{' '}
                      <button onClick={() => navigate('/register')} className="font-semibold text-pink-400 hover:text-pink-300 transition-colors duration-300">
                          Cadastre-se
                      </button>
                  </p>
              </div>
          </div>
        </main>
    );
};

export default LoginPage;
