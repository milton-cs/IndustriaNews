"use client"

import { useState } from "react"

type GateData = {
  name: string
  company: string
  position: string
  email: string
  phone: string
}

export function ContentGate({ onSubmit }: { onSubmit: (data: GateData) => void }) {
  const [form, setForm] = useState<GateData>({
    name: "", company: "", position: "", email: "", phone: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const update = (field: keyof GateData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center mb-6">
          <h3 className="font-headline text-2xl font-bold text-brand-black">
            CONTINUE LENDO
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Cadastre-se gratuitamente para acessar todo o conteúdo
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Seu nome"
            value={form.name}
            onChange={update("name")}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda"
          />
          <input
            placeholder="Empresa"
            value={form.company}
            onChange={update("company")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda"
          />
          <input
            placeholder="Cargo"
            value={form.position}
            onChange={update("position")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={update("email")}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda"
          />
          <input
            placeholder="Telefone / WhatsApp"
            value={form.phone}
            onChange={update("phone")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 focus:border-brand-lavanda"
          />
          <button
            type="submit"
            className="w-full py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors"
          >
            Continuar Lendo
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">
          Seus dados são protegidos conforme a LGPD.
        </p>
      </div>
    </div>
  )
}
