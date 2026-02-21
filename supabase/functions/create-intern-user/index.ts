import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateInternUserRequest {
  internId: string;
  fullName: string;
  personalEmail: string;
  companyEmail: string;
  tempPassword: string;
  domain: string;
  approvedBy: string;
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

    const body: CreateInternUserRequest = await req.json();
    const { internId, fullName, personalEmail, companyEmail, tempPassword, domain, approvedBy } = body;

    console.log(`Creating user for intern: ${fullName} (${companyEmail})`);

    // Check if user already exists by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === companyEmail
    );

    let userId: string;

    if (existingUser) {
      console.log(`User already exists with email ${companyEmail}, updating intern record`);
      userId = existingUser.id;

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
      );
      
      if (updateError) {
        console.error("Error updating user password:", updateError);
      }
    } else {
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: companyEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("No user returned from createUser");
      }

      userId = authData.user.id;
      console.log(`Created new user with ID: ${userId}`);
    }

    // Check if role already exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "intern")
      .maybeSingle();

    if (!existingRole) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "intern",
        });

      if (roleError) {
        console.error("Error adding role:", roleError);
        throw new Error(`Failed to add intern role: ${roleError.message}`);
      }
      console.log("Added intern role");
    } else {
      console.log("Intern role already exists");
    }

    // Update intern record
    const { error: updateError } = await supabaseAdmin
      .from("interns")
      .update({
        status: "active",
        user_id: userId,
        company_email: companyEmail,
        temp_password: tempPassword,
        approved_by: approvedBy,
        start_date: new Date().toISOString().split("T")[0],
        password_changed: false,
        password_reset_required: false,
      })
      .eq("id", internId);

    if (updateError) {
      throw new Error(`Failed to update intern: ${updateError.message}`);
    }

    console.log("Intern record updated successfully");

    // Send welcome email
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
            to: [personalEmail],
            subject: "Welcome to SyncroWeb Technologies - Your Account Details",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Welcome to SyncroWeb Technologies!</h1>
                <p>Dear ${fullName},</p>
                <p>Congratulations! Your internship application has been approved. We're excited to have you join our team.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Login Credentials</h3>
                  <p><strong>Company Email:</strong> ${companyEmail}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                  <p><strong>Domain:</strong> ${domain}</p>
                </div>
                <p>Please login at <a href="https://syncroweb.netlify.app/admin">https://syncroweb.netlify.app/admin</a> and change your password after your first login.</p>
                <p>Best regards,<br>SyncroWeb Technologies Team</p>
              </div>
            `,
          }),
        });

        const emailData = await emailResponse.json();
        console.log("Email sent:", emailData);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-intern-user:", error);
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
