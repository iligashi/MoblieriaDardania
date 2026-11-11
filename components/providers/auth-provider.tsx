"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Customer } from "@/lib/types"

interface AuthContextType {
  user: User | null
  customer: Customer | null
  isAdmin: boolean
  /** True for signed-in shoppers (admins browsing the shop are treated as guests). */
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string; isAdmin?: boolean }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email-i ose fjalëkalimi është i pasaktë.",
  "Email not confirmed": "Ju lutem konfirmoni email-in tuaj para se të kyçeni.",
  "User already registered": "Ekziston tashmë një llogari me këtë email.",
}

const translate = (message: string) => AUTH_ERRORS[message] || message

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(
    async (authUser: User | null) => {
      setUser(authUser)
      if (!authUser) {
        setCustomer(null)
        setIsAdmin(false)
        return
      }

      const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", authUser.id).maybeSingle()
      if (adminRow) {
        setIsAdmin(true)
        setCustomer(null)
        return
      }
      setIsAdmin(false)

      let { data: profile } = await supabase.from("customers").select("*").eq("id", authUser.id).maybeSingle()

      // Older accounts may not have a profile row yet: create one (RLS allows only your own id).
      if (!profile && authUser.email) {
        const { data: created } = await supabase
          .from("customers")
          .upsert(
            {
              id: authUser.id,
              email: authUser.email,
              first_name: authUser.user_metadata?.first_name || null,
              last_name: authUser.user_metadata?.last_name || null,
            },
            { onConflict: "id" },
          )
          .select()
          .maybeSingle()
        profile = created
      }

      setCustomer(profile ?? null)
    },
    [supabase],
  )

  const refreshCustomer = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    await loadProfile(authUser)
  }, [supabase, loadProfile])

  useEffect(() => {
    let active = true

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      await loadProfile(data.user)
      if (active) setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return
      // Defer Supabase calls out of the auth callback (recommended by supabase-js).
      setTimeout(() => {
        if (active) loadProfile(session?.user ?? null)
      }, 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  const login = useCallback<AuthContextType["login"]>(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) return { error: translate(error.message) }

      const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", data.user.id).maybeSingle()
      await loadProfile(data.user)
      return adminRow ? { isAdmin: true } : {}
    },
    [supabase, loadProfile],
  )

  const register = useCallback<AuthContextType["register"]>(
    async (email, password, firstName, lastName) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { first_name: firstName.trim(), last_name: lastName.trim() },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      })
      if (error) return { error: translate(error.message) }
      if (!data.session) return { needsConfirmation: true }
      await loadProfile(data.user)
      return {}
    },
    [supabase, loadProfile],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    await loadProfile(null)
  }, [supabase, loadProfile])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      customer,
      isAdmin,
      isLoggedIn: !!user && !isAdmin,
      isLoading,
      login,
      register,
      logout,
      refreshCustomer,
    }),
    [user, customer, isAdmin, isLoading, login, register, logout, refreshCustomer],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
