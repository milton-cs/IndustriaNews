import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade",
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-black mb-8">POLÍTICA DE PRIVACIDADE</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
        <p>
          O portal <strong>Indústria News</strong> ("nós") respeita a privacidade dos seus usuários
          e está comprometido com a proteção dos dados pessoais coletados, em conformidade com a
          Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">1. Dados que coletamos</h2>
        <p>Coletamos dados pessoais quando você:</p>
        <ul>
          <li>Preenche o formulário de cadastro (nome, empresa, cargo, e-mail, telefone)</li>
          <li>Navega pelo portal (dados de navegação via cookies)</li>
          <li>Interage com anúncios (cliques e visualizações)</li>
        </ul>

        <h2 className="font-headline text-xl font-bold text-brand-black">2. Como usamos seus dados</h2>
        <ul>
          <li>Personalizar sua experiência de leitura</li>
          <li>Fornecer conteúdo relevante ao seu setor industrial</li>
          <li>Gerar relatórios agregados e anonimizados para anunciantes</li>
          <li>Enviar comunicações sobre novos conteúdos (com seu consentimento)</li>
        </ul>

        <h2 className="font-headline text-xl font-bold text-brand-black">3. Cookies</h2>
        <p>
          Utilizamos cookies primários para identificar visitantes recorrentes e melhorar a
          experiência de navegação. Você pode gerenciar suas preferências de cookies a qualquer
          momento através do banner de consentimento.
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">4. Compartilhamento</h2>
        <p>
          Compartilhamos dados de contato apenas com anunciantes cujos anúncios você interagiu
          diretamente, e somente quando seu plano de assinatura permite. Dados de benchmark
          setorial são sempre agregados e anonimizados.
        </p>

        <h2 className="font-headline text-xl font-bold text-brand-black">5. Seus direitos</h2>
        <p>Você tem direito a:</p>
        <ul>
          <li>Acessar seus dados pessoais</li>
          <li>Solicitar correção de dados incompletos ou desatualizados</li>
          <li>Solicitar a exclusão dos seus dados</li>
          <li>Revogar o consentimento a qualquer momento</li>
        </ul>

        <h2 className="font-headline text-xl font-bold text-brand-black">6. Contato</h2>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas, entre em contato:<br />
          <strong>E-mail:</strong> privacidade@industrianews.com<br />
          <strong>Endereço:</strong> Av. Paulista, 1636, Sala 1105 — São Paulo, SP
        </p>

        <p className="text-sm text-gray-400 mt-8">
          Última atualização: março de 2026
        </p>
      </div>
    </div>
  )
}
