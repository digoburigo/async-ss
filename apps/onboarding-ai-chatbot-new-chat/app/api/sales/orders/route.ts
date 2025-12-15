import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: orders, error } = await supabase
			.from("sales_orders")
			.select(`
        *,
        order_items (
          *
        )
      `)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return NextResponse.json({ orders });
	} catch (error) {
		console.error("[v0] Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { items, ...orderData } = body;

		// Generate order number
		const { data: orderNumber } = await supabase.rpc("generate_order_number");

		// Calculate total
		const totalAmount = items.reduce(
			(sum: number, item: any) => sum + item.quantity * item.unit_price,
			0,
		);

		// Create order
		const { data: order, error: orderError } = await supabase
			.from("sales_orders")
			.insert({
				...orderData,
				user_id: user.id,
				order_number: orderNumber,
				total_amount: totalAmount,
			})
			.select()
			.single();

		if (orderError) throw orderError;

		// Create order items
		const orderItems = items.map((item: any, index: number) => ({
			order_id: order.id,
			product_id: item.product_id || null,
			product_name: item.product_name,
			quantity: item.quantity,
			unit_price: item.unit_price,
			total_price: item.quantity * item.unit_price,
			position: index,
		}));

		const { error: itemsError } = await supabase
			.from("order_items")
			.insert(orderItems);

		if (itemsError) throw itemsError;

		// Fetch complete order with items
		const { data: completeOrder } = await supabase
			.from("sales_orders")
			.select(`
        *,
        order_items (*)
      `)
			.eq("id", order.id)
			.single();

		return NextResponse.json({ order: completeOrder });
	} catch (error) {
		console.error("[v0] Error creating order:", error);
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 },
		);
	}
}
