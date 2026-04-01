"use client"

import { useState } from "react"

export function ParceiroForm({ advertiserId, advertiserName }: { advertiserId: string; advertiserName: string }) {
  const [form, setForm] = useState({ name: "", company: "", position: "", email: "", phone: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/parceiro/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, advertiserId }),
      })
      if (res.ok) setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="font-headline text-xl font-bold text-brand-black mb-2">Cadastro realizado!</h3>
        <p className="text-gray-500">Em breve a equipe de {advertiserName} entrará em contato.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        placeholder="Seu nome *"
        value={form.name}
        onChange={update("name")}
        required
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda text-brand-black"
      />
      <input
        placeholder="Empresa"
        value={form.company}
        onChange={update("company")}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda text-brand-black"
      />
      <input
        placeholder="Cargo"
        value={form.position}
        onChange={update("position")}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda text-brand-black"
      />
      <input
        type="email"
        placeholder="E-mail *"
        value={form.email}
        onChange={update("email")}
        required
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda text-brand-black"
      />
      <input
        placeholder="Telefone / WhatsApp"
        value={form.phone}
        onChange={update("phone")}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda text-brand-black"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Quero ser contactado"}
      </button>
      <p className="text-xs text-gray-400 text-center">Seus dados são protegidos conforme a LGPD.</p>
    </form>
  )
}
