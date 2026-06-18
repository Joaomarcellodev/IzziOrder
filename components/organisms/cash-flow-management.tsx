"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Loader2,
  Search,
  Tag,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/molecules/dropdown-menu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/molecules/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/molecules/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/molecules/dialog";
import {
  createCashFlowEntry,
  updateCashFlowEntry,
  deleteCashFlowEntry,
  getCurrentCashTotal,
  closeCashRegister
} from "@/app/actions/cash-flow-actions";
import {
  createCashEntryCategory,
  updateCashEntryCategory,
  deleteCashEntryCategory
} from "@/app/actions/cash-entry-category-actions";
import { Popover, PopoverContent, PopoverTrigger } from "../atoms/popover";
import { CategoryManagement } from "./menu-management/category-management";
import { getCategories } from "@/app/actions/category-actions";

interface CashFlowManagementProps {
  initialEntries: any[];
  initialCategories: any[];
  initialTotal: number;
}

export function CashFlowManagement({
  initialEntries,
  initialCategories,
  initialTotal
}: CashFlowManagementProps) {
  const [entries, setEntries] = useState<any[]>(initialEntries);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [total, setTotal] = useState<number>(initialTotal);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("cash-flow");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});

  const toggleExpandedDate = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }))
  }

  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  // Entry Modal States
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [entryForm, setEntryForm] = useState({
    description: "",
    categoryId: "",
    amount: "",
    type: "revenue" // "revenue" = positive, "expense" = negative
  });

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Close Register Modal States
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);

  // Stats Calculations
  const totalRevenues = entries
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = entries
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  // Filtered Entries
  const filteredEntries = entries.filter(e =>
    (e.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group entries by date (YYYY-MM-DD)
  const getGroupedEntries = () => {
    const groups: { [key: string]: { entries: any[]; dailyBalance: number } } = {};

    filteredEntries.forEach(entry => {
      const dateKey = entry.createdAt
        ? new Date(entry.createdAt).toLocaleDateString("pt-BR")
        : "Sem Data";

      if (!groups[dateKey]) {
        groups[dateKey] = { entries: [], dailyBalance: 0 };
      }

      groups[dateKey].entries.push(entry);
      groups[dateKey].dailyBalance += entry.amount;
    });

    // Sort dates descending
    const sortedGroups = Object.entries(groups).sort((a, b) => {
      if (a[0] === "Sem Data") return 1;
      if (b[0] === "Sem Data") return -1;
      const dateA = a[0].split("/").reverse().join("-");
      const dateB = b[0].split("/").reverse().join("-");
      return dateB.localeCompare(dateA);
    });

    // Sort entries within each group descending by creation time (most recent first)
    sortedGroups.forEach(([_, data]) => {
      data.entries.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    });

    return sortedGroups;
  };

  // Handlers for Entry CRUD
  const openAddEntryModal = () => {
    if (categories.length === 0) {
      toast.error("Por favor, crie pelo menos uma categoria antes de adicionar lançamentos.");
      setActiveTab("categories");
      return;
    }
    setEditingEntry(null);
    setEntryForm({
      description: "",
      categoryId: categories[0]?.id || "",
      amount: "",
      type: "revenue"
    });
    setIsEntryModalOpen(true);
  };

  const openEditEntryModal = (entry: any) => {
    setEditingEntry(entry);
    setEntryForm({
      description: entry.description || "",
      categoryId: entry.entryCategoryId || "",
      amount: Math.abs(entry.amount).toString(),
      type: entry.amount >= 0 ? "revenue" : "expense"
    });
    setIsEntryModalOpen(true);
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.categoryId) {
      toast.error("Por favor, selecione uma categoria.");
      return;
    }
    const rawVal = parseFloat(entryForm.amount);
    if (isNaN(rawVal) || rawVal <= 0) {
      toast.error("O valor deve ser maior que zero.");
      return;
    }

    const finalAmount = entryForm.type === "expense" ? -rawVal : rawVal;
    setIsLoading(true);

    try {
      if (editingEntry) {
        // Update
        const updated = await updateCashFlowEntry(editingEntry.id, {
          description: entryForm.description,
          entry_category_id: entryForm.categoryId,
          amount: finalAmount
        });
        setEntries(prev => prev.map(item => item.id === editingEntry.id ? updated : item));
        toast.success("Lançamento atualizado com sucesso.");
      } else {
        // Create
        const created = await createCashFlowEntry({
          description: entryForm.description,
          entry_category_id: entryForm.categoryId,
          amount: finalAmount
        });
        setEntries(prev => [created, ...prev]);
        toast.success("Lançamento adicionado com sucesso.");
      }

      // Refresh Total
      const updatedTotal = await getCurrentCashTotal();
      setTotal(updatedTotal);
      setIsEntryModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar lançamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id: any) => {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    setIsLoading(true);
    try {
      await deleteCashFlowEntry(id);
      setEntries(prev => prev.filter(item => item.id !== id));
      toast.success("Lançamento excluído com sucesso.");

      const updatedTotal = await getCurrentCashTotal();
      setTotal(updatedTotal);
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir lançamento.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for Category CRUD
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: any) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("O nome da categoria é obrigatório.");
      return;
    }
    setIsLoading(true);
    try {
      if (editingCategory) {
        const updated = await updateCashEntryCategory(editingCategory.id, { name: categoryName });
        setCategories(prev => prev.map(item => item.id === editingCategory.id ? updated : item));
        toast.success("Categoria atualizada com sucesso.");
      } else {
        const created = await createCashEntryCategory({ name: categoryName });
        setCategories(prev => [...prev, created]);
        toast.success("Categoria criada com sucesso.");
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: any) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    setIsLoading(true);
    try {
      await deleteCashEntryCategory(id);
      setCategories(prev => prev.filter(item => item.id !== id));
      toast.success("Categoria excluída com sucesso.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for Close Register
  const handleCloseRegister = async () => {
    setIsLoading(true);
    try {
      await closeCashRegister();
      setEntries([]);
      setTotal(0);
      toast.success("Caixa fechado com sucesso!");
      setIsCloseRegisterOpen(false);
    } catch (err: any) {
      // The error message from the action will notify about open orders
      toast.error(err.message || "Erro ao fechar o caixa.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-lg border border-gray-200 mb-6">
          <TabsTrigger value="cash-flow" className="px-6 py-2">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="categories" className="px-6 py-2">Categorias</TabsTrigger>
        </TabsList>

        {/* Cash Flow Entries Tab */}
        <TabsContent value="cash-flow">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Histórico de Lançamentos</CardTitle>
                <CardDescription>Visualização detalhada das receitas e despesas.</CardDescription>
              </div>

              {/* Top Header Card with Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Caixa</h2>
                  <p className="text-sm text-gray-500">Acompanhe e registre a movimentação financeira em tempo real.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={openAddEntryModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Novo Lançamento
                  </Button>
                  <Button
                    onClick={() => setIsCloseRegisterOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    <Lock className="w-4 h-4" /> Fechar Caixa
                  </Button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Cash Card */}
                <Card className="shadow-sm border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">Saldo no Caixa</span>
                        <h3 className={`text-3xl font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
                          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </h3>
                      </div>
                      <div className={`p-3 rounded-full ${total >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        <Wallet className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Income */}
                <Card className="shadow-sm border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">Total Receitas</span>
                        <h3 className="text-3xl font-bold text-green-600">
                          R$ {totalRevenues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </h3>
                      </div>
                      <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Expenses */}
                <Card className="shadow-sm border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">Total Despesas</span>
                        <h3 className="text-3xl font-bold text-red-600">
                          R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </h3>
                      </div>
                      <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Nenhum lançamento encontrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3">Hora</th>
                        <th className="px-1 py-3 hidden md:table-cell">Descrição</th>
                        <th className="px-1 py-3">Categoria</th>
                        <th className="px-1 py-3 text-right">Valor</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getGroupedEntries().map(([dateLabel, groupData]) => (
                        <React.Fragment key={dateLabel}>
                          {/* Group Header Row */}
                          <tr className="bg-gray-100/80 border-y border-gray-200">
                            <td colSpan={5} className="px-3 py-2">
                              <div className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleExpandedDate(dateLabel)}
                              >
                                <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                  {expandedDates[dateLabel] ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  {dateLabel}
                                </span>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Saldo:{" "}
                                  <span className={groupData.dailyBalance >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                    R$ {groupData.dailyBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </span>
                                </span>
                              </div>
                            </td>
                          </tr>
                          {/* Grouped Rows */}
                          {expandedDates[dateLabel] &&
                            groupData.entries.map((e: any) => {
                              const categoryName = categories.find(c => c.id === e.entryCategoryId)?.name || "Sem categoria";
                              const formattedTime = e.createdAt
                                ? new Date(e.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                                : "N/A";
                              return (
                                <tr className="hover:bg-gray-50/50 cursor-pointer"
                                  key={e.id}
                                  onClick={() => setSelectedRow(selectedRow === e.id ? null : e.id)}
                                >
                                  <td className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{formattedTime}</td>
                                  <td className="px-1 py-2 text-gray-900 font-medium hidden md:table-cell">{e.description || <span className="italic text-gray-400">Sem descrição</span>}</td>
                                  <td className="px-1 py-2">
                                    <span className="px-2.5 py-2 bg-white border border-gray-200 text-gray-600 rounded-md font-medium text-xs">
                                      {categoryName}
                                    </span>
                                  </td>
                                  <td className={`px-1 py-2 text-right font-bold ${e.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {e.amount >= 0 ? "+" : "-"} R$ {Math.abs(e.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2 text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem onClick={() => openEditEntryModal(e)} className="cursor-pointer gap-2">
                                          <Edit2 className="w-4 h-4 text-blue-600" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteEntry(e.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-2">
                                          <Trash2 className="w-4 h-4" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              )
                            })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryManagement categories={categories}
            onAddCategory={openAddCategoryModal}
            onEditCategory={openEditCategoryModal}
            onDeleteCategory={handleDeleteCategory} />
        </TabsContent>
      </Tabs>

      {/* dialog for Entry Creation/Edition */}
      <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <form onSubmit={handleEntrySubmit}>
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
              <DialogDescription>Preencha os dados abaixo para registrar a movimentação.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Type Switcher */}
              <div className="space-y-2">
                <Label>Tipo de Lançamento</Label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEntryForm(prev => ({ ...prev, type: "revenue" }))}
                    className={`py-2 text-sm font-semibold rounded-md transition-all ${entryForm.type === "revenue"
                      ? "bg-green-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    Receita (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryForm(prev => ({ ...prev, type: "expense" }))}
                    className={`py-2 text-sm font-semibold rounded-md transition-all ${entryForm.type === "expense"
                      ? "bg-red-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    Despesa (Saída)
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Venda de almoço, Conta de Luz..."
                  value={entryForm.description}
                  onChange={e => setEntryForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={entryForm.categoryId}
                  onChange={e => setEntryForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={entryForm.amount}
                  onChange={e => setEntryForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEntryModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog for Category Creation/Edition */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <form onSubmit={handleCategorySubmit}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              <DialogDescription>Digite o nome da categoria para registrar movimentações.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Nome da Categoria</Label>
                <Input
                  id="catName"
                  placeholder="Ex: Suprimentos, Aluguel, Vendas..."
                  required
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog for Close Register Confirmation */}
      <Dialog open={isCloseRegisterOpen} onOpenChange={setIsCloseRegisterOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Fechar Caixa
            </DialogTitle>
            <DialogDescription>
              Atenção: Esta operação irá fechar o caixa e limpar o saldo e lançamentos do dia.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-600">
            Deseja mesmo encerrar o caixa atual? Certifique-se de que não há pedidos em aberto no sistema.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCloseRegisterOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCloseRegister}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
