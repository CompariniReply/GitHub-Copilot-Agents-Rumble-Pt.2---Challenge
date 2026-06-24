import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Monitor, AlertCircle } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    let hasValidation = false;
    if (!email.trim()) {
      setEmailError("Campo obbligatorio");
      hasValidation = true;
    }
    if (!password.trim()) {
      setPasswordError("Campo obbligatorio");
      hasValidation = true;
    }
    if (hasValidation) return;

    const result = login(email, password);
    if (!result.success) {
      setError(result.error ?? "Errore sconosciuto");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Monitor className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Asset Management</CardTitle>
          <CardDescription>Inserisci le tue credenziali per accedere</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@azienda.it"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                aria-invalid={!!emailError}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                aria-invalid={!!passwordError}
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
            <Button type="submit" className="w-full">
              Accedi
            </Button>
          </form>
          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-muted-foreground text-center mb-2">Credenziali demo</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="rounded-md bg-muted p-2">
                <p className="font-medium">Admin</p>
                <p className="text-muted-foreground">mario.rossi@</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <p className="font-medium">Manager</p>
                <p className="text-muted-foreground">laura.bianchi@</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <p className="font-medium">Viewer</p>
                <p className="text-muted-foreground">marco.neri@</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
