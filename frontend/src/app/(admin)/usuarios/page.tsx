"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/badge";
import { Spinner } from "../../../components/ui/Spinner";
import { toast } from "../../../components/ui/use-toast";
import { formatDateTime } from "../../../lib/utils";
import type { User } from "../../../types";

const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres").regex(/[A-Z]/, "Precisa de maiúscula").regex(/[0-9]/, "Precisa de número"),
  name: z.string().min(2, "Mínimo de 2 caracteres"),
  role_id: z.string().min(1, "Selecione uma role"),
});

type UserForm = z.infer<typeof userSchema>;

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  // Load users and roles
  useEffect(() => {
    async function load() {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get<User[]>("/users"),
          api.get<{ id: string; name: string }[]>("/auth/roles"),
        ]);
        setUsers(usersRes.data || []);
        setRoles(rolesRes.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const openCreate = () => {
    setEditingUser(null);
    reset({ email: "", password: "", name: "", role_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    reset({ email: u.email, password: "", name: u.name, role_id: u.role.id });
    setDialogOpen(true);
  };

  const onSubmit = async (data: UserForm) => {
    try {
      if (editingUser) {
        const res = await api.put(`/users/${editingUser.id}`, {
          name: data.name,
          role_id: data.role_id,
        });
        if (res.success && res.data) {
          setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...(res.data as Partial<User>) } : u));
        }
      } else {
        const res = await api.post<User>("/users", data);
        if (res.success) {
          setUsers((prev) => [...prev, res.data]);
        }
      }
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      const res = await api.put(`/users/${u.id}`, { active: !u.active });
      if (res.success) {
        setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, active: !x.active } : x));
        toast({ title: u.active ? "Usuário desativado" : "Usuário ativado", variant: "success" });
      }
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role",
      render: (u: User) => <StatusBadge status={u.role.name} />,
    },
    { key: "active", header: "Ativo",
      render: (u: User) => u.active ? "Sim" : "Não",
    },
    { key: "lastLoginAt", header: "Último Login",
      render: (u: User) => u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-",
    },
    { key: "actions", header: "Ações", className: "text-right",
      render: (u: User) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleActive(u)}>
            {u.active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {loading ? <Spinner className="py-12" /> : <DataTable columns={columns} data={filteredUsers} />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nome" error={errors.name?.message} {...register("name")} />
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            {!editingUser && (
              <Input label="Senha" type="password" error={errors.password?.message} {...register("password")} />
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Role</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("role_id")}
              >
                <option value="">Selecione...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.role_id?.message && <p className="text-sm text-destructive">{errors.role_id.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={false}>
                {editingUser ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
