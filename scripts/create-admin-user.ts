import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  const email = "ilazgashi258@gmail.com"
  const password = "IlazGashi123"

  try {
    // Create the user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return
    }

    console.log("Admin user created successfully!")
    console.log("User ID:", authData.user.id)
    console.log("Email:", authData.user.email)

    // Insert into admin_users table
    const { error: adminError } = await supabase.from("admin_users").insert({
      id: authData.user.id,
      email: email,
    })

    if (adminError) {
      console.error("Error inserting into admin_users table:", adminError)
      return
    }

    console.log("Admin record created in admin_users table!")
    console.log("\nYou can now login with:")
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

createAdminUser()
