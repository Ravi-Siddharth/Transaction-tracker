
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API = "http://localhost:5000/api";

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    image: "",
  });
  const [formData, setFormData] = useState(profile);
  const [profileImage, setProfileImage] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API}/profile`, {
          headers: authHeaders,
        });

        const data = response.data;

        const loadedProfile = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          image: "",
        };

        setProfile(loadedProfile);
        setFormData(loadedProfile);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage(
          error.response?.data?.error || "Unable to load profile."
        );
      }
    };

    if (token) {
      loadProfile();
    } else {
      setMessage("Please log in to view your profile.");
    }
  }, [token]);

  
  useEffect(() => {
    if (!token) return;

    let imageUrl;

    const loadProfilePicture = async () => {
      try {
        const response = await axios.get(
          `${API}/profile-picture`,
          {
            headers: authHeaders,
            responseType: "blob",
          }
        );

        imageUrl = URL.createObjectURL(response.data);

        setProfile((prev) => ({ ...prev, image: imageUrl }));
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      } catch (error) {
        
        if (error.response?.status !== 404) {
          console.error("Failed to load profile picture:", error);
        }
      }
    };

    loadProfilePicture();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (!selectedImage) return;

    if (!selectedImage.type.startsWith("image/")) {
      alert("Please select an image.");
      e.target.value = "";
      return;
    }

    if (selectedImage.size > 1024 * 1024) {
      alert("Please select an image smaller than 1 MB.");
      e.target.value = "";
      return;
    }

    setProfileImage(selectedImage);

    const previewUrl = URL.createObjectURL(selectedImage);

    setFormData((prev) => ({
      ...prev,
      image: previewUrl,
    }));
  };

  const handleEdit = () => {
    setFormData(profile);
    setProfileImage(null);
    setIsEditing(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

    
      await axios.put(
        `${API}/profile`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
        { headers: authHeaders }
      );

  
      if (profileImage) {
        const data = new FormData();
        data.append("file", profileImage);

        await axios.put(`${API}/profile-picture`, data, {
          headers: authHeaders,
        });
      }

      
      const response = await axios.get(`${API}/profile`, {
        headers: authHeaders,
      });

      const updatedProfile = {
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        email: response.data.email || "",
        image: formData.image,
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setProfileImage(null);
      setIsEditing(false);
      setMessage("Profile saved successfully!");
    } catch (error) {
      console.error("Profile save error:", error);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to save profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setProfileImage(null);
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();
      data.append("file", file);

      await axios.post(`${API}/Upload`, data, {
        headers: authHeaders,
      });

      setMessage("File saved successfully in MongoDB!");
      setFile(null);
    } catch (error) {
      console.error("File upload error:", error);
      setMessage(
        error.response?.data?.error || "File upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-heading">
          <h2>My Profile</h2>

          {!isEditing && (
            <button
              type="button"
              className="edit-btn"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSave}>
          
<div className="profile-image-box">
  <h3>Profile Picture</h3>

  {formData.image ? (
   <img
  src={formData.image}
  alt="Profile"
  className="profile-photo"
  onClick={() => setShowImageModal(true)}
  title="Click to view full image"
/>
  ) : (
    <div className="profile-placeholder">
      {formData.firstName
        ? formData.firstName.charAt(0).toUpperCase()
        : "?"}
    </div>
  )}

  {isEditing && (
    <div className="profile-picture-edit">
      <label htmlFor="profilePicture">
        Change Profile Picture
      </label>

      <input
        id="profilePicture"
        type="file"
        accept="image/*"
        onChange={handleProfileImageChange}
      />

      {profileImage && <p>{profileImage.name}</p>}
    </div>
  )}
</div>
          <div className="profile-info">
            <div className="profile-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>

            <div className="profile-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>

            <div className="profile-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        <div className="upload-section">
          <h3>Upload File</h3>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
          />

          {file && <p>Selected: {file.name}</p>}

          <button
            type="button"
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>

          {message && <p className="upload-message">{message}</p>}
        </div>

        <button
          type="button"
          className="dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
      {showImageModal && formData.image && (
  <div
    className="image-modal-overlay"
    onClick={() => setShowImageModal(false)}
  >
    <div
      className="image-modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="image-modal-close"
        onClick={() => setShowImageModal(false)}
        aria-label="Close image"
      >
        &times;
      </button>

      <img
        src={formData.image}
        alt="Full-size profile"
        className="image-modal-full"
      />
    </div>
  </div>
)}
    </div>
  );
}

export default Profile;