import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      await signup(email, password);
      toast({ title: "Success", description: "Signup complete!" });
      setLocation("/dashboard");
    } catch (err) {
      toast({ title: "Signup Failed", description: "Could not create account", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required />
          </div>

          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
      </Card>
    </div>
  );
}
