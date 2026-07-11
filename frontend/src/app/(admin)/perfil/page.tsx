"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../../lib/auth";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { User } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres"),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Senha atual é obrigatória"),
  new_password: z.string().min(8, "Mínimo de 8 caracteres").regex(/[A-Z]/, "Precisa de maiúscula").regex(/[0-9]/, "Precisa de número"),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const res = await api.put("/users/profile", data);
      if (res.success) {
        setProfileMsg("Perfil atualizado!");
        refreshUser();
      }
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true);
    setPasswordMsg("");
    try {
      const res = await api.put("/users/change-password", data);
      if (res.success) {
        setPasswordMsg("Senha alterada!");
        passwordForm.reset({ current_password: "", new_password: "" });
      }
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{user?.role?.name}</span>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Nome"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register("name")}
          />
          {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}
          <Button type="submit" loading={profileLoading}>Salvar Perfil</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Senha Atual"
            type="password"
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register("current_password")}
          />
          <Input
            label="Nova Senha"
            type="password"
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register("new_password")}
          />
          {passwordMsg && <p className={`text-sm ${passwordMsg.includes("Erro") ? "text-red-600" : "text-green-600"}`}>{passwordMsg}</p>}
          <Button type="submit" loading={passwordLoading}>Alterar Senha</Button>
        </form>
      </Card>
    </div>
  );
}
