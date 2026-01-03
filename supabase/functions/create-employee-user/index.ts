import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateEmployeeUserRequest {
  employeeId: string;
  fullName: string;
  personalEmail: string;
  companyEmail: string;
  tempPassword: string;
  department: string;
  position: string;
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

    // Manual auth guard
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

    // Only admins can create employees
    const { data: callerRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role lookup failed:", roleError);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!callerRole) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: CreateEmployeeUserRequest = await req.json();
    const { employeeId, fullName, personalEmail, companyEmail, tempPassword, department, position } = body;

    console.log(`Creating user for employee: ${fullName} (${companyEmail})`);

    // Check if user already exists by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === companyEmail
    );

    let userId: string;

    if (existingUser) {
      console.log(`User already exists with email ${companyEmail}, updating employee record`);
      userId = existingUser.id;

      // Update password for existing user
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
      );
      
      if (updateError) {
        console.error("Error updating user password:", updateError);
      }
    } else {
      // Create new auth user
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
      .eq("role", "employee")
      .maybeSingle();

    if (!existingRole) {
      // Add employee role
      const { error: roleInsertError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "employee",
        });

      if (roleInsertError) {
        console.error("Error adding role:", roleInsertError);
        throw new Error(`Failed to add employee role: ${roleInsertError.message}`);
      }
      console.log("Added employee role");
    } else {
      console.log("Employee role already exists");
    }

    // Update employee record
    const { error: updateError } = await supabaseAdmin
      .from("employees")
      .update({
        user_id: userId,
        email: companyEmail,
        personal_email: personalEmail,
        temp_password: tempPassword,
        added_by: callerUserId,
        is_active: true,
        password_changed: false,
        password_reset_required: false,
      })
      .eq("id", employeeId);

    if (updateError) {
      throw new Error(`Failed to update employee: ${updateError.message}`);
    }

    console.log("Employee record updated successfully");

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
            from: "SyncroWeb <onboarding@resend.dev>",
            to: [personalEmail],
            subject: "Welcome to SyncroWeb Technologies - Employee Account Details",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Welcome to SyncroWeb Technologies!</h1>
                <p>Dear ${fullName},</p>
                <p>Your employee account has been created. Welcome to the team!</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Login Credentials</h3>
                  <p><strong>Company Email:</strong> ${companyEmail}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                  <p><strong>Department:</strong> ${department}</p>
                  <p><strong>Position:</strong> ${position}</p>
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
    console.error("Error in create-employee-user:", error);
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
