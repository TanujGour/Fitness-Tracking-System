import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaPen,
  FaEnvelope,
  FaPhoneAlt,
  FaBirthdayCake,
} from "react-icons/fa";

function Profile() {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const defaultPhoto =
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80";

  const [heightUnit, setHeightUnit] = useState("cm");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

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
    photoUrl: "",
  });

  const getDisplayPhoto = () => {
    return profile.photoUrl || localStorage.getItem("photo") || defaultPhoto;
  };

  const cmToFeetInches = (cm) => {
    if (!cm) return { ft: "", inch: "" };
    const totalInches = Number(cm) / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = Math.round(totalInches % 12);
    return { ft, inch };
  };

  const feetInchesToCm = (ft, inch) => {
    const totalInches = Number(ft || 0) * 12 + Number(inch || 0);
    return totalInches ? Math.round(totalInches * 2.54) : "";
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: token },
      });

      const backendPhoto = res.data.profile.photoUrl || "";
      const localPhoto = localStorage.getItem("photo") || "";
      const finalPhoto = backendPhoto || localPhoto || "";

      const fetchedHeight = res.data.profile.height || "";

      setProfile({
        username: res.data.username,
        fullName: res.data.profile.fullName || "",
        email: res.data.profile.email || res.data.username || "",
        phone: res.data.profile.phone || "",
        dob: res.data.profile.dob || "",
        age: res.data.profile.age || "",
        weight: res.data.profile.weight || "",
        height: fetchedHeight,
        goalSteps: res.data.profile.goalSteps || 10000,
        photoUrl: finalPhoto,
      });

      if (finalPhoto) {
        localStorage.setItem("photo", finalPhoto);
      }

      const converted = cmToFeetInches(fetchedHeight);
      setFeet(converted.ft);
      setInches(converted.inch);
    } catch (error) {
      alert("Failed to load profile");
      console.error(error);
    }
  };

  const saveProfile = async () => {
    try {
      const finalHeight =
        heightUnit === "cm" ? profile.height : feetInchesToCm(feet, inches);

      const payload = {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob,
        age: profile.age,
        weight: profile.weight,
        height: finalHeight,
        goalSteps: profile.goalSteps,
        photoUrl: profile.photoUrl,
      };

      const res = await axios.put(`${API_URL}/profile`, payload, {
        headers: { Authorization: token },
      });

      const savedPhoto =
        res.data?.profile?.photoUrl || profile.photoUrl || localStorage.getItem("photo") || "";

      if (savedPhoto) {
        localStorage.setItem("photo", savedPhoto);
      }

      setProfile((prev) => ({
        ...prev,
        height: finalHeight,
        photoUrl: savedPhoto,
      }));

      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data || "Failed to update profile");
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
          <img src={getDisplayPhoto()} alt="Profile" className="profile-photo" />

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
          <div className="field-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Age</label>
            <input
              type="number"
              placeholder="Enter age"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              placeholder="Enter weight"
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
            />
          </div>

          <div className="field-group full-width">
            <label>Height</label>

            <div className="height-unit-toggle">
              <button
                type="button"
                className={heightUnit === "cm" ? "unit-btn active" : "unit-btn"}
                onClick={() => setHeightUnit("cm")}
              >
                CM
              </button>
              <button
                type="button"
                className={heightUnit === "ft" ? "unit-btn active" : "unit-btn"}
                onClick={() => setHeightUnit("ft")}
              >
                FT / IN
              </button>
            </div>

            {heightUnit === "cm" ? (
              <input
                type="number"
                placeholder="Enter height in cm"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              />
            ) : (
              <div className="height-split-row">
                <input
                  type="number"
                  placeholder="Feet"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Inches"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="field-group full-width">
            <label>Daily Goal Steps</label>
            <input
              type="number"
              placeholder="Enter goal steps"
              value={profile.goalSteps}
              onChange={(e) => setProfile({ ...profile, goalSteps: e.target.value })}
            />
          </div>
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