"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Customer } from "@/lib/types"

interface AuthContextType {
  customer: Customer | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string; isAdmin?: boolean }>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadCustomer = useCallback(async (userId: string) => {
    // Check if this is an admin
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .single()

    if (adminCheck) {
      setCustomer(null)
      return
    }

    // Try to get customer record
    let { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("id", userId)
      .single()

    // If no customer record exists, create one from auth user data
    if (!customerData) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            id: user.id,
            email: user.email!,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
          })
          .select()
          .single()
        customerData = newCustomer
      }
    }

    setCustomer(customerData)
  }, [supabase])

  const refreshCustomer = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await loadCustomer(user.id)
    }
  }, [supabase, loadCustomer])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await loadCustomer(user.id)
      }
      setIsLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadCustomer(session.user.id)
      } else {
        setCustomer(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    // Check if this user is an admin
    if (data.user) {
      const { data: adminCheck } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (adminCheck) {
        return { isAdmin: true }
      }
    }

    return {}
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    })
    if (error) return { error: error.message }

    // If auto-confirmed (no email verification required), create customer record immediately
    if (data.user && data.session) {
      await supabase.from("customers").upsert({
        id: data.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
      }, { onConflict: "id" })
    }

    return {}
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCustomer(null)
  }

  return (
    <AuthContext.Provider
      value={{ customer, isLoggedIn: !!customer, isLoading, login, register, logout, refreshCustomer }}
    >
      {children}
    </AuthContext.Provider>
  )
}
