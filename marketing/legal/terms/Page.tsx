import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@/app/hooks/useNavigate';

const TermsPage: React.FC = () => {
    const { navigate } = useNavigate();

    return (
        <div className="min-h-screen flex flex-col pt-32 pb-20 px-[clamp(1.5rem,5vw,3rem)] relative overflow-hidden bg-[#050505]">
            <div className="max-w-3xl mx-auto w-full relative z-10 text-slate-300 space-y-8">
                <button onClick={() => navigate('/')} className="text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-12 flex items-center gap-2">
                    &larr; Voltar para a Home
                </button>

                <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white tracking-tighter uppercase mb-4">
                    Termos de <span className="text-primary italic font-cursive lowercase">Uso</span>
                </h1>
                
                <p className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-12">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="space-y-6 text-sm leading-relaxed text-slate-400">
                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">1. Aceitação dos Termos</h2>
                        <p>Ao acessar e usar o HowMuchLove, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com alguma parte destes termos, não deverá usar nosso serviço.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">2. Uso do Serviço</h2>
                        <p>O HowMuchLove é uma plataforma para criar e compartilhar histórias de amor. Você concorda em usar o serviço apenas para fins legais e de maneira que não infrinja os direitos de terceiros ou restrinja o uso do serviço por qualquer outra pessoa.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">3. Conteúdo Gerado pelo Usuário</h2>
                        <p>Você retém todos os direitos sobre o conteúdo (textos, imagens) que enviar para a plataforma. No entanto, ao enviar conteúdo, você nos concede uma licença mundial, não exclusiva e isenta de royalties para hospedar e exibir esse conteúdo com o propósito exclusivo de fornecer o serviço.</p>
                        <p className="mt-4"><strong>Conteúdo Proibido:</strong> É estritamente proibido fazer upload de conteúdo ilegal, difamatório, ofensivo, pornográfico ou que viole direitos autorais de terceiros. Reservamo-nos o direito de remover qualquer conteúdo ou encerrar contas que violem esta regra sem aviso prévio.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">4. Assinaturas e Pagamentos</h2>
                        <p>Alguns recursos da plataforma exigem o pagamento de uma assinatura ou taxa única. Os pagamentos são processados com segurança através da Stripe. Não armazenamos os dados do seu cartão de crédito.</p>
                        <p className="mt-4"><strong>Política de Reembolso:</strong> Se você não estiver satisfeito com nosso serviço, entre em contato conosco em até 7 dias após a compra para solicitar um reembolso integral. Reservamo-nos o direito de recusar reembolsos em casos de uso abusivo.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">5. Limitação de Responsabilidade</h2>
                        <p>O serviço é fornecido "no estado em que se encontra". Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Em nenhuma circunstância o HowMuchLove será responsável por quaisquer danos indiretos, incidentais, especiais ou consequentes.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">6. Alterações nos Termos</h2>
                        <p>Podemos modificar estes termos a qualquer momento. Notificaremos sobre mudanças significativas no site. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
