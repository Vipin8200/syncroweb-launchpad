import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "intern_approved" | "intern_rejected" | "task_assigned" | "approval_request";
  recipientEmail: string;
  recipientName: string;
  data: {
    companyEmail?: string;
    tempPassword?: string;
    internName?: string;
    taskTitle?: string;
    domain?: string;
    adminEmail?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, data }: NotificationRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case "intern_approved":
        subject = "Welcome to Karmel Infotech - Your Account Details";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Welcome to Karmel Infotech!</h1>
            <p>Dear ${recipientName},</p>
            <p>Congratulations! Your internship application has been approved. We're excited to have you join our team.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Login Credentials</h3>
              <p><strong>Company Email:</strong> ${data.companyEmail}</p>
              <p><strong>Temporary Password:</strong> ${data.tempPassword}</p>
              <p><strong>Domain:</strong> ${data.domain}</p>
            </div>
            <p>Please login and change your password after your first login.</p>
            <p>Best regards,<br>Karmel Infotech & Software Solution LLP</p>
          </div>
        `;
        break;

      case "intern_rejected":
        subject = "Karmel Infotech - Application Update";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Application Update</h1>
            <p>Dear ${recipientName},</p>
            <p>Thank you for your interest in the internship position at Karmel Infotech.</p>
            <p>After careful review, we regret to inform you that we are unable to proceed with your application at this time.</p>
            <p>We encourage you to apply again in the future as new opportunities arise.</p>
            <p>Best regards,<br>Karmel Infotech & Software Solution LLP</p>
          </div>
        `;
        break;

      case "task_assigned":
        subject = `New Task Assigned: ${data.taskTitle}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">New Task Assigned</h1>
            <p>Dear ${recipientName},</p>
            <p>A new task has been assigned to you:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${data.taskTitle}</h3>
            </div>
            <p>Please login to view the full details and update your progress.</p>
            <p>Best regards,<br>Karmel Infotech & Software Solution LLP</p>
          </div>
        `;
        break;

      case "approval_request":
        subject = `New Intern Pending Approval: ${data.internName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">New Intern Pending Approval</h1>
            <p>Hello Admin,</p>
            <p>A new intern has been added and is pending your approval:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${data.internName}</p>
              <p><strong>Domain:</strong> ${data.domain}</p>
            </div>
            <p>Please login to review and approve or reject this intern.</p>
            <p>Best regards,<br>Karmel Infotech & Software Solution LLP</p>
          </div>
        `;
        break;
    }

    console.log(`Sending ${type} notification to ${recipientEmail}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Karmel Infotech <noreply@karmelinfotech.com>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
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