import { UploadDropzone } from "@acme/ui/custom/upload-dropzone";
import { useUploadFiles } from "@better-upload/client";

export function Uploader() {
  const { control } = useUploadFiles({
    route: "images",
    api: `${import.meta.env.PUBLIC_SERVER_URL}/api/upload`,
    credentials: "include",
  });

  return (
    <UploadDropzone
      accept="image/*"
      control={control}
      description={{
        maxFiles: 4,
        maxFileSize: "5MB",
        fileTypes: "JPEG, PNG, GIF",
      }}
    />
  );
}
