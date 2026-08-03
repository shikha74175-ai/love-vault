import { supabase } from "@/lib/client";

export function getVaultBucket(fileType: string) {

  switch (fileType) {

    case "image":
      return "vault-images";

    case "video":
      return "vault-videos";

    case "audio":
      return "vault-audio";

    case "document":
      return "vault-documents";

    default:
      return "vault-images";

  }

}

export async function getVaultSignedUrl(
  fileType: string,
  path: string
) {

  const bucket = getVaultBucket(fileType);

  const { data, error } =
    await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

  if (error) {

    console.error(error);

    return null;

  }

  return data.signedUrl;

}