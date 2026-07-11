"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Spinner } from "../../../components/ui/Spinner";

const portalSchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres"),
  description: z.string().optional().or(z.literal("")),
});

type PortalForm = z.infer<typeof portalSchema>;

export default function SettingsPage() {
  const [portalMsg, setPortalMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const portalForm = useForm<PortalForm>({
    resolver: zodResolver(portalSchema),
    defaultValues: { name: "", description: "" },
  });

  // Carregar configurações do portal
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ name: string; description?: string | null }>("/portal/settings");
        if (res.success) {
          portalForm.reset({
            name: res.data.name,
            description: res.data.description || "",
          });
        }
      } catch {
        // usa valores padrão
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [portalForm]);

  const onPortalSubmit = async (data: PortalForm) => {
    setSaving(true);
    setPortalMsg("");
    try {
      const res = await api.put("/portal/settings", data);
      if (res.success) {
        setPortalMsg("Configurações salvas com sucesso!");
      } else {
        setPortalMsg(res.error?.message || "Erro ao salvar");
      }
    } catch {
      setPortalMsg("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portal</h2>
        <form onSubmit={portalForm.handleSubmit(onPortalSubmit)} className="space-y-4">
          <Input
            label="Nome do Portal"
            error={portalForm.formState.errors.name?.message}
            {...portalForm.register("name")}
          />
          <Input
            label="Descrição"
            error={portalForm.formState.errors.description?.message}
            {...portalForm.register("description")}
          />
          {portalMsg && (
            <p className={`text-sm ${portalMsg.includes("Erro") ? "text-red-600" : "text-green-600"}`}>
              {portalMsg}
            </p>
          )}
          <Button type="submit" loading={saving}>Salvar</Button>
        </form>
      </Card>
    </div>
  );
}
