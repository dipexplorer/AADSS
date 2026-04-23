require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// function validateInput(email, password) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   if (!emailRegex.test(email)) {
//     throw new Error("Invalid email format");
//   }

//   if (!password || password.length < 8) {
//     throw new Error("Password must be at least 8 characters long");
//   }
// }

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("❌ Usage: node script.js <email> <password>");
    process.exit(1);
  }

  try {
    // validateInput(email, password);

    console.log(`⏳ Creating admin account for: ${email}...`);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Acadence Admin",
      },
      app_metadata: { role: "admin" },
    });

    if (error) {
      if (error.message?.toLowerCase().includes("already")) {
        console.warn(`⚠️ User ${email} already exists.`);
        return;
      }
      throw error;
    }

    console.log("✅ Admin account created successfully.");
    console.log(`📧 Email: ${email}`);
    console.log("🔐 Password: [hidden]");
    console.log("\n➡️ Login at /admin/login");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

createAdmin();

// node create-admin.js [EMAIL_ADDRESS] [PASSWORD]
