import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id is required" });
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase admin isn't configured." });

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("status, booking_reference, duffel_order_id, error_message")
    .eq("id", id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Booking not found" });
  return res.status(200).json(data);
}
