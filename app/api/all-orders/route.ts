import { getSupabase } from "@/utils/supabase";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("orders")
    .select("*");

  return Response.json({ data, error });
}