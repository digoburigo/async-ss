import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("career_landing_pages")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching landing page:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Landing page not found" },
				{ status: 404 },
			);
		}

		const { data: jobAssociations, error: jobError } = await supabase
			.from("career_landing_page_jobs")
			.select("job_position_id")
			.eq("landing_page_id", id);

		if (jobError) {
			console.error("Error fetching job associations:", jobError);
		}

		const job_ids =
			jobAssociations?.map((assoc) => assoc.job_position_id) || [];

		return NextResponse.json({ ...data, job_ids });
	} catch (error) {
		console.error("Error in GET landing page:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();

		const {
			title,
			slug,
			description,
			company_name,
			company_description,
			is_active,
			job_ids,
		} = body;

		const { data, error } = await supabase
			.from("career_landing_pages")
			.update({
				title,
				slug,
				description,
				company_name,
				company_description,
				is_active,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating landing page:", error);
			if (error.code === "23505") {
				return NextResponse.json(
					{ error: "Slug already exists" },
					{ status: 400 },
				);
			}
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		if (job_ids !== undefined) {
			// Delete existing associations
			await supabase
				.from("career_landing_page_jobs")
				.delete()
				.eq("landing_page_id", id);

			// Insert new associations
			if (job_ids.length > 0) {
				const jobAssociations = job_ids.map((jobId: string) => ({
					landing_page_id: id,
					job_position_id: jobId,
				}));

				const { error: jobError } = await supabase
					.from("career_landing_page_jobs")
					.insert(jobAssociations);

				if (jobError) {
					console.error("Error updating job associations:", jobError);
				}
			}
		}

		return NextResponse.json({ ...data, job_ids: job_ids || [] });
	} catch (error) {
		console.error("Error in PUT landing page:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { error } = await supabase
			.from("career_landing_pages")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("Error deleting landing page:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in DELETE landing page:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
