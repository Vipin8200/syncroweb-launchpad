import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ResetPasswordRequest {
  internId: string;
  newPassword: string;
}

function generatePassword(length: number = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: ResetPasswordRequest = await req.json();
    const { internId, newPassword } = body;

    const passwordToSet = newPassword || generatePassword();

    // Get intern details
    const { data: intern, error: internError } = await supabaseAdmin
      .from("interns")
      .select("*")
      .eq("id", internId)
      .single();

    if (internError || !intern) {
      return new Response(JSON.stringify({ error: "Intern not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!intern.user_id) {
      return new Response(JSON.stringify({ error: "Intern has no user account" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Resetting password for intern: ${intern.full_name}`);

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      intern.user_id,
      { password: passwordToSet }
    );

    if (authError) {
      throw new Error(`Failed to update password: ${authError.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from("interns")
      .update({
        temp_password: passwordToSet,
        password_changed: false,
        password_reset_required: true,
      })
      .eq("id", internId);

    if (updateError) {
      console.error("Error updating intern record:", updateError);
    }

    // Send email with new password
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "SyncroWeb <noreply@syncroweb.in>",
            to: [intern.personal_email],
            subject: "Password Reset - SyncroWeb Technologies",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Password Reset</h1>
                <p>Dear ${intern.full_name},</p>
                <p>Your password has been reset by an administrator. Please use the credentials below to login.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your New Login Credentials</h3>
                  <p><strong>Email:</strong> ${intern.company_email}</p>
                  <p><strong>New Password:</strong> ${passwordToSet}</p>
                </div>
                <p style="color: #dc2626;"><strong>Important:</strong> You will be required to change this password after logging in.</p>
                <p>Please login at <a href="https://syncroweb.netlify.app/admin">https://syncroweb.netlify.app/admin</a>.</p>
                <p>Best regards,<br>SyncroWeb Technologies Team</p>
              </div>
            `,
          }),
        });

        const emailData = await emailResponse.json();
        console.log("Password reset email sent:", emailData);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset successfully",
        newPassword: passwordToSet
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-intern-password:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
