import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sobre",
  description: "Sobre o portal Indústria News — mídia e inteligência para o setor industrial brasileiro",
}

export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-black mb-8">SOBRE O INDÚSTRIA NEWS</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
        <p>
          O <strong>Indústria News</strong> é o portal de notícias e inteligência dedicado ao setor
          industrial brasileiro. Cobrimos os principais segmentos — da mineração à indústria 4.0,
          da metalurgia à energia renovável — com análises aprofundadas e conteúdo relevante para
          executivos, engenheiros e profissionais da cadeia produtiva.
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">Nossa Missão</h2>
        <p>
          Conectar a indústria brasileira com as informações que impulsionam decisões estratégicas.
          Vamos além da notícia: entregamos inteligência de mercado, dados de performance e
          leads qualificados para nossos parceiros anunciantes.
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">Revista Digital</h2>
        <p>
          A revista Indústria News traz edições temáticas com reportagens exclusivas, análises
          setoriais e conteúdo premium. Nossa primeira edição, o <em>Anuário da Indústria 2025</em>,
          contou com 130 páginas de conteúdo editorial e publieditoriais de marcas como VISIVO
          Arquitetura e parceiros do setor.
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">Para Anunciantes</h2>
        <p>
          Oferecemos mais que espaço publicitário. Nossos anunciantes recebem um painel completo
          de inteligência com leads qualificados, métricas de performance em tempo real, benchmark
          setorial e relatórios premium automatizados.
        </p>
        <p>
          Planos disponíveis: <strong>Bronze</strong> (visibilidade), <strong>Prata</strong> (performance)
          e <strong>Ouro</strong> (lead generation completo com notificações WhatsApp).
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">Contato</h2>
        <p>
          <strong>Revista Segmentada e Publicidade LTDA</strong><br />
          Av. Paulista, 1636, Sala 1105 — São Paulo, SP<br />
          <strong>Comercial:</strong> comercial@industrianews.com<br />
          <strong>Redação:</strong> redacao@industrianews.com
        </p>
      </div>
    </div>
  )
}
