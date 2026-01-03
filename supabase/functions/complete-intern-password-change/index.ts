import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Manual auth guard (verify_jwt=false in config)
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader?.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.slice(7).trim();
    const { data: caller, error: callerError } = await supabaseAdmin.auth.getUser(token);

    if (callerError || !caller?.user) {
      console.error("Invalid auth token:", callerError);
      return new Response(JSON.stringify({ error: "Invalid JWT" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const callerUserId = caller.user.id;

    // Ensure only interns can call this endpoint
    const { data: internRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", callerUserId)
      .eq("role", "intern")
      .maybeSingle();

    if (roleError) {
      console.error("Role lookup failed:", roleError);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!internRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: updatedIntern, error: updateError } = await supabaseAdmin
      .from("interns")
      .update({
        password_changed: true,
        password_reset_required: false,
        temp_password: null,
      })
      .eq("user_id", callerUserId)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Error updating intern flags:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update intern record" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!updatedIntern) {
      return new Response(JSON.stringify({ error: "Intern record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in complete-intern-password-change:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
