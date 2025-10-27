"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  financeService,
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  ALL_CATEGORIES,
} from "@/services/finance.service";
import toast from "react-hot-toast";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSuccess: () => void;
}

export default function TransactionForm({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateTransactionData>({
    type: "expense",
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    tags: [],
    notes: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to format date for input (local timezone)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get today's date in local timezone
  const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: formatDateForInput(transaction.date),
        tags: transaction.tags || [],
        notes: transaction.notes || "",
      });
    } else {
      // Reset form for new transaction
      const defaultCategory = (ALL_CATEGORIES.expense[0]?.value) || ""
      setFormData({
        type: "expense",
        amount: 0,
        category: defaultCategory,
        description: "",
        date: getTodayLocal(),
        tags: [],
        notes: "",
      });
    }
    setTagInput("");
    setErrors({});
  }, [transaction, isOpen]);

  const handleInputChange = (field: keyof CreateTransactionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && formData.tags && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = "Transaction type is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Convert date to proper format for backend (YYYY-MM-DD)
      const submitData = {
        ...formData,
        amount: Number(formData.amount),
        date: formData.date, // Already in YYYY-MM-DD format
        tags: formData.tags || [],
      };

      if (transaction) {
        await financeService.updateTransaction(transaction._id, submitData as UpdateTransactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await financeService.createTransaction(submitData);
        toast.success("Transaction created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving transaction:", error);
      const errorMessage = error.response?.data?.message || "Failed to save transaction";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableCategories = () => {
    return formData.type === "income" 
      ? ALL_CATEGORIES.income 
      : ALL_CATEGORIES.expense;
  };

  const getCategoriesForType = (t: "income" | "expense") =>
    t === "income" ? ALL_CATEGORIES.income : ALL_CATEGORIES.expense

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row - Type and Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") => {
                  const nextCats = getCategoriesForType(value)
                  const currentValid = nextCats.some(c => c.value === formData.category)
                  const nextCategory = currentValid ? formData.category : (nextCats[0]?.value || "")
                  setFormData(prev => ({ ...prev, type: value, category: nextCategory }))
                  if (errors.type) setErrors(prev => ({ ...prev, type: "" }))
                  if (errors.category) setErrors(prev => ({ ...prev, category: "" }))
                }}
              >
                <SelectTrigger className={`border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${errors.type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className={`border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCategories().map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-sm">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter description"
              className={`border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Advanced */}
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger>Advanced settings</AccordionTrigger>
              <AccordionContent>
                {/* Date */}
                <div className="space-y-1 mb-3">
                  <Label className="text-sm">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${errors.date ? 'border-red-500' : ''}`}
                  />
                  {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                </div>
                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-sm">Tags (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add tag"
                      maxLength={20}
                      className="text-sm border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || (formData.tags?.length || 0) >= 3}
                      className="border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                    >
                      Add
                    </Button>
                  </div>
                  {(formData.tags?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(formData.tags || []).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs border-3 border-black"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1 mt-3">
                  <Label className="text-sm">Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    maxLength={200}
                    className="text-sm border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              size="sm"
            >
              {isLoading ? "Saving..." : transaction ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              size="sm"
              className="flex-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
