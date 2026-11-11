/**
 * Creates (or promotes) an admin account.
 *
 *   ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='a-long-unique-password' npx tsx scripts/create-admin-user.ts
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
 * Credentials are never hard-coded and never printed.
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

if (!supabaseUrl || !serviceRoleKey) fail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
if (!email) fail("Set ADMIN_EMAIL.")

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserId(target: string): Promise<string | null> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Could not list users: ${error.message}`)
    const match = data.users.find((u) => u.email?.toLowerCase() === target)
    if (match) return match.id
    if (data.users.length < 200) return null
  }
  return null
}

async function main() {
  let userId = await findUserId(email!)

  if (!userId) {
    if (!password || password.length < 12) fail("New admins need ADMIN_PASSWORD with at least 12 characters.")
    const { data, error } = await supabase.auth.admin.createUser({ email: email!, password, email_confirm: true })
    if (error) fail(`Could not create user: ${error.message}`)
    userId = data.user.id
    console.log(`✔ Created auth user ${email}`)
  } else {
    console.log(`• ${email} already exists, promoting to admin`)
  }

  const { error } = await supabase.from("admin_users").upsert({ id: userId, email: email! }, { onConflict: "id" })
  if (error) fail(`Could not write admin_users: ${error.message}`)

  console.log(`✔ ${email} is an admin`)
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)))
