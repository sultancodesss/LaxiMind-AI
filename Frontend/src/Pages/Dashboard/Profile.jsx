import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Camera, Save, RefreshCw, CheckCircle, AlertCircle, Mail, Edit3, Shield } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://laximind-ai.onrender.com"
).replace(/\/$/, "");

function Profile() {
  const { user, updateUser, getToken } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [loadingName, setLoadingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);

  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoadingName(true);
    setNameError("");
    setNameSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to update profile name.";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // Ignore if not JSON
        }
        throw new Error(errorMsg);
      }

      updateUser({ name });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err.message);
    } finally {
      setLoadingName(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingAvatar(true);
    setAvatarError("");
    setAvatarSuccess(false);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`${API_URL}/api/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Failed to upload avatar.";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // Ignore if not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      updateUser({ avatar_url: data.avatar_url });
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setLoadingAvatar(false);
    }
  };

  return (
    <div className="profile-view-container">
      <div style={{ marginBottom: "32px" }}>
        <h2 className="profile-header-gradient">Account Profile</h2>
        <p className="profile-subtitle">
          Personalize your identity and manage account settings
        </p>
      </div>

      <div style={{ maxWidth: "100%" }}>
        {/* Profile Header Card */}
        <div className="profile-card">
          {/* Banner */}
          <div className="profile-banner">
            <div className="profile-banner-overlay"></div>
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
              opacity: 0.3,
              mixBlendMode: "overlay"
            }}></div>
          </div>
          
          <div className="profile-content">
            <div className="profile-avatar-row">
              
              {/* Avatar Container */}
              <div 
                className="profile-avatar-container" 
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL}${user.avatar_url}`} 
                    alt="Avatar" 
                    className="profile-avatar-img"
                  />
                ) : (
                  <span className="profile-avatar-initials">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "LM"}
                  </span>
                )}
                
                {/* Hover Overlay */}
                <div className="profile-avatar-hover">
                  {loadingAvatar ? (
                    <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <>
                      <Camera size={24} style={{ marginBottom: "4px" }} />
                      <span>Update Photo</span>
                    </>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  style={{ display: "none" }} 
                />
              </div>

              {/* Profile Info */}
              <div className="profile-info">
                <h3 className="profile-name">{user?.name || "User"}</h3>
                <div className="profile-badge">
                  <Shield size={14} />
                  <span>Verified Member</span>
                </div>
              </div>
            </div>

            {/* Avatar Status Messages */}
            <div style={{ marginTop: "24px" }}>
              {avatarError && (
                <div className="profile-alert profile-alert-error" style={{ margin: 0 }}>
                  <AlertCircle size={16} /> {avatarError}
                </div>
              )}
              {avatarSuccess && (
                <div className="profile-alert profile-alert-success" style={{ margin: 0 }}>
                  <CheckCircle size={16} /> Profile picture updated!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form Section */}
        <div className="profile-edit-section">
          <div style={{ marginBottom: "32px" }}>
            <h3 className="profile-section-title">
              <User size={20} color="#a855f7" />
              Personal Details
            </h3>
            <p className="profile-section-desc">Update your personal information below.</p>
          </div>

          <form onSubmit={handleNameUpdate}>
            <div className="profile-form-grid">
              {/* Name Input */}
              <div className="profile-input-group">
                <label className="profile-label">
                  Display Name
                </label>
                <div className="profile-input-wrapper">
                  <User size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-input"
                    placeholder="Enter your display name"
                    required
                  />
                </div>
              </div>
              
              {/* Email Input (Disabled) */}
              <div className="profile-input-group">
                <label className="profile-label">
                  Email Address
                </label>
                <div className="profile-input-wrapper">
                  <Mail size={16} className="profile-input-icon" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="profile-input"
                  />
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Primary email cannot be changed.
                </p>
              </div>
            </div>

            <div style={{ 
              marginTop: "24px", 
              paddingTop: "24px", 
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <button 
                type="submit" 
                className="profile-btn-save"
                disabled={loadingName || name === user?.name}
                style={{ marginTop: 0 }}
              >
                {loadingName ? (
                  <>
                    <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Profile
                  </>
                )}
              </button>

              {/* Status Messages for Form */}
              <div style={{ flex: 1 }}>
                {nameError && (
                  <div className="profile-alert profile-alert-error">
                    <AlertCircle size={16} /> {nameError}
                  </div>
                )}
                {nameSuccess && (
                  <div className="profile-alert profile-alert-success">
                    <CheckCircle size={16} /> Your profile has been updated successfully.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
