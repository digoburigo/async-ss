"use client";

import {
  Calendar,
  DollarSign,
  FileText,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrderItem {
  id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string | null;
  order_date: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
}

export default function VendasPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/sales/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("[v0] Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

    try {
      const response = await fetch(`/api/sales/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrders(orders.filter((o) => o.id !== orderId));
      }
    } catch (error) {
      console.error("[v0] Error deleting order:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Rascunho";
      case "confirmed":
        return "Confirmado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">Vendas</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Crie pedidos de venda com IA a partir de comandos de voz ou texto
            </p>
          </div>
          <Button onClick={() => router.push("/vendas/criar")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Nenhum pedido criado</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Comece criando seu primeiro pedido de venda com IA
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => router.push("/vendas/criar")}
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Pedido
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card
                className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
                key={order.id}
                onClick={() => router.push(`/vendas/${order.id}`)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{order.order_number}</h3>
                    </div>
                    {order.customer_name && (
                      <p className="mt-1 text-muted-foreground text-sm">
                        {order.customer_name}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 font-medium text-xs",
                      getStatusColor(order.status)
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.order_date).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <DollarSign className="h-4 w-4" />
                    R$ {order.total_amount.toFixed(2)}
                  </div>
                </div>

                <div className="border-border border-t pt-4">
                  <p className="text-muted-foreground text-xs">
                    {order.order_items?.length || 0} item(ns)
                  </p>
                </div>

                <Button
                  className="mt-4 w-full text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOrder(order.id);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
