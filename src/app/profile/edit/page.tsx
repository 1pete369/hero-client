"use client";

import { useAuth } from "@/context/useAuthContext";
import { profileService, UpdateProfileData } from "@/services/profile.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save, User, Mail, AtSign } from "lucide-react";
import { ChangeEvent, FormEvent, useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { authUser, checkAuth } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    username: authUser?.username || "",
    email: authUser?.email || "",
    profilePic: authUser?.profilePic || "",
    profilePicPublicId: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        username: authUser.username || "",
        email: authUser.email || "",
        profilePic: authUser.profilePic || "",
        profilePicPublicId: "",
      });
    }
  }, [authUser]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size must be less than 5MB"); return; }
    setIsUploadingImage(true);
    try {
      const response = await profileService.uploadProfilePicture(file);
      setFormData(prev => ({ ...prev, profilePic: response.imageUrl, profilePicPublicId: response.publicId }));
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        profilePic: formData.profilePic,
      };
      await profileService.updateProfile(updateData);
      await checkAuth();
      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.profilePicPublicId) {
      try { await profileService.deleteProfilePicture(formData.profilePicPublicId); } catch {}
    }
    setFormData(prev => ({ ...prev, profilePic: "", profilePicPublicId: "" }));
    toast.success("Profile picture removed!");
  };

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and profile picture</p>
        </div>

        <Card className="bg-white rounded border-3  border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Make changes to your profile here. Click save when you're done.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-2 ring-black">
                    <AvatarImage src={formData.profilePic} alt="Profile" />
                    <AvatarFallback className="text-lg">{formData.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button type="button" size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8  p-0 bg-white rounded-full border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                    {isUploadingImage ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Camera className="h-4 w-4" />)}
                  </Button>
                </div>
                {formData.profilePic && (
                  <Button type="button" variant="outline" size="sm" className="bg-white rounded border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" onClick={handleRemoveImage}>Remove</Button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2"><User className="h-4 w-4" />Full Name</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className={`${errors.fullName ? "border-red-500" : ""} border-3 rounded border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]`} />
                  {errors.fullName && (<p className="text-sm text-red-500">{errors.fullName}</p>)}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2"><AtSign className="h-4 w-4" />Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Enter your username" className={`${errors.username ? "border-red-500" : ""} border-3 rounded border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]`} />
                  {errors.username && (<p className="text-sm text-red-500">{errors.username}</p>)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />Email Address</Label>
                <Input id="email" name="email" disabled type="email" value={formData.email}  placeholder="Enter your email address" className={`${errors.email ? "border-red-500" : ""} border-3 rounded border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]`} />
                {errors.email && (<p className="text-sm text-red-500">{errors.email}</p>)}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  {isLoading ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Save className="h-4 w-4" />)}
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" className="bg-white text-gray-800 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
