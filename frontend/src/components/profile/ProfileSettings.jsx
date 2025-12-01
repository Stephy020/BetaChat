import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileSettings = ({ onClose }) => {
    const { authUser, setAuthUser } = useAuthContext();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        try {
            // 1. Get signed URL and public URL
            const resUrl = await fetch(`/api/users/profile-url?fileType=${file.type}`);
            const dataUrl = await resUrl.json();
            if (dataUrl.error) throw new Error(dataUrl.error);

            // 2. Upload to S3 using signed URL
            const uploadRes = await fetch(dataUrl.signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) throw new Error("Failed to upload image");

            // 3. Update backend with the public URL
            // The backend already returned the publicUrl, so we use that
            const resUpdate = await fetch("/api/users/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profilePic: dataUrl.publicUrl })
            });
            const dataUpdate = await resUpdate.json();
            if (dataUpdate.error) throw new Error(dataUpdate.error);

            // Update both state and localStorage
            const updatedUser = { ...authUser, profilePic: dataUpdate.user.profilePic };
            setAuthUser(updatedUser);
            localStorage.setItem("chat-user", JSON.stringify(updatedUser));

            toast.success("Profile updated successfully");
            onClose();

        } catch (error) {
            console.error("Error uploading profile:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold text-white mb-4">Update Profile Picture</h2>

                <div className="flex flex-col items-center gap-4">
                    <div className="avatar">
                        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={file ? URL.createObjectURL(file) : authUser.profilePic} alt="Profile" />
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                    />

                    <div className="flex gap-2 w-full mt-4">
                        <button
                            className="btn btn-error flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary flex-1"
                            onClick={handleUpload}
                            disabled={!file || loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
