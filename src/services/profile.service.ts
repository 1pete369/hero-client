import { axiosAppInstance } from "@/lib/axiosAppInstance";

export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePic?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  email?: string;
  profilePic?: string;
}

export const profileService = {
  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await axiosAppInstance.put("/auth/profile", data);
    return response.data;
  },

  // Upload profile picture to Cloudinary
  uploadProfilePicture: async (file: File): Promise<{ imageUrl: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosAppInstance.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      imageUrl: response.data.imageUrl,
      publicId: response.data.publicId,
    };
  },

  // Delete profile picture from Cloudinary
  deleteProfilePicture: async (publicId: string): Promise<void> => {
    await axiosAppInstance.delete('/upload/image', {
      data: { publicId },
    });
  },
};
