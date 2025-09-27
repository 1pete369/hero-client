"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, FileText, RotateCcw } from "lucide-react";
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
    recurring: false,
    recurringFrequency: "monthly",
    recurringEndDate: "",
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
        recurring: transaction.recurring || false,
        recurringFrequency: transaction.recurringFrequency || "monthly",
        recurringEndDate: transaction.recurringEndDate
          ? formatDateForInput(transaction.recurringEndDate)
          : "",
        notes: transaction.notes || "",
      });
    } else {
      // Reset form for new transaction
      setFormData({
        type: "expense",
        amount: 0,
        category: "",
        description: "",
        date: getTodayLocal(),
        tags: [],
        recurring: false,
        recurringFrequency: "monthly",
        recurringEndDate: "",
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
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
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

    if (formData.recurring && !formData.recurringFrequency) {
      newErrors.recurringFrequency = "Recurring frequency is required";
    }

    if (formData.recurring && formData.recurringEndDate) {
      const endDate = new Date(formData.recurringEndDate);
      const startDate = new Date(formData.date);
      if (endDate <= startDate) {
        newErrors.recurringEndDate = "End date must be after start date";
      }
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
        tags: formData.tags,
        recurring: formData.recurring,
        recurringEndDate: formData.recurringEndDate || undefined,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
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
                onValueChange={(value: "income" | "expense") => handleInputChange("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
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
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
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

            <div className="space-y-1">
              <Label className="text-sm">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-sm">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter description"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
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
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 3}
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
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

          {/* Recurring and Notes Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => handleInputChange("recurring", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="recurring" className="text-sm">
                  Recurring
                </Label>
              </div>

              {formData.recurring && (
                <div className="space-y-2">
                  <Select
                    value={formData.recurringFrequency}
                    onValueChange={(value) => handleInputChange("recurringFrequency", value)}
                  >
                    <SelectTrigger className={errors.recurringFrequency ? "border-red-500" : ""}>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.recurringFrequency && (
                    <p className="text-xs text-red-500">{errors.recurringFrequency}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add notes..."
                rows={3}
                maxLength={200}
                className="text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
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
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
