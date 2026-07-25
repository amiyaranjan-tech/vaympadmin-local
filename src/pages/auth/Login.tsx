import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import useAuth from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();

  const { login, isAuthed, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthed) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthed, navigate]);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: Form) => {
    try {
      const success = await login(values.username, values.password);

      if (!success) {
        toast.error("Invalid username or password");
        return;
      }

      toast.success("Welcome back!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error("Unable to login.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-secondary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_50%)]" />

        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="text-xl font-bold tracking-tight">Vaymp</div>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              The hyperlocal
              <br />
              fashion marketplace.
            </h1>

            <p className="mt-4 max-w-md text-base text-white/80">
              Manage sellers, curate collections, launch neighborhood drops and
              run the full commerce loop from one command center.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              ["1.2K+", "Sellers"],
              ["58K", "Products"],
              ["12", "Cities"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 p-4 backdrop-blur"
              >
                <div className="text-2xl font-bold">{value}</div>

                <div className="text-xs text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>

              <span className="text-lg font-bold">Vaymp</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your admin console.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>

              <Input
                id="username"
                placeholder="admin"
                className="h-11 rounded-xl"
                {...form.register("username")}
              />

              {form.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl"
                {...form.register("password")}
              />

              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full rounded-xl text-sm font-semibold"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
