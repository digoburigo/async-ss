"use client";

import { ArrowLeft, Plus, Send, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export default function CriarPedidoPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_neighborhood: "",
    customer_city: "",
    customer_state: "",
    customer_zipcode: "",
    payment_term: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const parseOrder = async () => {
    if (!message.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/sales/parse-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
        setMessage("");
      } else {
        alert("Não foi possível processar o pedido. Tente novamente.");
      }
    } catch (error) {
      console.error("[v0] Error parsing order:", error);
      alert("Erro ao processar pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  const addItem = () => {
    setItems([...items, { product_name: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const saveOrder = async () => {
    if (items.length === 0) {
      alert("Adicione pelo menos um item ao pedido");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customerData,
          items,
        }),
      });

      if (response.ok) {
        router.push("/vendas");
      } else {
        alert("Erro ao salvar pedido");
      }
    } catch (error) {
      console.error("[v0] Error saving order:", error);
      alert("Erro ao salvar pedido");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b bg-card p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/vendas")}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-2xl">Criar Novo Pedido</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Use IA para criar pedidos rapidamente ou adicione manualmente
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* AI Order Input */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Criar Pedido com IA</h2>
          </div>
          <p className="mb-4 text-muted-foreground text-sm">
            Digite o pedido em linguagem natural, exemplo: "Eu quero 2 shoyus e
            1 ketchup"
          </p>
          <div className="flex gap-2">
            <Textarea
              className="flex-1"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  parseOrder();
                }
              }}
              placeholder="Digite o pedido aqui..."
              rows={3}
              value={message}
            />
            <Button
              disabled={isProcessing || !message.trim()}
              onClick={parseOrder}
              size="lg"
            >
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Itens do Pedido</h2>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">
              Nenhum item adicionado. Use a IA ou adicione manualmente.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                  key={index}
                >
                  <div className="grid flex-1 grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Produto</Label>
                      <Input
                        onChange={(e) =>
                          updateItem(index, "product_name", e.target.value)
                        }
                        placeholder="Nome do produto"
                        value={item.product_name}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantidade</Label>
                      <Input
                        min="1"
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                        type="number"
                        value={item.quantity}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Preço Unit.</Label>
                      <Input
                        min="0"
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unit_price",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        step="0.01"
                        type="number"
                        value={item.unit_price}
                      />
                    </div>
                  </div>
                  <div className="pt-6">
                    <p className="font-medium text-sm">
                      R$ {(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    className="mt-6"
                    onClick={() => removeItem(index)}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-end border-border border-t pt-4">
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Total</p>
                  <p className="font-bold text-2xl">
                    R$ {calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Customer Data */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Dados do Cliente (Opcional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    customer_name: e.target.value,
                  })
                }
                placeholder="Nome do cliente"
                value={customerData.customer_name}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    customer_phone: e.target.value,
                  })
                }
                placeholder="(00) 00000-0000"
                value={customerData.customer_phone}
              />
            </div>
            <div className="col-span-2">
              <Label>Endereço</Label>
              <Input
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    customer_address: e.target.value,
                  })
                }
                placeholder="Rua, número, complemento"
                value={customerData.customer_address}
              />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    customer_neighborhood: e.target.value,
                  })
                }
                placeholder="Bairro"
                value={customerData.customer_neighborhood}
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    customer_city: e.target.value,
                  })
                }
                placeholder="Cidade"
                value={customerData.customer_city}
              />
            </div>
            <div>
              <Label>Prazo de Pagamento</Label>
              <Input
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    payment_term: e.target.value,
                  })
                }
                placeholder="Ex: 15 dias, 30 dias"
                value={customerData.payment_term}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => router.push("/vendas")} variant="outline">
            Cancelar
          </Button>
          <Button
            disabled={isSaving || items.length === 0}
            onClick={saveOrder}
            size="lg"
          >
            {isSaving ? "Salvando..." : "Salvar Pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
