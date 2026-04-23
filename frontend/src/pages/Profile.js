import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaCamera, FaPen, FaEnvelope, FaPhoneAlt, FaBirthdayCake } from "react-icons/fa";

function Profile() {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [profile, setProfile] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    age: "",
    weight: "",
    height: "",
    goalSteps: 10000,
    photoUrl:
      localStorage.getItem("photo") ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: token },
      });

      const fetchedPhoto =
        res.data.profile.photoUrl ||
        localStorage.getItem("photo") ||
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80";

      setProfile({
        username: res.data.username,
        fullName: res.data.profile.fullName || "",
        email: res.data.profile.email || res.data.username || "",
        phone: res.data.profile.phone || "",
        dob: res.data.profile.dob || "",
        age: res.data.profile.age || "",
        weight: res.data.profile.weight || "",
        height: res.data.profile.height || "",
        goalSteps: res.data.profile.goalSteps || 10000,
        photoUrl: fetchedPhoto,
      });

      localStorage.setItem("photo", fetchedPhoto);
    } catch (error) {
      alert("Failed to load profile");
    }
  };

  const saveProfile = async () => {
    try {
      await axios.put(
        "http://localhost:5000/profile",
        {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          dob: profile.dob,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goalSteps: profile.goalSteps,
          photoUrl: profile.photoUrl,
        },
        {
          headers: { Authorization: token },
        }
      );

      localStorage.setItem("photo", profile.photoUrl);
      alert("Profile updated");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      setProfile((prev) => ({
        ...prev,
        photoUrl: imageData,
      }));
      localStorage.setItem("photo", imageData);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-card premium-profile-card">
        <div className="profile-banner"></div>

        <div
          className="profile-photo-wrapper premium-photo-wrapper"
          onClick={() => fileInputRef.current.click()}
        >
          <img src={profile.photoUrl} alt="Profile" className="profile-photo" />

          <div className="profile-photo-overlay">
            <FaPen className="profile-edit-icon" />
            <span>Edit Image</span>
          </div>

          <button
            type="button"
            className="profile-image-edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
          >
            <FaCamera />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-header-info">
          <h1>{profile.fullName || profile.username || "User"}</h1>
          <p className="profile-role">Personal Fitness Profile</p>

          <div className="profile-contact-strip">
            <span><FaEnvelope /> {profile.email || "No email added"}</span>
            <span><FaPhoneAlt /> {profile.phone || "No phone added"}</span>
            <span><FaBirthdayCake /> {profile.dob || "No DOB added"}</span>
          </div>
        </div>

        <div className="profile-section-title">Personal Information</div>

        <div className="profile-form-grid premium-profile-grid">
          <input
            type="text"
            placeholder="Full name"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="Phone number"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />

          <input
            type="date"
            value={profile.dob}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
          />

          <input
            type="number"
            placeholder="Age"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={profile.weight}
            onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
          />

          <input
            type="number"
            placeholder="Height (cm)"
            value={profile.height}
            onChange={(e) => setProfile({ ...profile, height: e.target.value })}
          />

          <input
            type="number"
            placeholder="Goal steps"
            value={profile.goalSteps}
            onChange={(e) => setProfile({ ...profile, goalSteps: e.target.value })}
          />
        </div>

        <div className="profile-btn-row">
          <button className="btn btn-primary" onClick={saveProfile}>
            Save Profile
          </button>
          <Link to="/dashboard" className="btn btn-ghost dark-link-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;