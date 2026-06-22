import React from 'react';
import { useNavigate } from '@/app/hooks/useNavigate';

const PrivacyPage: React.FC = () => {
    const { navigate } = useNavigate();

    return (
        <div className="min-h-screen flex flex-col pt-32 pb-20 px-[clamp(1.5rem,5vw,3rem)] relative overflow-hidden bg-[#050505]">
            <div className="max-w-3xl mx-auto w-full relative z-10 text-slate-300 space-y-8">
                <button onClick={() => navigate('/')} className="text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-12 flex items-center gap-2">
                    &larr; Voltar para a Home
                </button>

                <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white tracking-tighter uppercase mb-4">
                    Política de <span className="text-primary italic font-cursive lowercase">Privacidade</span>
                </h1>
                
                <p className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-12">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="space-y-6 text-sm leading-relaxed text-slate-400">
                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">1. Informações que Coletamos</h2>
                        <p>Coletamos informações essenciais para o funcionamento do serviço:</p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li><strong>Informações de Conta:</strong> Seu nome e endereço de e-mail ao criar uma conta.</li>
                            <li><strong>Conteúdo:</strong> Textos e fotos que você faz upload para criar sua história de amor.</li>
                            <li><strong>Dados de Pagamento:</strong> Processados de forma segura pelo Stripe. Não temos acesso aos números do seu cartão de crédito.</li>
                            <li><strong>Dados de Uso:</strong> Informações sobre como você interage com a plataforma, coletadas via Google Analytics para melhorar o serviço.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">2. Como Usamos as Informações</h2>
                        <p>Suas informações são utilizadas exclusivamente para:</p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Criar e hospedar a sua história de amor na internet.</li>
                            <li>Autenticar seu acesso à conta.</li>
                            <li>Processar pagamentos e enviar recibos.</li>
                            <li>Fornecer suporte ao cliente e enviar atualizações importantes sobre o serviço.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">3. Compartilhamento de Dados</h2>
                        <p>Nós não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Seus dados são compartilhados apenas com provedores de infraestrutura essenciais (Supabase para hospedagem e banco de dados, Stripe para pagamentos) que também seguem rigorosas políticas de privacidade e segurança.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">4. Armazenamento e Segurança</h2>
                        <p>Suas fotos e textos são armazenados em nuvem usando a infraestrutura segura do Supabase (PostgreSQL e Supabase Storage). Utilizamos criptografia em trânsito (HTTPS) e senhas protegidas com hash scrypt. Recomendamos que você utilize o recurso de Proteção por Senha na sua história se desejar manter suas fotos totalmente privadas da internet pública.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">5. Seus Direitos</h2>
                        <p>Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Você pode excluir permanentemente suas fotos da plataforma atualizando ou removendo sua história no painel de controle. Para excluir sua conta por completo, entre em contato com nosso suporte.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
