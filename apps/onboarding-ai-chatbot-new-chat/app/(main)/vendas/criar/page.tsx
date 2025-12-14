"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Sparkles, Plus, X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface OrderItem {
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
}

export default function CriarPedidoPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_neighborhood: "",
    customer_city: "",
    customer_state: "",
    customer_zipcode: "",
    payment_term: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const parseOrder = async () => {
    if (!message.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/sales/parse-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setMessage("")
      } else {
        alert("Não foi possível processar o pedido. Tente novamente.")
      }
    } catch (error) {
      console.error("[v0] Error parsing order:", error)
      alert("Erro ao processar pedido")
    } finally {
      setIsProcessing(false)
    }
  }

  const addItem = () => {
    setItems([...items, { product_name: "", quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const saveOrder = async () => {
    if (items.length === 0) {
      alert("Adicione pelo menos um item ao pedido")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customerData,
          items,
        }),
      })

      if (response.ok) {
        router.push("/vendas")
      } else {
        alert("Erro ao salvar pedido")
      }
    } catch (error) {
      console.error("[v0] Error saving order:", error)
      alert("Erro ao salvar pedido")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/vendas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Novo Pedido</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Use IA para criar pedidos rapidamente ou adicione manualmente
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* AI Order Input */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Criar Pedido com IA</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Digite o pedido em linguagem natural, exemplo: "Eu quero 2 shoyus e 1 ketchup"
          </p>
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite o pedido aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  parseOrder()
                }
              }}
              className="flex-1"
              rows={3}
            />
            <Button onClick={parseOrder} disabled={isProcessing || !message.trim()} size="lg">
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Itens do Pedido</h2>
            <Button onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum item adicionado. Use a IA ou adicione manualmente.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border border-border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Produto</Label>
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateItem(index, "product_name", e.target.value)}
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Preço Unit.</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="pt-6">
                    <p className="text-sm font-medium">
                      R$ {(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="mt-6">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-border">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">R$ {calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Customer Data */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Dados do Cliente (Opcional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={customerData.customer_name}
                onChange={(e) => setCustomerData({ ...customerData, customer_name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={customerData.customer_phone}
                onChange={(e) => setCustomerData({ ...customerData, customer_phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="col-span-2">
              <Label>Endereço</Label>
              <Input
                value={customerData.customer_address}
                onChange={(e) => setCustomerData({ ...customerData, customer_address: e.target.value })}
                placeholder="Rua, número, complemento"
              />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input
                value={customerData.customer_neighborhood}
                onChange={(e) =>
                  setCustomerData({ ...customerData, customer_neighborhood: e.target.value })
                }
                placeholder="Bairro"
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                value={customerData.customer_city}
                onChange={(e) => setCustomerData({ ...customerData, customer_city: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label>Prazo de Pagamento</Label>
              <Input
                value={customerData.payment_term}
                onChange={(e) => setCustomerData({ ...customerData, payment_term: e.target.value })}
                placeholder="Ex: 15 dias, 30 dias"
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => router.push("/vendas")}>
            Cancelar
          </Button>
          <Button onClick={saveOrder} disabled={isSaving || items.length === 0} size="lg">
            {isSaving ? "Salvando..." : "Salvar Pedido"}
          </Button>
        </div>
      </div>
    </div>
  )
}
