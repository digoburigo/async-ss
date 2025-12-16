import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FormFileUpload } from "@/components/forms/form-file-upload";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import type { Product } from "@/constants/mock-api";

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length == 1, "Image is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB."
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.string(),
  price: z.number(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export default function ProductForm({
  initialData,
  pageTitle,
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const defaultValues = {
    name: initialData?.name || "",
    category: initialData?.category || "",
    price: initialData?.price || undefined,
    description: initialData?.description || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Form submission logic would be implemented here
    console.log(values);
    router.push("/dashboard/product");
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left font-bold text-2xl">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          className="space-y-8"
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormFileUpload
            config={{
              maxSize: 5 * 1024 * 1024,
              maxFiles: 4,
            }}
            control={form.control}
            description="Upload a product image"
            label="Product Image"
            name="image"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput
              control={form.control}
              label="Product Name"
              name="name"
              placeholder="Enter product name"
              required
            />

            <FormSelect
              control={form.control}
              label="Category"
              name="category"
              options={[
                {
                  label: "Beauty Products",
                  value: "beauty",
                },
                {
                  label: "Electronics",
                  value: "electronics",
                },
                {
                  label: "Home & Garden",
                  value: "home",
                },
                {
                  label: "Sports & Outdoors",
                  value: "sports",
                },
              ]}
              placeholder="Select category"
              required
            />

            <FormInput
              control={form.control}
              label="Price"
              min={0}
              name="price"
              placeholder="Enter price"
              required
              step="0.01"
              type="number"
            />
          </div>

          <FormTextarea
            config={{
              maxLength: 500,
              showCharCount: true,
              rows: 4,
            }}
            control={form.control}
            label="Description"
            name="description"
            placeholder="Enter product description"
            required
          />

          <Button type="submit">Add Product</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
