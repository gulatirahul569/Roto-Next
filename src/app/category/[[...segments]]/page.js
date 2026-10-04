import CategoryPageClient from "./CategoryPageClient";
import { getMediaOverrides } from "../../../lib/getMediaOverrides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  const initialMediaOverrides = await getMediaOverrides();

  return (
    <CategoryPageClient
      initialMediaOverrides={initialMediaOverrides}
    />
  );
}